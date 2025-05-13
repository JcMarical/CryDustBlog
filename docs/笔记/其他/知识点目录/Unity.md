# 一.自己做的游戏内容

# 二.Lua内容 TODO
- 哪些数据类型，元表含义，闭包含义（数据存储怎么做的）？值拷贝和引用拷贝？
- 协程实现：TODO
- 热更新原理？热更新怎么修lua代码的bug？：TODO
- 垃圾回收：TODO，如何Mark？
- C#和Lua的交互：TODO
- table：怎么做table的深拷贝？判断是否是数组？
- 元表：如何实现继承、重写、重载。派生类要调用基类版本。
- Unity对象传到Lua会得到什么？
- lua如何访问C#对象的成员？
- lua反射
### 场景
- Lua某个类已经实例化了一堆对象，如何用热更新去影响？
## 热更新
### 资源热更新
AB包，AA包
### 代码热更新
- xlua，lua
- 新时代的方案Hybrid，ILRuntime

# 三 C#内容

## 值与引用
- 值类型（代表sturct，内存单元存引用保存的是地址，自动释放）
- 引用类型（代表class，string是引用）。
- 都可以继承，值继承自System.ValueType，另一个是System.Object

## 装箱和拆箱
装箱：值转引用，默认进行，创建了个指针指向原内存空间
拆箱：引用转值，强制转换，实质是拷贝了一块内存
优化：分配和销毁会占用大量CPU并增加内存碎片，所以要优化
- 利用重写函数和泛型来避免拆箱、装箱


## 接口、类和sturct
- 结构体仅能实现接口，不能继承其他类型
- 类则支持单继承和多重继承
## using的使用
- 引入命名空间，定义命名空间别名，定义域自动释放资源并调用IDisposable

## 构造函数不能被重写，但可以被重载

## Interface与抽象类
- 接口:多继承、完全抽象、不能实例化，
- 抽象类：单继承、部分抽象、间接实例化

## const与readonly
- const：必须在声明时赋值，编译时确定，默认为静态
- readonly：声明时赋值或构造时赋值，运行时常量。

## event和delegate
- event只比delegate多了一个变量权限的封装。
- 删除了=号的权限，避免了多人合作时的随意清空，实现谁注册谁销毁的目的


## C#反射原理




## 委托
## 协程
MoveNext（）

# 四 Unity部分

## 3.1 生命周期
- update（渲染帧）和fixedupdate（物理帧）底层原理

## 3.2 UGUI
适配ugui，

纹理图集，一张纹理
静态合批
动态合批
动静分离
UGUI的渲染顺序。

## 3.3Boehm GC


## 3.4 IL2CPP原理
IL2CPP会将C#编译的中间语言（IL）转换为高度优化的C++代码，再编译为平台相关的原生机器码。相比Mono的即时编译（JIT）或解释执行，原生代码运行效率更高，尤其在复杂计算、高频调用等场景下性能提升显著。
- 为不同平台提供了一致的代码转换流程
- 支持AOT（提前编译）：程序**运行前**完成所有代码的编译（如构建阶段），直接生成平台相关的二进制文件，类似于静态编译但保留一部分元数据（反射）。而C#是JIT（IOS、PS、Switch等平台并不支持），先编译为IL，程序启动后再通过CLR加载IL编译为机器码，最后到CPU执行了
- 高性能（减少内存占用和运行时开销），更安全（更难逆向工程）。
缺点：编译时间长、不支持动态代码生成。


## DOTS
本质是一套通用解决方案，包含Burst Compile，JobSystem与ECS不分
整套方案脱离了GC和面向对象
## Burst
通过LLVM将C#代码编译为高度优化的本地机器码，绕过传统C#的JIT编译过程，
拥有SIMD技术。有效处理**数学运算、并行任务、多线程优化**的核心工具
## JobSystem
- **NativeContainer共享容器**：仅支持非托管类型，无GC，直接操作原生内存。
	- 使用问题：必须自己设定Dispose()卸载内存。
- 【ReadOnly】特性：锁定权限，只能在构造job时赋值。跨线程同步放置数据竞争。
- JobSystem：
	- IJobFor：数据+Execute。作业调度分配到多线程上
	- IJobParelleFor并行化：
ComputeShader：计算着色器，
- Job:Allocator分为Temp短期，Persistant长期内存，TempJob跨多线程job。
- Schedule：调度策略

## ECS部分
有个界面单独显示Entity和Component组件。
- World：ComponentSystem，EntityManager
- Entity:
	- 本质
	- 组合原型ArcheType
	- EntityQuery
- Component：一个类型的component全部存一起
- System：指定一些组件，遍历拥有这些组件的实体
	- SystemBase
	- 生命周期：OnStartRunning、OnUpdate、OnStopRunning、OnDestroy
	- Entities.Foreach遍历
	- Job.WithCode匿名Job
	- IJobChunk机制
- Archytype：表示一组实体（Entity）共享的**组件类型组合**


## ECS战斗交互
首先，Unity6有个runtime模式，可以很好的查看运行中的entity及其组件。

## GameObject 转化成 Entity
GameObject通过专门的Baker类可以直接转换到Unity Entity并被查看。
- RefRW类型：允许读写，适用于并行编程的引用包装。



## 初始化
Flag类型的Component  ，继承子IEnableComponent。
特性UpdateInGroup
举个例子，写一个System，查找那个Flag组件：
- 调用OnUpdate函数，EnabledRefRW设置flag。
- RefRW设置物理组件初速度为0。
- 设置flag为false

后面找不到组件了，所以update就相当于只执行了一次


## 敌怪获取到玩家信息

### 1.设置移动的JobEntity
- 一个变量：记录玩家位置
- 一个方向
- LocalTransforn，转换后的Trasform
方向 = 玩家位置 - LocalTransforn


### 2.system的update
-获取单例Entity（如根据PlayerTag获得）。
- 新建之前做的Job，根据玩家Entity，初始化玩家位置。
- 执行Schedule

## 攻击逻辑
首先，继承ICollisionEventsJob，写一个job
- 获取玩家Component组
- 获取攻击怪物组
- Excute，传入参数collisionEvent
	- 判断event中EntityA是否在玩家组
	- 判断event中EntityB是否在怪物攻击组
	- 反过来的逻辑再判断一次
执行攻击逻辑。
  

# 五 游戏技术

## 5.1 MVC、MVVM设计
- 怎么写背包
- 和MVVM区别在哪里？

## 5.2层次结构与包围盒
- AABB、八叉树、BVH、KDTree等优劣、BSP

## 寻路
## A*
一个视频看了写一下就够了：[【手把手教你】Unity中实现A星寻路算法_哔哩哔哩_bilibili](https://www.bilibili.com/video/BV147411u7r5/?spm_id_from=333.337.search-card.all.click&vd_source=6244aa070a169733971e833c530f4296)

优化：
- 最终路径判断（不是关闭列表），死路判断。
- 堆排序存关闭列表
- 空间结构加速寻路



---------------------
## NevMesh Unity自带的寻路



## ACT

## 技能系统，UE-GAS

## 网络




