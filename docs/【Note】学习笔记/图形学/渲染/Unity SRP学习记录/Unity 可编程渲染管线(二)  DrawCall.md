本文参考[Custom Render Pipeline --- 自定义渲染管线](https://catlikecoding.com/unity/tutorials/custom-srp/custom-render-pipeline/)，实现Unity自定义渲染管线
源码地址：
[RenderProject/Assets/Custom RP at main · JcMarical/RenderProject](https://github.com/JcMarical/RenderProject/tree/main/Assets/Custom%20RP)

# 1.Shader基础

# 2.SRP Batcheer
![[Pasted image 20250129104133.png]]

# 3.GPU Instancing
1.pragma
2.库
3.要知道对象的索引，并设置
4.常量缓冲区数组设置


![[Pasted image 20250129122028.png]]

![[Pasted image 20250129122042.png]]

绘制1023个球体，batches为4。
![[Pasted image 20250129203014.png]]

# 4.动态批处理
将共享**相同材质**的多个小网格**合成较大的网格**。我们使用正方体来完成它（球体太大了），使用它则需要**禁用GPUInstance**和SRP Batcher。
```c++

```

# 5.静态批处理
处理方法比较类似，但是他可以提前标记进行批处理，需要更多内存和存储。

