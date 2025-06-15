让我们详细梳理 `DDGIFeature.cs` 的代码结构：

# 1. 核心类定义：
    
    - `DDGIFeature` 类
        - 继承自 `ScriptableRendererFeature`
        - 负责 DDGI 系统的整体管理
        - 主要功能：
            - 初始化渲染过程
            - 管理探针系统资源
            - 处理渲染管线集成
# 2. 内部类 `DDGIPass`：
    
    - 继承自 `ScriptableRenderPass`
    - 实现具体的渲染过程
    - 包含以下主要模块：
    
##  a) 核心数据结构：
```c#
struct DDGIVolumeCpu {
    public Vector3 Origin;
    public Vector3 Extents;
    public Vector3Int NumProbes;
    public int MaxNumRays;
    public int NumRays;
}

struct DDGIVolumeGpu {
    // GPU 端探针体积参数
    public Vector4 _ProbeRotation;
    public Vector3 _StartPosition;
    public int _RaysPerProbe;
    // ... 其他参数
}
```
    
## b) 资源管理：
```c#
private RayTracingShader mDDGIRayTraceShader;
private RayTracingAccelerationStructure mAccelerationStructure;
private ComputeBuffer mRayBuffer;
private RenderTexture mProbeIrradiance;
private RenderTexture mProbeDistance;
// ... 其他资源
```
## c) 计算着色器内核：
```c#
private readonly ComputeShader mUpdateIrradianceCS;
private readonly int mUpdateIrradianceKernel;
private readonly ComputeShader mUpdateDistanceCS;
private readonly int mUpdateDistanceKernel;
// ... 其他内核
```
## d) 光照系统：
```c#
private ComputeBuffer mDirectionalLightBuffer;
private ComputeBuffer mPunctualLightBuffer;

struct DirectionalLight {
    public Vector4 direction;
    public Vector4 color;
}

struct PunctualLight {
    public Vector4 position;
    public Vector4 color;
    public Vector4 distanceAndSpotAttenuation;
    public Vector4 spotDirection;
}```
# 3. 主要方法：
 
## a) 初始化：
```c#
public override void Create()
{
    // 初始化渲染过程
}

public override void AddRenderPasses(ScriptableRenderer renderer, ref RenderingData renderingData)
{
    // 添加渲染过程到管线
}
```
## b) 渲染过程：
```c#
public override void Execute(ScriptableRenderContext context, ref RenderingData renderingData)
{
    // 主渲染逻辑
}

private void RenderProbes(ScriptableRenderContext context, ref RenderingData renderingData)
{
    // 探针渲染逻辑
}
```
## c) 资源管理：
```c#
private void ReleaseResources()
{
    // 释放 GPU 资源
}

private void CreateResources()
{
    // 创建 GPU 资源
}
```
## d) 光照处理：
```c#
private void BuildLightStructuredBuffers()
{
    // 构建光照数据结构
}

private void UpdateLightParameters()
{
    // 更新光照参数
}
```
# 4. 探针系统核心功能：

## a) 探针更新：
```c#
private void UpdateProbeIrradiance()
{
    // 更新探针辐照度
}

private void UpdateProbeDistance()
{
    // 更新探针距离场
}
```
## b) 探针优化：
```c#
private void ClassifyProbes()
{
    // 探针分类
}

private void RelocateProbes()
{
    // 探针重定位
}
```
## c) 探针可视化：
 
# 5. 辅助功能：

## a) 调试工具：
```c#
private void DrawDebugProbes()
{
    // 调试绘制探针
}
```
## b) 状态管理：
```c#
private bool IsConverged()
{
    // 检查系统是否收敛
}

private void ResetProbeHistory()
{
    // 重置探针历史记录
}

```

这个实现展示了完整的 DDGI 系统，从探针管理到光线追踪，再到与 Unity 渲染管线的集成。代码结构清晰，模块化程度高，便于维护和扩展。

