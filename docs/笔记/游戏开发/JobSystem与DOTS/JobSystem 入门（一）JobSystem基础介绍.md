# JobSystem与Burst
在Unity中我们要使用JobSystem，则需要先下载Burst和Job对应的插件。
JobSystem会将托管代码转换到原生代码，在burst重新进行编译。

# JobSystem的资源竞争与安全处理

## 资源竞争
> 资源竞争:比如C#主线程发送一个数据的引用给一个Job，Job在写入时无法判断主线程是否也在同时操作该数据，则发生资源竞争。

为了让用户更容易地编写多线程代码，Unity中的C# Job System会**检测所有潜在的资源竞争**

## 值类型传输
 Job System拷贝数据的方式表明了一个Job能访问可以**位块传输的数据类型**(blitable data types)，也就是值类型的数据。

这种数据类型在托管代码和原生代码之间进行传递的时候不需进行类型转换（即:C#的值类型和C++的值类型相互转换）

Job System可以使用[memcpy](https://zhida.zhihu.com/search?content_id=100935477&content_type=Article&match_order=1&q=memcpy&zhida_source=entity)来拷贝可位块传输数据，并在Unity的托管部分和原生部分之间传递它们。它在安排job时使用memcpy将数据放入原生内存，并给予托管部分在job执行时访问这份拷贝数据的接口。

# 本地共享内存容器NativeContainer 

NativeContainer是一种托管的数据类型，为原生内存提供一种相对安全的C#封装。它包括一个指向[非托管](https://zhida.zhihu.com/search?content_id=100935477&content_type=Article&match_order=1&q=%E9%9D%9E%E6%89%98%E7%AE%A1&zhida_source=entity)分配内存的指针。

当和Unity C# Job System一起使用时，一个NativeContainer使得一个Job可以访问**和主线程共享的数据**，而不是在一份拷贝数据上工作。

简单来说，就是共享内存的容器。

## Unity的NativeContainer有哪些？
- NativeArray：顾名思义，这是一个数组
- NativeSlice：用来操作一个NativeArray，获取从某个位置开始的NativeArray

Entity Component System(ECS)包扩展了unity.Collections命名空间，包含了一些其他的NativeArray：
- NativeList - 一个可变长的NativeArray（对应Unity的List列表）
- NativeHashMap - 键值对（对应Dictionary字典）
- NativeMultiHashMap - 每个Key可以对应多个值
- NativeQueue - 一个先进先出(FIFO)队列


# NativeContainer和其安全性系统

## 内存读写追踪
安全性系统是所有NativeContainer类型的组成部分。
- 它会**追踪所有**关于任何NaiveContainer的**读写**。
- 所有安全性检查只会在UnityEditor和PlayMode中生效（比如下标边界，内存释放检查，资源竞争见检查）
- 有资源竞争问题，会抛出一个异常

## 添加依赖处理资源竞争
如果出现资源竞争情况，你可以在**安排job的时候添加一个依赖**。

第一个job可以写入到NativeContainer，一旦它执行完毕，下一个job可以安全地读取和写入同一个NativeContainer。

读取和写入的限制同样影响在访问[主线程](https://zhida.zhihu.com/search?content_id=100935477&content_type=Article&match_order=5&q=%E4%B8%BB%E7%BA%BF%E7%A8%8B&zhida_source=entity)中的数据时生效。

## 只读:不会触发资源竞争
安全性系统允许多个jobs并行的读取同一份数据。

准确来说时，一个拥有**读写权限**的job工作时，不允许安排另一个带有**写权限**的job。

如果某个NativeContainer不需要写入，则可以加上ReadOnly属性提供只读权限
```c#
[ReadOnly]
public NativeArray<int> input;
```

## 没有静态数据保护
jon并没有针对静态数据保护，访问静态数据会绕过所有安全性系统，并且有可能Unity导致崩溃。


# NativeContainer分配器(Allocator)

## 指定分配类型
当创建一个NativeContainer时，你必须指定你需要的内存分配类型。分配的类型由jobs运行的时间来决定。这种情况下你可以在每一种情况下使分配器达到可能的最好性能。有三个分配器类型可以提供选择
- Allocator.Temp
- Allocator.TempJob
- Allocator.Persistant

## 分配器比较

| 类型<br>                | 速度  | 生命周期            | 使用特点                                                  |
| --------------------- | --- | --------------- | ----------------------------------------------------- |
| Allocator.Temp<br>    | 快   | 1帧或更短的操作        | 一个函数返回前就调用Dispose方法，不能传给jobs适用。                       |
| Allocator.TempJob<br> | 中等  | 4帧内存分配          | **线程安全**，需要在四帧内调用Dispose，否则会打印一个警告。**绝大部分小jobs**使用此类型 |
| Allocator.Persistant  | 慢   | 长期持续，甚至可以贯穿程序始终 | 直接调用malloc的一个封装，**适合长时间的jobs**，不适合在性能紧张的时候使用          |

## 使用分配示例
```c++

NativeArray<float> result = new NativeArray<float>(1, Allocator.TempJob);

```