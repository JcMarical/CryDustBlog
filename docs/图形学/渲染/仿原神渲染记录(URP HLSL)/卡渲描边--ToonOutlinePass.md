



# 卡渲描边 ToonOutlinePass
卡渲一般都会单独对模型进行一次描边处理
# 1. `#include` 指令：
    - 第一个 `#include` 引入了URP的核心HLSL代码，提供了基本的渲染功能，比如处理顶点和片元的基本操作。
    - 第二个 `#include` 引入了URP的光照库，可能包含了一些用于光照计算的函数。
```c
#include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"
#include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Lighting.hlsl"
```
# 2. `Attributes` 结构体：
    - 定义了顶点着色器的输入属性，包括位置、法线、切线、颜色和UV坐标，OS--ObjectSpace。
    -  `positionOS`：顶点在对象空间中的位置。
	- `normalOS`：顶点的法线向量，也在对象空间中。
	- `tangentOS`：顶点的切线向量，用于确定表面的切线空间。
	- `color`：顶点的颜色信息。
	- `uv`：纹理坐标。
	- `smoothNormal`：用于平滑处理的法线向量，可能用于法线贴图。

## 3. 轮廓宽度
- `params`：这是一个包含四个浮点数的向量，它从材质属性中获取，用于控制轮廓宽度的计算。具体来说：
    
    - `params.x`：轮廓开始变化的起始深度值。
    - `params.y`：轮廓停止变化的结束深度值。
    - `params.z` 和 `params.w`：分别表示在 `params.x` 和 `params.y` 深度处的轮廓宽度。
- `(z - params.x)`：这个表达式计算当前顶点深度值与起始深度值的差值。
    
- `(params.y - params.x)`：这个表达式计算起始深度值和结束深度值之间的总深度范围。
    
- `(z - params.x) / (params.y - params.x)`：这个表达式计算一个从0到1的比率，表示当前深度值在起始深度值和结束深度值之间的相对位置。如果 `z` 等于 `params.x`，比率为0；如果 `z` 等于 `params.y`，比率为1。
    
- `saturate` 函数：这个函数确保计算出的比率不会超出0到1的范围。如果比率小于0，`saturate` 函数将其设置为0；如果比率大于1，将其设置为1。这样可以避免因深度计算误差或异常值导致的超出范围的结果。
```c

float GetOutlineWidth(float positionVS_Z)

{
//这行代码计算了视场角（Field of View, FOV）因子。`UNITY_MATRIX_P[1].y` 是投影矩阵的第二行第四列的元素，它与视场角有关。`2.414` 是一个近似值，用于计算FOV的一半（因为 `2 * arctan(1/2)` 约等于 `2.414`）。这个因子用于将深度值转换为屏幕空间的尺寸。
    float fovFactor = 2.414 / UNITY_MATRIX_P[1].y;
    //- 这行代码计算了顶点深度值在屏幕空间的绝对值。`positionVS_Z` 是顶点在视空间中的Z坐标，乘以FOV因子后，可以得到一个与视角相关的尺寸值。
    float z = abs(positionVS_Z * fovFactor);
   //- 这行代码从材质属性中获取轮廓宽度参数。`_OutlineWidthParams` 是一个包含四个浮点数的向量，用于控制轮廓宽度的计算。
    float4 params = _OutlineWidthParams;
    //- 这行代码计算一个在0到1之间的插值因子 `k`。`saturate` 函数确保 `k` 的值不会超出0到1的范围。`params.x` 和 `params.y` 分别定义了轮廓宽度计算的起始和结束深度值。`z` 是顶点的屏幕空间深度值。这个插值因子 `k` 用于在不同深度下平滑地调整轮廓宽度。
    float k = saturate((z - params.x) / (params.y - params.x));
    //- 这行代码使用插值因子 `k` 在 `params.z` 和 `params.w` 之间进行线性插值，计算出轮廓的实际宽度。`params.z` 和 `params.w` 分别定义了在 `params.x` 和 `params.y` 深度下的轮廓宽度。zhi
    float width = lerp(params.z, params.w, k);
    return 0.01 * _OutlineWidth * width;

}
```
# 4.轮廓位置

```c
  

float4 GetOutlinePosition(VertexPositionInputs vertexInput, VertexNormalInputs normalInput, half4 vertexColor)

{

    float z = vertexInput.positionVS.z;

    float width = GetOutlineWidth(z) * vertexColor.a;

  

    half3 normalVS = TransformWorldToViewNormal(normalInput.normalWS);

    normalVS = SafeNormalize(half3(normalVS.xy, 0.0));

  

    float3 positionVS = vertexInput.positionVS;

    positionVS += 0.01 * _OutlineZOffset * SafeNormalize(positionVS);

    positionVS += width * normalVS;

  

    float4 positionCS = TransformWViewToHClip(positionVS);

    positionCS.xy += _ScreenOffset.zw * positionCS.w;

  

    return positionCS;

}
```

# 5. `Varyings` 结构体：
    - 定义了从顶点着色器到片段着色器传递的数据，包括UV坐标和裁剪空间位置。
2. `GetOutlineWidth` 函数：
    - 根据顶点在视空间的Z坐标计算轮廓的宽度。它考虑了视场角（FOV）和一些材质参数（`_OutlineWidthParams`）。
3. `GetOutlinePosition` 函数：
    - 根据顶点位置、法线和颜色计算轮廓的位置。它使用了 `GetOutlineWidth` 函数来确定轮廓的宽度，并根据法线方向调整顶点位置以生成轮廓效果。
4. `OutlinePassVertex` 函数：
    - 顶点着色器的实现。它获取顶点位置和法线的输入，计算平滑法线（如果启用），然后调用 `GetOutlinePosition` 来获取调整后的轮廓位置，并输出到片段着色器。
5. `OutlinePassFragment` 函数：
    - 片段着色器的实现。它采样光照图（`_LightMap`），根据光照图的alpha值（`material`）在不同的轮廓颜色之间进行插值，以实现渐变的轮廓效果。
6.  
```c#

```



# 全部代码
```c++
#include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"

#include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Lighting.hlsl"

  

struct Attributes

{

    float4 positionOS   : POSITION;

    float3 normalOS     : NORMAL;

    float4 tangentOS    : TANGENT;

    float4 color        : COLOR;

    float2 uv           : TEXCOORD0;

    float3 smoothNormal : TEXCOORD7;

};

  

struct Varyings

{

    float2 uv           : TEXCOORD0;

    float4 positionCS   : SV_POSITION;

};

  

float GetOutlineWidth(float positionVS_Z)

{

    float fovFactor = 2.414 / UNITY_MATRIX_P[1].y;

    float z = abs(positionVS_Z * fovFactor);

  

    float4 params = _OutlineWidthParams;

    float k = saturate((z - params.x) / (params.y - params.x));

    float width = lerp(params.z, params.w, k);

  

    return 0.01 * _OutlineWidth * width;

}

  

float4 GetOutlinePosition(VertexPositionInputs vertexInput, VertexNormalInputs normalInput, half4 vertexColor)

{

    float z = vertexInput.positionVS.z;

    float width = GetOutlineWidth(z) * vertexColor.a;

  

    half3 normalVS = TransformWorldToViewNormal(normalInput.normalWS);

    normalVS = SafeNormalize(half3(normalVS.xy, 0.0));

  

    float3 positionVS = vertexInput.positionVS;

    positionVS += 0.01 * _OutlineZOffset * SafeNormalize(positionVS);

    positionVS += width * normalVS;

  

    float4 positionCS = TransformWViewToHClip(positionVS);

    positionCS.xy += _ScreenOffset.zw * positionCS.w;

  

    return positionCS;

}

  

Varyings OutlinePassVertex(Attributes input)

{

    VertexPositionInputs vertexInput = GetVertexPositionInputs(input.positionOS.xyz);

    VertexNormalInputs normalInput = GetVertexNormalInputs(input.normalOS, input.tangentOS);

  

    half3x3 tangentToWorld = half3x3(normalInput.tangentWS, normalInput.bitangentWS, normalInput.normalWS);

    half3 normalTS = 2.0 * (input.smoothNormal - 0.5);

    half3 normalWS = TransformTangentToWorld(normalTS, tangentToWorld, true);

    normalInput.normalWS = lerp(normalInput.normalWS, normalWS, _UseSmoothNormal);

  

    float4 positionCS = GetOutlinePosition(vertexInput, normalInput, input.color);

  

    Varyings output = (Varyings)0;

    output.uv = TRANSFORM_TEX(input.uv, _BaseMap);

    output.positionCS = positionCS;

  

    return output;

}

  

half4 OutlinePassFragment(Varyings input) : SV_TARGET

{

    half4 lightMap = SAMPLE_TEXTURE2D(_LightMap, sampler_LightMap, input.uv);

    half material = lightMap.a;

  

    half4 color = _OutlineColor5;

    color = lerp(color, _OutlineColor4, step(0.2, material));

    color = lerp(color, _OutlineColor3, step(0.4, material));

    color = lerp(color, _OutlineColor2, step(0.6, material));

    color = lerp(color, _OutlineColor, step(0.8, material));

  

    return color;

}
```