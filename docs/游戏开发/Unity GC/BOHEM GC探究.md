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

* 非分代：意味着要遍历整个内存
* 非压缩：意味着内存碎片化的问题

这部分源码其实unity是公开的，就在Editor/data/il2cpp/libil2cpp/gc下

### 3.1 实现
1. 准备阶段：所有对象的MarkBit标记位重置为0，表示当前是否被引用。
2. 标记阶段：从Root节点（静态变量、寄存器、栈）出发进行扫描，将**可达对象进行标记为1**。
3. 清理阶段：扫描**托管堆**，将所有未标记的对象返回给对应的FreeList，清空并以一定条件释放。
4. 结束阶段：触发注册过的回调逻辑，将终结器的**无效对象加入终结器队列**单独处理。

## 3.2 内存分配
* 大内存：GC_HBLKFreeList查找空闲块/系统调用分配
* 小内存：数据对齐后ok_FreeList查找/GC_HBLKFreeList/系统调用查找
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