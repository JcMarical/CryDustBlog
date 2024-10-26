# Lerp 
+ lerp是线性插值缩写
```c
lerp(a, b, t) = a + (b - a) * t
```




## fovFactor，用来控制深度和屏幕空间的大小保持一致

```c
    float fovFactor = 2.414 / UNITY_MATRIX_P[1].y;
    float z = abs(positionVS_Z * fovFactor);

	 float4 params = _OutlineWidthParams;
    float k = saturate((z - params.x) / (params.y - params.x));
    float width = lerp(params.z, params.w, k);

  

    return 0.01 * _OutlineWidth * width;
```