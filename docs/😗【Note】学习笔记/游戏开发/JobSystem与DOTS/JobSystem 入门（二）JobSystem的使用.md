
# 一 、创建Jobs

## 实现IJob接口
Unity中要创建首先要实现Ijob接口，Ijob允许你调度一个Job并和其他的Jobs并发执行


## 添加成员变量
创建一个实现IJob的结构体，添加job需要使用的成员变量（可以是值类型或NativeContainer类型）

注意，除了NativeContainer，每个job的数据都是经过拷贝后进行操作的，因此**主线程访问一个job的唯一方法**就是将数据写入NativeContainer

## 添加Excute的方法执行逻辑
该方法专门用来处理处理逻辑实现，结构体中添加一个叫**Execute**的方法并将job的具体逻辑实现放在里面。


## Job创建例子
```c++
public struct MyJob : IJob
{
	public float a;
	public float b;
	public NativeArray<float> result;

	public void Execute()
	{
		result[0] = a+b;
	}
}
```


# 二 、调度Jobs


## 主线程Schedule将Job放入执行队列。
主线程要调用一个job，必须实例化一个job并填充job中的数据，再调用主线程中的Schedule方法。

合适的时间调用**Schedule**将job放入到job的执行队列，一旦job被调度，该job的执行不能被打断。


## 调度Job例子
```c++
NativeArray<float> result = new NativeArray<float>(1, Allocator.TempJob);

// 实例化和并填充数据（对象数据和共享数据）
MyJob jobData = new MyJob();
jobData.a = 10;
jobData.b = 10;
jobData.result = result;

// Schedule the job
JobHandle handle = jobData.Schedule();

// 等待Job的执行结束
handle.Complete();

// 可以从共享内存中拿到计算结果后的数据
float aPlusB = result[0];

// 共享内存的内存
result.Dispose();
```


## 利用Schedule和 JobHandle实现jobs间依赖
使用**Schedule**方法时会返回一个JobHandle

我们可以在代码中使用JobHandle作为其他jobs的依赖关系。如果一个job依赖于另一个job的结果，那么我们可以将第一个job的jobHandle作为参数传递给第二个job的Schedule
```c#

JobHandle firstJobHandle = firstJob.Schedule();
secondJob.Schedule(firstJobHandle);

```

## 组合依赖
如果一个job有多个依赖项，则可以使用**JobHandle.CombineDependencies**方法来合并。
**CombineDependencies**允许你将多个**JobHandle形成的数组**传递给**Schedule**方法
```c++

NativeArray<JobHandle> handles = new NativeArray<JobHandle>(numJobs, Allocator.TempJob);

//省略填充handles过程...


//一次性全部执行
JobHandle jh = JobHandle.CombineDependencies(handles);

```


## 主线程中使用Complete等待jobs结束
使用JobHandle，目的是让代码在主线程中等待直到job执行完毕。

当我们需要重新让主线程安全访问NativeContainer，则需要调用Complete方法等待job结束并移交对NativeContainer的控制权。

代码暂略



# 三.并行化Job接口IJobParallelFor
> 当调度Jobs时，只能有一个job来进行一项任务。在游戏中，非常常见的情况是在一个庞大数量的对象上执行一个相同的操作。

这里有一个独立的job类型叫做**IJobParallelFor**来处理此类问题。
## 运作原理
并行化job横跨多个核心执行。每个核心上有一个job，每个job处理一部分工作量。

IJob只执行一个Excute方法，而IJobParallelFor会在他的数据源(即NativeArray类型的数据)中的每一项都执行一个带参的Excute方法。
```c#
    public void Execute (int index)
    {
    
    }
```
**Execute**方法中有一个整数型的参数。这个索引是为了在job的具体操作实现中访问和操作数据源上的单个元素。

> 如果你学过ComputeShader，那其实这玩意儿可以理解成线程ID

## 并行化IJob例子
```c++
struct IncrementByDeltaTimeJob : IJobParallelFor
{
	public NativeArray<float> values;

 public float deltaTime;

    public void Execute (int index)
    {
        float temp = values[index];
        temp += deltaTime;
        values[index] = temp;
    }

}
```


# 四.调度并行化Job
## 分割数据源
在使用并行化job时，必须分割数据源的长度，因为
- 结构中存在多个数据源时，JobSystem无法分辨NativeArray要使用哪一个作为数据源。
- 同时，这个长度会告知有多少个Excute将会被执行


## 工作原理
并行化Job的主要流程如下：
1. 分配：当调度并行化任务时，C# Job System会将工作分成多个批次，分发给不同的核心来处理。每一个批次都包含一部分的**Execute**方法。
2. 传递：随后jobsystem会将一些批次的工作传给每个核心上的job
3. 再分配：当一个原生Job**提前完成**了分配给他的工作批次后，他会从其他原生job获取剩余的工作批次。（为了确保局部缓存性，每次只获取原生job剩余批次的一半）

![[Pasted image 20250108103314.png]]

## 分配策略
为了优化分配的过程，需要指定每个**批次数量**的大小，每批数量控制会生成多少IJob以及线程分发任务的力度。

举个例子：
- 批次数量为1，线程之间的工作分配更加平均，但会增加更多分配时的开销
- 批次数量增加，分配次数减少，可能不够平均但是分配的开销会大大减少，但批次数量太多又会逐渐又演变回单线程的策略。

具体的分配则需要根据性能来调整，直到最优



## 调度并行化Job的例子
单个Job：
```c++

//多线程数组求和 
public struct MyParallelJob : IJobParallelFor
{
    [ReadOnly]
    public NativeArray<float> a;
    [ReadOnly]
    public NativeArray<float> b;
    public NativeArray<float> result;

    public void Execute(int i)
    {
        result[i] = a[i] + b[i];
    }
}
```

主线程：
```c++

//数据源设置
NativeArray<float> a = new NativeArray<float>(2, Allocator.TempJob);

NativeArray<float> b = new NativeArray<float>(2, Allocator.TempJob);

NativeArray<float> result = new NativeArray<float>(2, Allocator.TempJob);

a[0] = 1.1;
b[0] = 2.2;
a[1] = 3.3;
b[1] = 4.4;

//并行化ijob设置
MyParallelJob jobData = new MyParallelJob();
jobData.a = a;  
jobData.b = b;
jobData.result = result;

// 以1的批次进行并行化计算
JobHandle handle = jobData.Schedule(result.Length, 1);

// 等待完成
handle.Complete();

// 释放内存
a.Dispose();
b.Dispose();
result.Dispose();

```