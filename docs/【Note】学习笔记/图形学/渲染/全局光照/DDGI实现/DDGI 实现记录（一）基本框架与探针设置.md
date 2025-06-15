# DDGIFeature
RenderFeature 允许在 URP 渲染流程的任意阶段（如渲染不透明物体前后、后处理前等）插入自定义的 ​**ScriptableRenderPass**，实现独立于默认管线的渲染操作
### 技术实现要点

1. ​**RenderFeature 与 RenderPass 协作**
- ​`Create()`：初始化时创建 RenderPass 实例并配置参数（如渲染事件时机）。
- ​`AddRenderPasses()` ：每帧将 RenderPass 注入渲染器，执行自定义逻辑
1. ​**RenderPass 的核心方法**
- ​`Execute()`：实现具体渲染逻辑（如调用光线追踪或绘制实例化网格）。
- ​`ConfigureTarget()`：设置渲染目标和清除状态，优化资源使用


# DDGI与DDGI Editor

## 1. 边界框和Probe设置
```c++
    //Probe调试
    private SerializedDataParameter mDebugProbe;
    private SerializedDataParameter mProbeDebugMode;
    private SerializedDataParameter mProbeRadius;

    //DDGI 边界框设置
    private SerializedDataParameter mUseCustomBounds;
    private SerializedDataParameter mProbeCountX;
    private SerializedDataParameter mProbeCountY;
    private SerializedDataParameter mProbeCountZ;
    private SerializedDataParameter mRaysPerProbe;
```



## 2.边界框的使用
- 可以自己创建个collider box作为边界框
- 没有的话，我们需要根据mesh自动生成包围盒。甚至是骨骼网格体


# DDGIPass 核心Pass
## 1.GPU常量区数据准备
有些东西暂时还没用上，但是先一起传了，以免后面位置计算出错了
```c#
/// <summary>
/// DDGI体积的GPU参数结构体，用于将配置数据从CPU传递到GPU着色器
/// </summary>
struct DDGIVolumeGpu
{
    public Vector4 _ProbeRotation;           // 探针旋转四元数，用于旋转探针的采样方向
    public Vector3 _StartPosition;           // 探针体积的起始位置（左下角）
    public int _RaysPerProbe;                // 每个探针当前使用的光线数量
    public Vector3 _ProbeSize;               // 探针体积的三维尺寸
    public int _MaxRaysPerProbe;             // 每个探针最大允许的光线数量上限
    public Vector3Int _ProbeCount;           // 三个方向上的探针数量(X,Y,Z)
    public float _NormalBias;                // 基础法线偏移值，用于避免自遮挡
    public Vector3 _RandomVector;            // 随机向量，用于光线方向随机化
    public float _EnergyPreservation;        // 能量保存系数，影响间接光照强度
    
    public float _RandomAngle;               // 光线随机化角度范围
    public float _HistoryBlendWeight;        // 历史帧混合权重，控制时间滤波平滑度
    public float _IndirectIntensity;         // 间接光照强度乘数
    public float _NormalBiasMultiplier;      // 法线偏移乘数，进一步调整法线偏移
    
    public float _ViewBiasMultiplier;        // 视图偏移乘数，调整视图相关偏移
    public int DDGI_PROBE_CLASSIFICATION;    // 探针分类开关(0=关闭,1=开启)，用于确定探针活跃状态
    public int DDGI_PROBE_RELOCATION;        // 探针重定位开关(0=关闭,1=开启)，用于动态调整探针位置
    public float _ProbeFixedRayBackfaceThreshold; // 探针背面检测阈值，用于分类和重定位算法
    
    public float _ProbeMinFrontfaceDistance; // 探针前面最小距离阈值，用于分类和重定位算法
    public int _DirectionalLightCount;       // 场景中方向光源数量（不考虑剔除）
    public int _PunctualLightCount;          // 场景中点光源和聚光灯数量（不考虑剔除）
    public int DDGI_SKYLIGHT_MODE;           // 天空光照模式(0=天空盒,1=渐变,2=纯色,3=不支持)
    
    public Vector4 _SkyboxTintColor;         // 天空盒颜色色调
    public Vector4 _SkyColor;                // 天空颜色（用于渐变模式）
    public Vector4 _EquatorColor;            // 地平线颜色（用于渐变模式）
    public Vector4 _GroundColor;             // 地面颜色（用于渐变模式）
    public Vector4 _AmbientColor;            // 环境光颜色（用于纯色模式）
    
    public int DDGI_PROBE_REDUCTION;         // 探针精简开关(0=关闭,1=开启)，用于减少不必要探针提高性能
    public float _SkyboxIntensityMultiplier; // 天空盒强度乘数
    public float _SkyboxExposure;            // 天空盒曝光值
    public float _Pad0;                      // 内存对齐填充变量，确保GPU内存布局正确
}

/// <summary>
/// DDGI体积GPU参数实例，用于在运行时存储和更新参数
/// </summary>
private DDGIVolumeGpu mDDGIVolumeGpu;
```

## 2.GPU参数静态类
```c
        private static class GpuParams

        {

            // For Probe Tracing and Updating

            public static readonly string RayGenShaderName = "DDGI_RayGen";

            public static readonly int RayBuffer = Shader.PropertyToID("RayBuffer");

            public static readonly int DirectionalLightBuffer = Shader.PropertyToID("DirectionalLightBuffer");

            public static readonly int PunctualLightBuffer = Shader.PropertyToID("PunctualLightBuffer");

            public static readonly int DDGIVolumeGpu = Shader.PropertyToID("DDGIVolumeGpu");

  

            public static readonly int _ProbeIrradiance = Shader.PropertyToID("_ProbeIrradiance");

            public static readonly int _ProbeIrradianceHistory = Shader.PropertyToID("_ProbeIrradianceHistory");

            public static readonly int _ProbeDistance = Shader.PropertyToID("_ProbeDistance");

            public static readonly int _ProbeDistanceHistory = Shader.PropertyToID("_ProbeDistanceHistory");

  

            public static readonly int _AccelerationStructure = Shader.PropertyToID("_AccelerationStructure");

  

            // For Sky Light Sampling

            public static readonly string DDGI_SKYLIGHT_MODE = "DDGI_SKYLIGHT_MODE";

            public static readonly int _SkyboxCubemap = Shader.PropertyToID("_SkyboxCubemap");

  

            // For Probe Relocation

            public static readonly string DDGI_PROBE_RELOCATION = "DDGI_PROBE_RELOCATION";

            public static readonly int _ProbeData = Shader.PropertyToID("_ProbeData");

  

            // For Probe Debug

            public static readonly string DDGI_SHOW_INDIRECT_ONLY = "DDGI_SHOW_INDIRECT_ONLY";

            public static readonly string DDGI_SHOW_PURE_INDIRECT_RADIANCE = "DDGI_SHOW_PURE_INDIRECT_RADIANCE";

            // For Probe Reduction (Variability)

            public static readonly int _ReductionInputSize = Shader.PropertyToID("_ReductionInputSize");

            public static readonly int _ProbeVariability = Shader.PropertyToID("_ProbeVariability");

            public static readonly int _ProbeVariabilityAverage = Shader.PropertyToID("_ProbeVariabilityAverage");

        }
```
# DDGIVisual Pass
## 1.创建Pass
设置DDGI，相关的Shader和Mesh等参数，以及需要传输给ComputeBuffer的东西，传给Shader显存的GPU的参数
```c++
        private DDGI mddgiOverride;
        
        private Shader mVisualizeShader;
        private Material mVisualizeMaterial;
        private Mesh mVisualizeMesh;

        private DDGIPass mDDGIPass;

        private ComputeBuffer mArgsBuffer;
    
    
```
### Gpu
```c++
        private static class GpuParams
        {
            public static readonly string DDGI_DEBUG_IRRADIANCE = "DDGI_DEBUG_IRRADIANCE";
            public static readonly string DDGI_DEBUG_DISTANCE = "DDGI_DEBUG_DISTANCE";
            public static readonly string DDGI_DEBUG_OFFSET = "DDGI_DEBUG_OFFSET";

            public static readonly int _ProbeData = Shader.PropertyToID("_ProbeData");
            public static readonly int _ddgiSphere_ObjectToWorld = Shader.PropertyToID("_ddgiSphere_ObjectToWorld");
        }
```


## 2.构造函数初始化
```c++

```

# DDGIPass

## 3.DDGIFeature中设置CPU处理的体积数据
```c#
        struct DDGIVolumeCpu
        {
            public Vector3 Origin;
            public Vector3 Extents;
            public Vector3Int NumProbes;
            public int MaxNumRays;
            public int NumRays;
        }
        private DDGIVolumeCpu mDDGIVolumeCpu;


```

## 4.DDGI Pass设置初始化CPU内容
```c++
        private void Initialize()
        {
            // ---------------------------------------
            // Initialize cpu-side volume parameters
            // ---------------------------------------
            var sceneBoundingBox = GenerateSceneMeshBounds();
            if (sceneBoundingBox.extents == Vector3.zero) return;   // 包围盒零值表示场景没有任何几何体，没有GI意义
            mDDGIVolumeCpu.Origin = sceneBoundingBox.center;
            mDDGIVolumeCpu.Extents = 1.1f * sceneBoundingBox.extents;
            mDDGIVolumeCpu.NumProbes = new Vector3Int(mddgiOverride.probeCountX.value, mddgiOverride.probeCountY.value, mddgiOverride.probeCountZ.value);
            mDDGIVolumeCpu.NumRays = mddgiOverride.raysPerProbe.value;
            mDDGIVolumeCpu.MaxNumRays = 512;
        }

```
## 5.相机初始化阶段OnCameraSetup
```c++
        public override void OnCameraSetup(CommandBuffer cmd, ref RenderingData renderingData)
        {
            base.OnCameraSetup(cmd, ref renderingData);

            mddgiOverride = VolumeManager.instance.stack.GetComponent<DDGI>();

            Initialize();
        }
```
- 调用基类OnCameraSetup，确保摄像机的正常运行
- 获取DDGI的相关参数
- 初始化