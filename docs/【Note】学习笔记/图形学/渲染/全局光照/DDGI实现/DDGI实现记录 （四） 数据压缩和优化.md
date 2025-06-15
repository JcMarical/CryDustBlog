## 浮点数压缩 16 To 32
```c++
float2 UnpackHalf2(in uint packed)
float4 UnpackHalf4(in uint2 packed)
float3 UnpackHalf3(in uint2 packed)
```

## 整数打包/解包 32INT To 16INT
```c++
uint2 UnpackTwoUint16FromUint32(in uint packed)
```

## 颜色编码（32INT解码为4个分量的浮点数）


## 法线编码/解码
- 八面体投影压缩法线
- 3D变2D

## **16位法线压缩函数**：
将3D法线向量压缩成32位整数（两个法线分量）。