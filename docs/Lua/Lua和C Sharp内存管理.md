** 菜鸟教程的 Lua 板块： **https://www.runoob.com/lua/lua-tutorial.html
**Lua 5.3 中文手册：**https://www.runoob.com/manual/lua53doc/
**Aegisub 中文手册：**https://aegi.vmoe.info/docs/3.2/Main_Page/
https://www.jb51.net/books/697769.html
https://pan.baidu.com/s/1XiqiT9lLvnfGJfyrWQ87aA 提取码：ycxt

Mono 和 IL2CPP 的区别
 [【Unity 游戏开发】Mono 和 IL2CPP 的区别 - 知乎 (zhihu.com)](https://zhuanlan.zhihu.com/p/352463394)
 [解读 MONO 内存管理和回收 - 知乎 (zhihu.com)](https://zhuanlan.zhihu.com/p/41023320)
 [解读 MONO 内存管理：BOEHM GC 原理及总结 - 知乎 (zhihu.com)](https://zhuanlan.zhihu.com/p/41398507)

引用计数法
标记清除法

垃圾收集的意义
解放程序员对内存管理的负担，减少无效指针和内存泄漏的发生。
但有些时候也需要人为的去管控（停止和运行），此外还有驻留内存和外部资源等问题

# LUA 垃圾收集
Lua 本身缺乏删除对象函数，只能通过 GC 自动地删除对象。
## 一. 主要机制
增量式回收，弱引用表、析构其和函数 collectgarbage
### 1.1 弱引用表
- 对象位置赋值为 nil，以便这些位置不会锁定可释放的对象
- 一个对象插入数组，就再也不能回收（简单的活跃列表）
- 弱引用表：告知一个引用不应该阻止对一个对象回收的机制
    - 表：键和值都是强引用。
    - 弱引用表：键，值都是弱引用（三种），只要有一个键或者值被回收，那么整个键值对一起回收了。
    - 标记：元表的__ mode 字段。k--键弱引用，v 值弱引用，kv 键和值都是弱引用。
```lua
a = {}

mt = {__mode =”k”}

setmetatable(a, mt) --现在’ 的键是弱引用的了

key = {}             --创建第 个键

a[key] = 1

key = {} --创 建第 个键

a[key] = 2

co1lectgarbage()         --强制进行垃圾回收

fo v in pai do int(v) end

--> 2
```
- 此外，只有**对象**可以被删除，而**值（数字、布尔、字符串）** 是不能被回收的。
    - 因此，插入一个数值类型的键（值不是弱引用），则垃圾回收器永远不会去回收他
## 1.2 记忆函数
- 提出：缓存的逐渐堆积造成资源浪费、耗尽内存
- 让 results 缓存具有弱引用的值（字符串，可以全都设为弱引用），方便进行回收
- 确保某类的唯一性，如：两种同时存在的颜色必定是由同一个来表示的

## 1.3 对象属性
- 外部表

# Unity MONO GC - BOEHM
1.  **GC_obj_kinds[3]**
- 指针内存
- **普通内存**
- 非回收内存（内存管理）
2.每个非内存元素包含一个 ok_freelist[MAXOBJGRANULES+1]
- 每个元素为一个 16 字节的的分配粒度
- MAXOBJGRANULES 为 128
- 总体为 128X16 = 2048 字节，这恰好是能分配的小内存上限

这个数组每个元素又为一个**空闲链表的指针**，指向的内存块大小是 index * 16：
- 第一块为 16 字节大小快的的链表指针
- 第 128 个元素存储的链表中内存块大小为 128*16=2058.

其作用为：
- 分配内存时，优先检查该链表是否存在 FREE 块
- 否，再次调用分配函数，分配较大一块内存，然后将大内存分割为小内存链表存储在 ok_freeList 中
