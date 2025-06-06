
# 球谐函数
见本系列另一篇文章

# 环境光照：PRT预计算辐射传输(Diffuse Case)
主要是将==光照Lighting==部分和==光照传输部分==分离

## Shadow

即对于每个物体，他的visibility不可见部分
 **注意此处的v是物体对光照的可见性，而不是摄像机**
 
## 基本环境光照的Renderring


对于每一个物体，我们可以通过Lighting，visibility，brdf，算出来最终结果。

![[Pasted image 20250304062249.png]]
但是这样**太浪费了**，假设一面图需要64X64个点，每一个Shading Point需要6x64x64个点

## 只有Lighting变化的情况（场景不能动）
场景中物体都不变（v和brdf不变，即常数），只有lighting变化，
- 那我们就可以用基函数去预计算光照，投影到基函数空间
- 运行时：点乘漫反射
而公式经过变化后可以把基函数都放进常数中
![[Pasted image 20250304063542.png]]

## SH的旋转性，环境光照的旋转
根据球谐函数的旋转性，环境光照可以任意的旋转使用

## SH的正交性，时间复杂度

![[Pasted image 20250304072851.png]]
为什么不是O（n2）,而是O(n)

PRT计算漫反射项中间的乘积。只有基函数相同时才有值，并且为1。不同的话结果就是0咯


# 环境光照：PRT预计算辐射传输(Glossy Case)
对于光滑的物体来说，最大的区别就是他的==BRDF是可变==的。Diffuse部分的漫反射是一个常数，而Glossy部分的会清晰地告诉你往哪个==方向==反射

## 公式变化（新增含o的参数），和视角相关
![[Pasted image 20250304074830.png]]

## 球谐函数需求
Diffuse一般用到三阶就够了，Glossy则可能四阶（16x16）、五阶（25x25）、六阶，再往上消耗变化就越来越恐怖了。

## 更加精细的Glossy
因此，想要做到更加精细，球谐函数就不再那么适用了，因为需要一些更高频的数据。选择其他方案会好一点  

# 其他的基函数
- Wavelet小波：阴影处理的好，但是不支持动态旋转
- 