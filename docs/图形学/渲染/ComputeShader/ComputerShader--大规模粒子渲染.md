# ComputeShader和Matertial协同
Material可以直接从ComputeShader设置在GPU的Buffer中拿数据，而不需要CPU再提交一次DrawCall



# CS绑定粒子
1.在C#中定义好粒子的信息（位置、速度与生命周期）
2.初始化将数据传给buffer，绑定buffer到ComputeShader和Material。
3.渲染阶段在OnRenderObject里调用Graphics.DrawProceduralNow实现高效地渲染粒子




跟着鼠标走的粉色螺旋丸！！！
![](res/Pasted%20image%2020241230041724.png)



# 集群模拟Flocking（集群行为）模拟
Flocking 是一种模拟自然界中鸟群、鱼群等动物集体运动行为的算法。又称为Boids算法
核心是基于三个基本的行为规则**分离、对齐、聚合**，由Craig Reynolds在Sig 87提出。

其中最困难的当属是**分离**

10000个立方体渲染，帧数
![[Pasted image 20241231211156.png]]



# GPU Instancing 优化


## argsBuffer
添加`argsBuffer`：参数的 `ComputeBuffer`，参数包括每个实例的几何体的索引数量和实例化的数量。

这个 `argsBuffer` 是啥？这个参数用来告诉Unity，我们现在要渲染哪个Mesh、要渲染多少个！可以用一种特殊的Buffer作为参数给进去。

在初始化shader时候，创建一种特殊Buffer，其标注为 `ComputeBufferType.IndirectArguments` 。这种类型的缓冲区专门用于传递给 GPU，以便在 GPU 上执行间接绘制命令。这里的new ComputeBuffer 第一个参数是 `1` ，表示一个args数组（一个数组有5个uint），不要理解错了
```csharp
ComputeBuffer argsBuffer;
...
argsBuffer = new ComputeBuffer(1, 5 * sizeof(uint), ComputeBufferType.IndirectArguments);
if (boidMesh != null)
{
    args[0] = (uint)boidMesh.GetIndexCount(0);
    args[1] = (uint)numOfBoids;
}
argsBuffer.SetData(args);
...
Graphics.DrawMeshInstancedIndirect(boidMesh, 0, boidMaterial, bounds, argsBuffer);
```


