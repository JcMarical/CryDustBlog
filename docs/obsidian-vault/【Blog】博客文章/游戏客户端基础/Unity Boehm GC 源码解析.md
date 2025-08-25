
# 前言
最近的游戏开发面试，已经开始有面试官针对GC细节进行详细的考察了。而网上GC资料大多都是东拼西凑，很少有从源码层面开始解析的。

鉴于不同的Unity版本有时效性，尤其是2019之后Unity支持了IncrementalGC增量式GC，这里就先标定一个2019版本后2023.2.20f1c提供参考。
- monogc的动态库位置：2023.2.20f1c1\Editor\Data\PlaybackEngines\windowsstandalonesupport\Variations\win64_player_development_mono\MonoBleedingEdge\EmbedRuntime\mono-2.0-bdwgc.dll
- **源码位置**：编辑器目录下的2023.2.20f1c1\Editor\Data\il2cpp\libil2cpp\gc

# Unity Boehm GC特点
- 标记--清除法
- 保守式回收
- 增量式回收（2019新增）
	- 提供时间片限制
- 延迟GC功能
- 手动手机和自动收集切换
# 目录结构梳理：
- Allocator.h：定义​**​内存分配器模板​**​（如`SecureAllocator`），支持类型安全的内存分配与释放
- AppendOnlyGCHashMap.h：优化GC的​**​哈希表数据结构​**​，采用“仅追加”（Append-Only）设计，避免写屏障开销，提升增量GC期间性能
- **BoehmGC.cpp**：实现Boehm保守式垃圾回收器的核心逻辑
- GarbageCollector.cpp：封装Unity对GC的​**​高层控制接口​**​，如GC触发条件（内存不足时）、运行模式切换（增量/非增量）、暂停与恢复等
- GarbageCollector.h
- gc_wrapper.h：提供​**​Boehm GC与Unity运行时的适配层​**​，将C接口封装为C++类，便于集成到引擎的托管堆管理系统。
- GCHandle.cpp
- GCHandle.h：实现​**​托管对象句柄​**​（`GCHandle`），用于在原生代码中​**​跨域引用托管对象​**​，防止GC误回收。
- NullGC.cpp：提供​**​空GC实现​**​，用于调试或特殊场景（如无托管堆的项目），禁用自动内存回收
增量GC支持模块：
- WriteBarrier.cpp：实现​**​写屏障（Write Barrier）​**​，监控对象引用变更（如字段赋值）。增量GC依赖此机制​**​防止漏标**
- WriteBarrier.h
- WriteBarrierValidation.cpp：在​**​开发阶段验证写屏障的正确性​**​，检测非法内存访问或屏障逻辑错误，确保GC安全
- WriteBarrierValidation.h



# 一 GarbageCollector
## 基础数据结构
CCW：COM Callable Wrapper
- 跨语言的二进制组件模型，核心是接口与引用计数
这是一个CCW缓存的结构，我们可以看到Unity提供了一个哈希表将将所有的Il2cPP对象和具体的CachedCCW存放在了一起。并提供了一个互斥量和CCWCache的静态变量。


```c++
    struct CachedCCW
    {
        Il2CppIManagedObjectHolder* managedObjectHolder;
        bool hasFinalizer;
    };
        typedef Il2CppHashMap<Il2CppObject*, CachedCCW, utils::PointerHash<Il2CppObject> > CCWCache;
    static baselib::ReentrantLock s_CCWCacheMutex;
    static CCWCache s_CCWCache;
```
也提供了一些CacheCCW相关的方法
```c++
     static Il2CppIUnknown* GetOrCreateCCW(Il2CppObject* obj, const Il2CppGuid& iid);
     static void CleanupCCW(void* obj, void* data)
     static bool ShouldInsertIntoCCWCache(Il2CppObject* obj)
     Il2CppIUnknown* GarbageCollector::GetOrCreateCCW(Il2CppObject* obj, const Il2CppGuid& iid)
```

IL2CPP_SUPPORT_THREADS
略，后续补
## 写屏障

## 垃圾回收机制无关的一些功能

#### Finalizer终结器
不太清楚读者知不知道Finalizer终结器的概念，这里简单介绍一下：
首先我们要知道Unity的class要做析构，一般有两种处理方式：
- Dispose方式: 使用时需要类继承自IDisposable接口，一般用于用户在清理内存时去主动调用对应的Dispose()函数（理论上不继承接口，换个名字也可以，这里主要为了统一规范）。
- Finalize方式：写法和C++的析构是一样的，不需要再手动调用。但是具体调用时间未知，因此我们的GC需要收集Finalize来完成它的工作。
```C#
public class FinailzeTest
{
	 ~FinailzeTest(){...}
}
```
我们可以将Dispose的逻辑写进Finalize中，当GC触发时，会执行Finalize相关的逻辑。
此外，GC总是会**手动**从COM里收集对应Il2cpp的析构函数，作为终结器Finalizer注册进行统一析构。

这些就是GC里和Finalizer注册、生成、实现等相关的函数：
```c++
        static void InitializeFinalizer();
        static bool IsFinalizerThread(Il2CppThread* thread);
        static bool IsFinalizerInternalThread(Il2CppInternalThread* thread);
        static void UninitializeFinalizers();
        static void NotifyFinalizers();
        static void RunFinalizer(void *obj, void *data);
        static void RegisterFinalizerForNewObject(Il2CppObject* obj);
        static void RegisterFinalizer(Il2CppObject* obj);
        static void SuppressFinalizer(Il2CppObject* obj);
        static void WaitForPendingFinalizers();
```




都是些静态的结构：





### 垃圾回收控制
垃圾回收控制相关
```c++
        static void Collect(int maxGeneration);
        static int32_t CollectALittle();
        static int32_t GetCollectionCount(int32_t generation);
        static int64_t GetUsedHeapSize();
```


### 分代和压缩
看出来很想做分代了，可惜没有做...直接返回0
```c++
    int32_t GarbageCollector::GetGeneration(void* addr)
    {
        return 0;
    }
      void GarbageCollector::AddMemoryPressure(int64_t value)
    {
    }
```

## GC相关的功能
GarbageCollector和GC相关的功能声明基本上放到BoehmGC里实现了，后面单独拿出来讲。


# 二 BoehmGC GC核心功能
- 根节点s_Roots：采用一个Il2CPP哈希表进行存储一段数据的**起始和末尾地址**
	- Il2CppHashMap，原理基本和STL哈希表一样（​**​哈希桶+链地址法+动态扩容**），提供对C#字典的兼容。
	- PassThroughHash直接以指针地址作为哈希值（而非内容哈希）
```C++
static GC_push_other_roots_proc default_push_other_roots;
typedef Il2CppHashMap<char*, char*, il2cpp::utils::PassThroughHash<char*> > RootMap;
static RootMap s_Roots;
static void push_other_roots(void);
```


## GC初始化Initialize()
- 初始设置
	- 写屏障验证（如果开启写屏障验证功能）
	- 不扫描动态库数据段
	- 非开发版：关闭报错
	- 开启渐进式GC（如果开启写屏障）
		- 如果开启了时间片划分还需要限制时间片



### Profiler
- 引用计数：
- 注册根节点：
	- 