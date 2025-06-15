# 探针参数
PROBE_IRRADIANCE_TEXELS纹素：6根
PROBE_DISTANCE_TEXELS深度：14根
BACKFACE_DEPTH_MULTIPLIER：
MIN_WEIGHT：


# 光线缓存
存储了所有的光线
RayBuffer：rgb存irradiance，a存透明度。



# CBUFFER
- `_ProbeFixedRayBackfaceThreshold` ：背面光线数量占比检测阈值
