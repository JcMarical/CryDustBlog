# 每个Probe需要记录的纹理
- 辐照度
- 距离
- 距离的平方

## 辐照度缓存
辐照度采用八面体映射的方式，每个八面体上有六个顶点。

每个方向上有PROBE_IRRADIANCE_TEXELS（这里设置了6）个，
缓冲大小就是PROBE_IRRADIANCE_TEXELSxPROBE_IRRADIANCE_TEXELS。

## 边界数据
用来确保纹理的连续

# 二 计算过程
## 2.1使用dxc，计算computeShader

// 每个线程组代表一个Probe，线程组内的每一个线程处理该Probe对应的八面体投影Texel  
// 每个线程都会从DDGI Ray Trace阶段得到的RayBuffer中获取场景当前帧的辐照度数据，计算全局光照后，与前一帧的辐照度数据混合，存储进对应Texel

- RayBuffers：存储了所有数据以及其光线
- RadianceChche：通过探针索引，偏移和线程组里的索引，从Raybuffers里获取对应光线
- DirectionCache：通过Fobanacci螺旋算法+随机值（非固定光线）计算出结果。
### 探针的方向计算:Fobanacci螺旋算法
```c++ 

// Ray Tracing Gems 2: Essential Ray Generation Shaders  
float3 SphericalFibonacci(float i, float n)  
    {       const float PHI = sqrt(5) * 0.5f + 0.5f;  
       float fraction = (i * (PHI - 1)) - floor(i * (PHI - 1));  
       float phi     = 2.0f * PI * fraction;  
       float cosTheta = 1.0f - (2.0f * i + 1.0f) * (1.0f / n);  
       float sinTheta = sqrt(saturate(1.0 - cosTheta * cosTheta));  
    return float3(cos(phi) * sinTheta, sin(phi) * sinTheta, cosTheta);  
    }
```

## 计算变化率
需要提取Luminance并计算
## 求和
将所有光线得到的结果加在一起，最后得到最终的result。


# 三 后处理
## 辐照度归一化处理

## 时域稳定性处理

## 辐照度混合前帧计算

## 更新边界



