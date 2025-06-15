## **什么是Compute Shader**

1.Compute Shader**独立于渲染管线**，可以认为是在GPU上运行的任意代码块，并可以利用GPU上的并行特点。  
2.没有用户自定义的输入和输出；  
3.Computer Shaders可以被认为是大量的**小型计算机**，又名Work Groups;

Work Groups在行和列上紧密排列，逐个堆叠，组成了一个“三维数组”
![](Pasted%20image%2020241222204431.png)



# 基础操作
定义一个Compute Shader时，可以指明要使用的Work Groups数量

由于其独立于渲染管线，**当一个computeShader被使用时，需要阻塞正常渲染的执行**。并且他也不会渲染任何东西，所以我们需要确保渲染目标纹理和其他数据已经准备好了。




>如果要光线追踪加速，需要从每一个屏幕像素点射出，那就是(屏幕宽度、屏幕高度，1)来加速。


这些Work Group是相互独立的，所以他们不应该互相依赖；

在这些Work Group之内，也有大量的threads（线程），叫做Invocation（调用），但Invocation之间的关系和Work Group之间不同，他们可以互相调用：

# Work Group Size
每一个GPU生产商（如NV和[AMD](https://zhida.zhihu.com/search?content_id=237717046&content_type=Article&match_order=1&q=AMD&zhida_source=entity)）都对特定大小的GroupSize做了优化，被叫做[WARP](https://zhida.zhihu.com/search?content_id=237717046&content_type=Article&match_order=1&q=WARP&zhida_source=entity)（Wavefront），视频中列举的[NVIDIA](https://zhida.zhihu.com/search?content_id=237717046&content_type=Article&match_order=1&q=NVIDIA&zhida_source=entity) GPU的WARP是32，AMD的WARP是64。

**线程组中的基本执行单位叫做wavefront**，GCN架构中的每个wavefront由64个线程组成，这个是[A卡](https://zhida.zhihu.com/search?content_id=237717046&content_type=Article&match_order=1&q=A%E5%8D%A1&zhida_source=entity)的划分方式。

N卡中叫[warp](https://zhida.zhihu.com/search?content_id=237717046&content_type=Article&match_order=1&q=warp&zhida_source=entity)，每个warp32个线程，意思都一样名字不一样而已。
**GCN架构在一个工作组中最多允许有16个wavefront。**

所以我们取16x16x1

unity中是这样定义的
```c++
[numthreads(16,16,1)]
void Main(uint3 id : SV_DispatchThreadID)
{
	//...逻辑
}
```
这样就定义了一个16x16x1的Work Group


# 开始我们的Compute Shader
## 第一部分 宏定义
## 必须做的事：kernel 设置
CSMain其实就是一个函数，在代码后面可以看到，而 kernel 是内核的意思，这一行即把一个名为CSMain的函数声明为内核，或者称之为[核函数](https://zhida.zhihu.com/search?content_id=169975694&content_type=Article&match_order=1&q=%E6%A0%B8%E5%87%BD%E6%95%B0&zhida_source=entity)。这个核函数就是最终会在GPU中被执行。其作用相当于cpp 的 int main
```cpp
#pragma kernel CSMain
```

一个CS中**至少要有一个kernel才能够被唤起**。声明方法即为：
```c++
#pragma kernel functionName
```
我们也可用它在一个CS里声明多个内核，此外我们还可以再该指令后面定义一些预处理的[宏命令](https://zhida.zhihu.com/search?content_id=169975694&content_type=Article&match_order=1&q=%E5%AE%8F%E5%91%BD%E4%BB%A4&zhida_source=entity)，如下：
```c++

#pragma kernel KernelOne SOME_DEFINE DEFINE_WITH_VALUE=1337  
#pragma kernel KernelTwo OTHER_DEFINE

```

## 第二部分：引用
hlsl和compute本身都是c的语法，自然也可以用c的引用。
我们可以用调库的形式去调用hlsl里的方法
```c++
#include "../Base/NoiseLibrary.hlsl"
```
hlsl工具类：
```c
#ifndef NoiseLibrary
#define NoiseLibrary
    /// <summary>
    /// blockmin单格纹理最小坐标:每个格子的坐标乘以每格的大小
    /// </summary>
    int3 GetBlockMin(int blockSize, int3 blockCoord) {
        int3 blockMin;
        blockMin.x = blockCoord.x * blockSize;
        blockMin.y = blockCoord.y * blockSize;
        blockMin.z = blockCoord.z * blockSize;
        return blockMin;
    }

    /// <summary>
    /// blockmax单格纹理最大坐标
    /// </summary>
    int3 GetBlockMax(int blockSize, int3 blockCoord) {
        int3 blockMax;
        blockMax.x = blockCoord.x * blockSize + blockSize;
        blockMax.y = blockCoord.y * blockSize + blockSize;
        blockMax.z = blockCoord.z * blockSize + blockSize;
        return blockMax;
    }
    /// <summary>
    /// 纹理坐标转换到网格坐标
    /// </summary>
    int3 PixelCoordToBlockCoord(int blockSize, int3 pixelCoord) {
        int3 blockCoord;
        blockCoord.x = floor(pixelCoord.x / (float)blockSize);
        blockCoord.y = floor(pixelCoord.y / (float)blockSize);
        blockCoord.z = floor(pixelCoord.z / (float)blockSize);
        return blockCoord;
    }

    /// <summary>
    /// float3映射到[-1,1]随机数采样器
    /// </summary>
    float3 GetRandom3To3_Raw(float3 param, float randomSeed) {
        float3 value;
        value.x = length(param) + 58.12 + 79.52 * randomSeed;
        value.y = length(param) + 96.53 + 36.95 * randomSeed;
        value.z = length(param) + 71.65 + 24.58 * randomSeed;
        value.x = sin(value.x) % 1;
        value.y = sin(value.y) % 1;
        value.z = sin(value.z) % 1;
        return value;
    }
    /// <summary>
    /// float3映射到[0,1]的随机数采样器
    /// </summary>
    float3 GetRandom3To3_Remapped(float3 param, float randomSeed) {
        float3 value = GetRandom3To3_Raw(param, randomSeed);
        value.x = (value.x + 1) / 2;
        value.y = (value.y + 1) / 2;
        value.z = (value.z + 1) / 2;
        return value;
    }

#endif
```
## 第三部分：数据声明

## RWStructuredBuffer

它是一个可读写的buffer，并且我们可以指定buffer中的数据类型为我们**自定义**的struct类型，不用再局限于int，float这类的基本类型。因此我们可以这么定义我们的数据：
### RW类型
RW是Read and write的缩写，意味着可读可写的变量
```c++
RWStructuredBuffer<float4> _Colors;
RWTexture2D<float4> _Texture2D;
RWTexture3D<float4> _Texture3D;

```
上面的三个变量意味着声明了：
- 可读写的颜色结构缓冲
- 可读写的2D纹理
- 可读写的3D纹理
# 自己的数据结构
```c++
struct Pixel {
    int3 coord;

    float3 centerPoint_middle;
    float3 neighborPoint0_middle;
    float3 neighborPoint1_middle;
    float3 neighborPoint2_middle;
    float3 neighborPoint3_middle;
    float3 neighborPoint4_middle;
    float3 neighborPoint5_middle;
    float3 neighborPoint6_middle;
    float3 neighborPoint7_middle;

    float3 centerPoint_near;
    float3 neighborPoint0_near;
    float3 neighborPoint1_near;
    float3 neighborPoint2_near;
    float3 neighborPoint3_near;
    float3 neighborPoint4_near;
    float3 neighborPoint5_near;
    float3 neighborPoint6_near;
    float3 neighborPoint7_near;

    float3 centerPoint_far;
    float3 neighborPoint0_far;
    float3 neighborPoint1_far;
    float3 neighborPoint2_far;
    float3 neighborPoint3_far;
    float3 neighborPoint4_far;
    float3 neighborPoint5_far;
    float3 neighborPoint6_far;
    float3 neighborPoint7_far;
};

int _Resolution;
float _Frequency;
bool _Is3D;
bool _IsTilable;
float _RandomSeed;
float3 _Evolution;
int _FBMIteration;
int _ReturnType;

```

# 第四部分：numthreads
又是num，又是thread的，肯定和线程数量有关。没错，它就是定义**一个线程组（Thread Group）中可以被执行的线程（Thread）总数量。**

我们先来看看什么是线程组。在GPU编程中，我们可以将所有要执行的线程划分成一个个线程组，一个线程组在单个流多处理器（Stream Multiprocessor，简称SM）上被执行。如果我们的GPU架构有16个SM，那么至少需要16个线程组来保证所有SM有事可做。为了更好的利用GPU，每个SM至少需要两个线程组，因为SM可以切换到处理不同组中的线程来隐藏[线程阻塞](https://zhida.zhihu.com/search?content_id=169975694&content_type=Article&match_order=1&q=%E7%BA%BF%E7%A8%8B%E9%98%BB%E5%A1%9E&zhida_source=entity)（如果着色器需要等待Texture处理的结果才能继续执行下一条指令，就会出现阻塞）。

**每个线程组都有一个各自的[共享内存](https://zhida.zhihu.com/search?content_id=169975694&content_type=Article&match_order=1&q=%E5%85%B1%E4%BA%AB%E5%86%85%E5%AD%98&zhida_source=entity)（Shared Memory）**，该组中的所有线程都可以访问改组对应的共享内存，但是不能访问别的组对应的共享内存。因此[线程同步](https://zhida.zhihu.com/search?content_id=169975694&content_type=Article&match_order=1&q=%E7%BA%BF%E7%A8%8B%E5%90%8C%E6%AD%A5&zhida_source=entity)操作可以在线程组中的线程之间进行，不同的线程组则不能进行同步操作。

每个线程组中又是由n个线程组成的，**线程组中的线程数量**就是通过numthreads来定义的，格式如下：

```cpp
numthreads(tX, tY, tZ)
```

其中 tX * tY * tZ 的值即线程的总数量，例如 numthreads(4, 4, 1) 和 numthreads(16, 1, 1) 都代表着有16个线程。那么**为什么不直接使用 numthreads(num) 这种形式定义，而非要分成tX，tY，tZ这种三维的形式呢？**

## 线程数限制
tX，tY，tZ三个值也并不是也可随便乱填的，比如来一刀 tX=99999 暴击一下，这是不行的。它们在不同的版本里有如下的约束：

| Compute Shader 版本 | tZ的最大取值 | [最大线程](https://zhida.zhihu.com/search?content_id=169975694&content_type=Article&match_order=1&q=%E6%9C%80%E5%A4%A7%E7%BA%BF%E7%A8%8B&zhida_source=entity)数量（tX*tY*tZ） |
| ----------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 4_x               | 1       | 768                                                                                                                                                                   |
| 4_0               | 64      | 1024                                                                                                                                                                  |
如果是NVIDIA的显卡，线程组中的线程又会被划分成一个个**Warp**，每个Warp由32个线程组成，**一个Warp通过SM来调度**。

在SIMD32下，当SM操控一个Warp执行一个指令，**意味着有32个线程同时执行相同的指令**。假如我们使用numthreads设置每个线程组只有10个线程，但是由于SM每次调度一个Warp就会执行32个线程，这就会**造成有22个线程是不干活**的（静默状态）


因此针对**NVIDIA的显卡，我们应该将线程组中的线程数设置为32的倍数**来达到最佳性能。如果是AMD显卡的话，线程组中的线程则是被划分成一个个由64个线程组成**wavefront**。

> Nvidia: wrap(x32)
> AMD: wavefront(x64)

因此**建议numthreads值设为64的倍数**，这样可以**同时顾及到两大主流的显卡**。


## 创建线程组
在Direct3D12中，可以通过**ID3D12GraphicsCommandList::Dispatch(gX,gY,gZ)**方法创建gX* gY* gZ个**线程组**。

**注意顺序，先numthreads定义好每个核函数对应线程组里线程的数量（tX* tY* tZ），再用Dispatch定义用多少线程组(gX * gY * gZ) 来处理这个核函数**。

接着我们用一张示意图来看看线程与线程组的结构，如下图：

![](Pasted%20image%2020241222213304.png)


| 参数                  | 值类型  | 含义                                                                               | 计算公式                                                                                                 |
| ------------------- | ---- | -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| SV_GroupID          | int3 | (组的坐标)当前线程所在的**线程组的ID**，取值范围为(0,0,0)到(gX-1,gY-1,gZ-1)。                           |                                                                                                      |
| SV_GroupThreadID    | int3 | （组中的一个）当前**线程在所在线程组**内的**ID**，取值范围为(0,0,0)到(tX-1,tY-1,tZ-1)。                     |                                                                                                      |
| SV_DispatchThreadID | int3 | （所有线程中的一个）当前**线程**在**所有线程组中的所有线程**里的ID，取值范围为(0,0,0)到(gX*tX-1, gY*tY-1, gZ*tZ-1)。 | 假设该线程的SV_GroupID=(a, b, c)，SV_GroupThreadID=(i, j, k) 那么SV_DispatchThreadID=(a*tX+i, b*tY+j, c*tZ+k) |
| SV_GroupIndex       | int  | （组中的下标ID）当前线程在所在线程组内的下标，取值范围为0到tX*tY*tZ-1。                                       |                                                                                                      |
不管是group还是thread，它们的**顺序都是先X再Y最后Z**


# 第五部分：核函数CSMain
前面必须声明numthreads
SV_DispatchThreadID的含义上面已经介绍过了，除了这个参数以外，我们前面提到的几个参数都可以被传入到核函数当中，根据实际需求做取舍即可：
```c++
[numthreads(16,16,1)]
void Main(uint3 id : SV_DispatchThreadID)
{

}
```

## 常规赋值
Unity默认的核函数体内执行的代码就是为我们Texture中下标为 id.xy 的像素赋值一个颜色

举个例子，以往我们想要给一个 x * y 分辨率的Texture每个像素进行赋值，单线程的情况下，我们的代码往往如下：

```cpp
for (int i = 0; i < x; i++)
    for (int j = 0; j < y; j++)
        Result[uint2(x, y)] = float4(a, b, c, d);
```

两个循环，像素一个个的慢慢赋值。那么如果我们要每帧给很多张2048*2048的图片进行操作，可想而知会卡死你。


## 多线程赋值
如果使用多线程，为了避免不同的线程对同一个像素进行操作，我们往往使用分段操作的方法，如下，四个线程进行处理：
```c++
void Thread1()
{
    for (int i = 0; i < x/2; i++)
        for (int j = 0; j < y/2; j++)
            Result[uint2(x, y)] = float4(a, b, c, d);
}

void Thread2()
{
    for (int i = 0; i < x/2; i++)
        for (int j = y/2; j < y; j++)
            Result[uint2(x, y)] = float4(a, b, c, d);
}

void Thread3()
{
    for (int i = x/2; i < x; i++)
        for (int j = 0; j < y/2; j++)
            Result[uint2(x, y)] = float4(a, b, c, d);
}

void Thread4()
{
    for (int i = x/2; i < x; i++)
        for (int j = y/2; j < y; j++)
            Result[uint2(x, y)] = float4(a, b, c, d);
}

```

**但这实在是太foolish了，如果有更多的线程，分成更多段，不就一堆重复的代码**


但是如果我们能知道每个线程的开始和结束下标，不就可以把这些代码统一起来了么，如下：

```cpp
void Thread(int start, int end)
{
    for (int i = start; i < end; i++)
        for (int j = start; j < end; j++)
            Result[uint2(x, y)] = float4(a, b, c, d);
}
```

那我要是可以**开出很多很多的线程**是不是就可以一个线程处理一个像素了？

```cpp
void Thread(int x, int y)
{
    Result[uint2(x, y)] = float4(a, b, c, d);
}
```

## CS牛逼的地方
用CPU我们做不到这样，但是用GPU，用CS我们就可以，实际上，前面默认的CS的代码里，核函数的内容就是这样的。

接下来我们来看看CS的妙处，**看 id.xy 的值**。id 的类型为SV_DispatchThreadID，我们先来回忆下SV_DispatchThreadID的计算公式：

> 假设该线程的SV_GroupID=(a, b, c)，SV_GroupThreadID=(i, j, k) 那么SV_DispatchThreadID=(a*tX+i, b*tY+j, c*tZ+k)

**因为我们的numthreads为（16 ,16,1）**

**若要处理256 * 256个线程，我们只需要dispatch(256/16,256/16,1)个共16x16个线程组**

这样就实现了成百上千个线程同时处理一个像素了



# C#调用

## 创建脚本和材质
新建一个monobehaviour脚本，Unity为我们提供了一个**ComputeShader**的类型用来引用我们前面生成的 .compute 文件：
```csharp
public ComputeShader computeShader;
```
此外我们再关联一个Material，因为CS处理后的纹理，依旧要经过FragmentShader采样后来显示。
```text
public Material material;
```

这个Material我们使用一个基础的Unlit Shader即可，并且纹理不用设置：


## 创建RenderTexture
接着我们可以将Unity中的**RenderTexture**赋值到CS中的RWTexture2D上，但是需要注意因为我们是多线程处理像素，并且这个处理过程是**无序**的，因此我们要将RenderTexture的**enableRandomWrite**属性设置为true，代码如下：

```csharp
RenderTexture mRenderTexture = new RenderTexture(256, 256, 16);
mRenderTexture.enableRandomWrite = true;
mRenderTexture.Create();
```
## 传入computeShdaer
```csharp
material.mainTexture = mRenderTexture;
computeShader.SetTexture(kernelIndex, "Result", mRenderTexture);
```
这里有一个kernelIndex变量，即核函数下标，我们可以利用FindKernel来找到我们声明的核函数的下标：

```csharp
int kernelIndex = computeShader.FindKernel("CSMain");
```
## 传入RWStructuredBuffer
先声明一个buffer：
- count表示buffer中元素的数量
- stride表示每个元素占用的空间，即步长
例如我们传递10个float的类型，那么count=10，stride=4。
需要注意的是**ComputeBuffer中的stride大小必须和RWStructuredBuffer中每个元素的大小一致**。
```csharp
ComputeBuffer buffer = new ComputeBuffer(int count, int stride)
```
声明完成后我们可以使用SetData方法来填充，参数为自定义的struct数组：
```csharp
buffer.SetData(T[]);
```

最后我们可以使用ComputeShader类中的SetBuffer方法来把它传递到CS中：
```csharp
public void SetBuffer(int kernelIndex, string name, ComputeBuffer buffer)
```
记得用完后把它Release()掉。
##  材质的常规shader处理方式
这样在我们Fragment Shader采样的时候，采样的就是CS处理过后的纹理：

```csharp
fixed4 frag (v2f i) : SV_Target
{
    // _MainTex 就是被处理后的 RenderTexture
    fixed4 col = tex2D(_MainTex, i.uv);
    return col;
}
```