# SSS Lut（look up Texture查找纹理）
![[Pasted image 20241007190448.png]]
## 思路
+ 看起来是SSS效果
+ 应该是个RampTex
+ RampTex的内容似乎在变
+ RampTex上下没有变化
## 解决方案
+ 让rampTex上下有变化
+ 开放采样RampTex的V坐标值
![[Pasted image 20241007190433.png]]
+ SSS贴图https://www.blainebrezina.com/face-rendering-1
  ![[Pasted image 20241007190601.png]]


# 预积分皮肤
即SSS纹理计算的原理，略。