# 一 数据结构

前面的基本上和辐照度一样，也就是radiance换成了depth深度
然后每个方向的距离纹素就不是6个，而是14个了。
然后是Depth只有一维
# 二 Depth采样
先拿缓存，depth缓存就是通过RaysBuffer的a通道拿的。（合理利用rgba）
顺便拿个方向上的缓存
# 三 