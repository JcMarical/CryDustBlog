# 输入 ToonInput
+ include使用了unity URP的hlsl核心库,虽然没直接用到，但是CBUFFER和TEXTURE可能在核心库中有处理和优化
+  `CBUFFER_START(UnityPerMaterial)` 和 `CBUFFER_END`： 这两个宏定义了一个常量缓冲区，用于存储材质的属性。这些属性可以在GPU上快速访问，而不需要每次都从CPU传输。
+ 材质属性： 
	- `_BaseMap_ST`：控制基础纹理的平铺和偏移。
	- `_BaseColor`：基础颜色，用于修改材质的颜色。
	- `_IsDay`：一个标志，可能用于区分白天和夜晚的光照效果。
	- `_Cull`：控制剔除模式，例如是否剔除背面或正面。
	- `_SrcBlend` 和 `_DstBlend`：控制混合模式，用于透明或半透明效果。
	- `_LightDirectionMultiplier`：光照方向的乘数，可能用于调整光照效果。
	- `_ShadowOffset` 和 `_ShadowSmoothness`：用于调整阴影的偏移和平滑度。
	- `_ShadowColor`：阴影的颜色。
	- `_UseCustomMaterialType` 和 `_CustomMaterialType`：可能用于定义自定义的材质类型。
	- `_EmissionIntensity`：自发光的强度。
	- `_FaceDirection`、`_FaceShadowOffset`、`_FaceBlushColor` 和 `_FaceBlushStrength`：这些属性可能用于面部特征的光照和阴影效果。
	- `_SpecularSmoothness`、`_NonmetallicIntensity` 和 `_MetallicIntensity`：控制镜面高光、非金属和金属的强度。
	- `_RimOffset`、`_RimThreshold` 和 `_RimIntensity`：用于边缘光效果的参数。
	- `_UseSmoothNormal`：可能用于是否使用平滑法线。
	- `_OutlineWidth`、`_OutlineWidthParams`、`_OutlineZOffset`、`_ScreenOffset`：用于控制轮廓的宽度和偏移。
	- `_OutlineColor` 系列：定义不同轮廓的颜色。
-  纹理和采样器：
    - `TEXTURE2D` 和 `SAMPLER`：定义了多个纹理资源和对应的采样器。这些纹理用于材质的贴图，例如基础纹理、光照图、阴影渐变、法线图、面部光照图、面部阴影、金属度图等。
```c
#include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"
CBUFFER_START(UnityPerMaterial)

    float4  _BaseMap_ST;   //偏移

    half4   _BaseColor;

    half    _IsDay;

    half    _Cull;

    half    _SrcBlend;

    half    _DstBlend;

  

    half4   _LightDirectionMultiplier;

    half    _ShadowOffset;

    half    _ShadowSmoothness;

    half4   _ShadowColor;

    half    _UseCustomMaterialType;

    half    _CustomMaterialType;

  

    half    _EmissionIntensity;

  

    half4   _FaceDirection;

    half    _FaceShadowOffset;

    half4   _FaceBlushColor;

    half    _FaceBlushStrength;

  

    half    _SpecularSmoothness;

    half    _NonmetallicIntensity;

    half    _MetallicIntensity;

  

    half    _RimOffset;

    half    _RimThreshold;

    half    _RimIntensity;

  

    half    _UseSmoothNormal;

    half    _OutlineWidth;

    half4   _OutlineWidthParams;

    half    _OutlineZOffset;

    half4   _ScreenOffset;

    half4   _OutlineColor;

    half4   _OutlineColor2;

    half4   _OutlineColor3;

    half4   _OutlineColor4;

    half4   _OutlineColor5;

CBUFFER_END

  

TEXTURE2D(_BaseMap);            SAMPLER(sampler_BaseMap);

TEXTURE2D(_LightMap);           SAMPLER(sampler_LightMap);

TEXTURE2D(_ShadowRamp);         SAMPLER(sampler_ShadowRamp);

TEXTURE2D(_NormalMap);          SAMPLER(sampler_NormalMap);

TEXTURE2D(_FaceLightMap);       SAMPLER(sampler_FaceLightMap);

TEXTURE2D(_FaceShadow);         SAMPLER(sampler_FaceShadow);

TEXTURE2D(_MetalMap);           SAMPLER(sampler_MetalMap);
```

# 全部代码
## 
```c++

```