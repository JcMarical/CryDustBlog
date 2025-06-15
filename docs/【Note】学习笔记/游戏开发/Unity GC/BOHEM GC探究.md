# BOHEM GC探究

## 一 什么是垃圾回收？

对于Unity而言，GC始终是一个绕不开的话题。垃圾回收机制已经广泛存在于各种语言如C#、Lua、Unity中。





## 二 垃圾回收机制有哪些？

### 2.1 引用计数法


###  2.2 根搜索法
又分为：
- Mark-Sweep标记-清除法：标记阶段通过访问根节点，并遍历到叶子节点，最终将所有存在的内存都标记出来，其余未标记的部分可清除释放掉。
- Copying 
- Mark-Impact标记-压缩法

### 2.3 关于GC的一些其他概念
* stop-the-world：可以理解为让GC线程外的所有线程暂停，营造出的停止现象（砸瓦鲁多~）
* 保守式
* 准确式
* 渐进式收集（incremental collection），平行收集（parallel collection）以及终结语意的变化（variety of[finalizer](https://link.zhihu.com/?target=https%3A//baike.baidu.com/item/finalizer/0%3FfromModule%3Dlemma_inlink)semantics）。
* Zimbie Memory 僵尸内存

## 2.4 GC导致的一些问题

* 在游戏关键时刻，单次GC操作STW带来的明显卡顿。
* 如果有大量的变量和引用，检查会非常耗时
* 内存碎片导致的分配效率低下和内存占用过大、GC频繁触发

## 三 Unity的GC机制
由于Unity的Mono版本其实已经在2019.3后升级了，但还是采用的Fork版本，所以Unity则一直采用的BOHEM GC来完成垃圾回收，属于非分代和非压缩的**标记-清除**算法的GC。

1. **stop-the-world**:意味着每次GC都会造成线程停止工作
2. **非分代**：意味着要遍历整个内存
3. **非压缩**：意味着堆内存碎片化的问题，unity不会对堆内存进行碎片整理 ，托管对象的内存地址不会发生变化
	+ 好处在于可以使用指针访问对象

这部分源码其实unity是公开的，就在Editor/data/il2cpp/libil2cpp/gc下

### 3.1 实现
1. 准备阶段：所有对象的MarkBit标记位重置为0，表示当前是否被引用。
2. 标记阶段：从Root节点（静态变量、寄存器、栈）出发进行扫描，将**可达对象进行标记为1**。
	1. 暂停所有线程，访问各个线程堆栈以及GC根节点对象，遍历搜索整个引用树，，按照4字节/8字节（32/64位对齐，判断每个数据是不是**有效指针**）
	2. Boemh会记录分配堆内存的低地址和高地址，若指针落在该区间，则认为其可能是一个指针，再通过二级数组获取该指针对应的HBLKHDR信息。
	3. 找到HBLKHDR后，会检查该PAGE状态，若为空闲，则忽略该指针(因为未指向有效对象)，若已使用，则标记该指针指向的Obj为使用状态，并将对应的标记位设置为可用然后再遍历该Obj，找出可能的指针，并一一标记。（引用遍历之前会清除所有HBLKHDR的标记字段）
	4. 若整个HBLKHDR所有标记都未被设置，则会将HBLKHDR还回到GC_hblkfreelist中，并且会根据其地址，将相邻的hblk块合并成大的块，并调整其在GC_hblkfreelist中的存储位置
3. 清理阶段：扫描**托管堆**，将所有未标记的对象返回给对应的FreeList，清空并以一定条件释放。
4. 结束阶段：触发注册过的回调逻辑，将终结器的**无效对象加入终结器队列**单独处理。

## 3.2 内存分配
* 大内存：GC_HBLKFreeList查找空闲块(以4k为单位分配hblk内存块，每个对应一份hblkhdr内存分页信息)/系统调用分配
* 小内存(2k以下)：数据对齐后ok_FreeList（每个数组固定大小为MAXOBJGRANULES+1，取决于32/64位环境(128/256)）查找/GC_HBLKFreeList查找空闲块/系统调用分配
* BoehmGC分配的内存有多种不同类型，几种常见的内置内存类型如下：
	- **PTRFREE：** 无引用类型，如int数组，string等，不需要标记回收
	- **NORMAL：** 常规类型，需要参与标记和回收
	- **UNCOLLECTABLE：** GC内存管理使用的内存，不需要标记回收
![](Pasted%20image%2020240929204031.png)

* hblkhdr信息：由GC_HBLKFreeList分配内存时生成，hblk块分配/拆分时生成hdr对象，hblk合并或者释放时回收hdr对象
	* hb_sz：表示hblk块大小
	* hb_marks：当hblk被拆分成小内存，hb_marks用来标记哪些小内存块被使用（1个bit一小块）
	![](Pasted%20image%2020240929203950.png)


* 托管堆分配：
	* 托管堆内存不足时会调用GC_collect_or_expand，首先尝试执行GC，如果内存依然不足则要分配新内存  
下面blocks_to_get计算的就是实际需要分配的内存大小  
Block单位为4K，内存分配最小值为256K，最大值为16M，  
其中参数GC_free_space_divisor=3，大体上就是按托管堆1/3大小+当前请求内存大小，  
如果大于16M则取当前请求内存和16M中的较大者，小于256K则按256K分配

```c++
	    blocks_to_get = GC_heapsize/(HBLKSIZE* GC_free_space_divisor) + needed_blocks;
		if (blocks_to_get > MAXHINCR) {
			  word slop;
			
			  /* Get the minimum required to make it likely that we can satisfy */
			  /* the current request in the presence of black-listing.          */
			  /* This will probably be more than MAXHINCR.                      */
			  if (ignore_off_page) {
			    slop = 4;
			  } else
			{
			    slop = 2 * divHBLKSZ(BL_LIMIT);
			    if (slop > needed_blocks) slop = needed_blocks;
			}
			if (needed_blocks + slop > MAXHINCR)
			{
			    blocks_to_get = needed_blocks + slop;
			}
			else
			{
			    blocks_to_get = MAXHINCR;
			}
		}
```
##  3.3 新版本Incremental GC 渐进式GC

解决了主线程卡顿问题，会进行分帧GC，减轻峰值的诞生

* 分解的是标记阶段
* 对象发生变化、下一次迭代中需要再次扫描已更改的对象。因此导致永远搜集不玩的情况，此时会回退到执行完整的非增量手机。
* 若饮用改变过多，增量GC的性能会比非增量差。（更改引用通知GC造成的开销）

| ![image-20240829003915333](https://crydustblog.oss-cn-chengdu.aliyuncs.com/image-20240829003915333.png) | ![image-20240829003928104](https://crydustblog.oss-cn-chengdu.aliyuncs.com/image-20240829003928104.png) |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| 原BohemGC                                                    | 启用增量式GC                                                 |



## 3.4 IL2CPP GC

GC的机制Unity进行了重写，升级版Bohem



## 3.5内存最佳实践

- 用Destory别用NULL
- CLass VS Struct
- 池中池，对高频使用小组件单独建立内存池
- 闭包和匿名函数：编成一个匿名的Class
- 协程：没有被释放的长期存在的内存，请即用即丢
- 配置表：几个G干进内存（切分、分关）
- 单例：Singleton长期存在占用内存

# 资料来源

* [[Unity 活动\]-浅谈Unity内存管理_哔哩哔哩_bilibili](https://www.bilibili.com/video/BV1aJ411t7N6/?vd_source=60173b91c5d0a0bed2ae426307dcc6b5)

* [Unity2019新特性增量式垃圾回收[译文\] - 哔哩哔哩 (bilibili.com)](https://www.bilibili.com/read/cv3260881/)

- [Unity Boehm GC不完全解析 - 知乎 (zhihu.com)](https://zhuanlan.zhihu.com/p/716855963)
- [(29 封私信) Jamin - 知乎 (zhihu.com)](https://www.zhihu.com/people/liang-zhi-ming-70/posts)