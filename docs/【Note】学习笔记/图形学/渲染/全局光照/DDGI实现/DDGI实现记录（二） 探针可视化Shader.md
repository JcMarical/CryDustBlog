# 四元数协助类

## 1.旋转向量
- `v * (q.w * q.w - b2)`：这是旋转公式中的实部部分，表示向量的缩放。
- `b * (dot(v, b) * 2.0f)`：这是旋转公式中的虚部部分，表示向量在旋转轴上的投影。
- `cross(b, v) * (q.w * 2.f)`：这是旋转公式中的叉积部分，表示向量在旋转轴垂直方向上的旋转。
```c
//将向量v用一个四元数q旋转

float3 DDGIQuaternionRotate(float3 v,float4 q)

{
	float3 b = q.xyz; // 提取四元数的虚部 (x, y, z) 
	float2 b2 = dot(b, b); // 计算虚部的平方和 (x² + y² + z²)
    return (v * (q.w * q.w - b2) + b * (dot(v,b) * 2.0f) +cross(b,v) * (q.w * 2.f));

  

}
```

## DDGIInput.hlsl ：参数记录类

## CBUFFER，对应DDGIPass的GPU参数
```c++
CBUFFER_START(DDGIVolumeGpu)
    float4   _ProbeRotation;           // 探针旋转四元数，用于旋转探针的采样方向
    float3   _StartPosition;           // 探针体积的起始位置（通常是左下角）
    int      _RaysPerProbe;            // 每个探针当前发射的光线数量
    float3   _ProbeSize;               // 探针体积的尺寸（宽、高、深）
    int      _MaxRaysPerProbe;         // 每个探针最大可发射的光线数量
    uint3    _ProbeCount;              // 探针在XYZ三个方向的数量
    float    _NormalBias;              // 沿表面法线的位移偏移量，用于避免自遮挡
    float3   _RandomVector;            // 随机向量，用于光线方向的随机化
    float    _EnergyPreservation;      // 能量保存系数，控制间接光照的强度保持
    float    _RandomAngle;             // 光线随机化的角度范围
    float    _HistoryBlendWeight;      // 历史数据混合权重，控制时间过滤平滑度
    float    _IndirectIntensity;       // 间接光照强度乘数
    float    _NormalBiasMultiplier;    // 法线偏移的额外乘数
    float    _ViewBiasMultiplier;      // 视图偏移的额外乘数
    int      DDGI_PROBE_CLASSIFICATION; // 探针分类开关（0=关闭，1=开启）
    int      DDGI_PROBE_RELOCATION;    // 探针重定位开关（0=关闭，1=开启）
    float    _ProbeFixedRayBackfaceThreshold; // 探针背面检测阈值，用于分类和重定位
    float    _ProbeMinFrontfaceDistance; // 探针前面最小距离，用于分类和重定位
    int      _DirectionalLightCount;   // 存储场景内所有Directional光源数量（不考虑剔除）
    int      _PunctualLightCount;      // 存储场景内所有Spot和Point光源数量（不考虑剔除）
    int      DDGI_SKYLIGHT_MODE;       // 天空光照模式（0=天空盒，1=渐变，2=纯色，3=不支持）
    float4   _SkyboxTintColor;         // 天空盒颜色色调
    float4   _SkyColor;                // 天空颜色（用于渐变模式）
    float4   _EquatorColor;            // 地平线颜色（用于渐变模式）
    float4   _GroundColor;             // 地面颜色（用于渐变模式）
    float4   _AmbientColor;            // 环境光颜色（用于纯色模式）
    int      DDGI_PROBE_REDUCTION;     // 探针精简开关（0=关闭，1=开启）
    float    _SkyboxIntensityMultiplier; // 天空盒强度乘数
    float    _SkyboxExposure;          // 天空盒曝光值
    float    _Pad0;                    // 填充变量，用于对齐内存（无实际作用）
CBUFFER_END
```

## 方法类DDGLFuncs.hlsl 

## 1.提供一个传入id返回世界坐标的方法（暂时不做探针重定位）
```c++
float3 DDGIGetProbeWorldPosition(uint gridCoord)

{

    //探针世界坐标 =  起始坐标 + 探针大小 * gridCoord坐标

    const float3 probeSpaceWorldPosition = gridCoord * _ProbeSize;

        //旋转探针（大小*间隔）

    const float3 probeVolumeExtents = (_ProbeSize * (_ProbeCount - 1)) * 0.5f;//总长度的一半

    float3 probeWorldPostion = probeSpaceWorldPosition - probeVolumeExtents;//实际位置减去一半，【-n/2,n/2】，方便旋转

    probeWorldPostion = DDGIQuaternionRotate(probeWorldPostion,_ProbeRotation) + probeVolumeExtents;//旋转后再把这一半加回来

    probeWorldPosition += _StartPosition;


    //探针重定位：暂时不考虑

    /*

        // 光追Shader中会用到该函数，而根据下面的链接，光线跟踪Shader分支仍在计划中，这意味着我们不能用变体，所以用变量判断开启与否

    // https://portal.productboard.com/unity/1-unity-platform-rendering-visual-effects/tabs/125-shader-system

    if(DDGI_PROBE_RELOCATION == DDGI_PROBE_RELOCATION_ON)

    {

        // 因为我们采样tex2DArray时，采样坐标的z分量实际上对应于gridCoord的y分量，这里需要额外做一步反转

        int probeIndex              = DDGIGetProbeIndex(gridCoord);

        uint3 probeDataTexelCoord   = DDGIGetProbeTexelCoordsOneByOne(probeIndex);

        probeWorldPosition          += DDGILoadProbeDataOffset(probeDataTexelCoord);

    }

    */

    return probeWorldPosition;

}

```
## 2.获取DDGI对应探针的状态
这个探针分类感觉可以关。
```c++
//------------------------------------------------------------------------

// Probe Data Fetcher 探针数据获取

//------------------------------------------------------------------------

  

#if defined(DDGI_VISUALIZATION) || defined(DDGI_RAYTRACING) || defined(FORWARD_USE_DDGI)

    int DDGILoadProbeState(uint3 coords)
    {
        int state = DDGI_PROBE_STATE_ACTIVE;

        if(DDGI_PROBE_CLASSIFICATION == DDGI_PROBE_CLASSIFICATION_ON)
        {
            state = (int)LOAD_TEXTURE2D_ARRAY_LOD(_ProbeData, coords.xy, coords.z, 0).a;

        }
        return state;
    }

#else
    int DDGILoadProbeState(uint3 coords)
    {
        int state = DDGI_PROBE_STATE_ACTIVE;
        if(DDGI_PROBE_CLASSIFICATION == DDGI_PROBE_CLASSIFICATION_ON)
        {
            state = (int)_ProbeData[coords].a;
        }

        return state;

    }

#endif
```

# DDGIProbeIndexing



## 1.根据传入的探针ID获取三维坐标
count本身记录了三维
```c
    //获取一个平面的探针数量

uint3 DDGIGetProbeTexelCoordsOneByOne(int probeIndex)

{
	//先拿到一个平面的探针数量

    int probesPerPlane  = DDGIGetProbesPerPlane(_ProbeCount);

    int planeIndex      = int(probeIndex / probesPerPlane);



    int x = (probeIndex % _ProbeCount.x);

    int y = (probeIndex / _ProbeCount.x) % _ProbeCount.z;

  

    return uint3(x, y, planeIndex);

}
```



# DDGIVisualize

## 1.引用DDGI库
```c
            

            #define DDGI_VISUALIZATION 1
            ...
			
			#include "Lib/DDGIInputs.hlsl"
            #include "Lib/DDGIProbeIndexing.hlsl"
            #include "Lib/DDGIFuncs.hlsl"

			
```

## 2.数据结构
其实很简单，我们只需要多一个记录球ID就好了
```c
            struct Attributes
            {
                float3 positionOS : POSITION;
                float3 normalOS : NORMAL;
                uint instanceID : SV_InstanceID;
            };

  

            struct Varyings
            {
                float4 positionCS : SV_POSITION;
                float3 normalWS : NORMAL;
                uint probeIndex : SV_InstanceID;
            };

```

## 3.顶点着色器
比较关键的就是根据id转换球的世界坐标,以及赋值ID
```c++
                //根据id获取探针的相对世界坐标，并加在世界坐标上
                uint probeIndex = input.instanceID;
                float3 probePosition = DDGIGetProbeWorldPosition(probeIndex);
                worldPos += probePosition;

				...

				vout.probeIndex = probeIndex;
```


# 探针可视化

