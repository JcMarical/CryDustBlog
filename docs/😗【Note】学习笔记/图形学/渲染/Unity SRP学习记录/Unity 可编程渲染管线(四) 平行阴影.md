# 多光源阴影
单光源
![[Pasted image 20250205104839.png]]
多光源
![[Pasted image 20250205104819.png]]
阴影图集
![[Pasted image 20250205105605.png]]

# 初版多光源阴影
![[Pasted image 20250205145426.png]]


# 级联阴影
为每个光源都创建四个级联阴影贴图，最多可以达到4x4的贴图划分。每个级联阴影也需要对应的阴影矩阵

![[Pasted image 20250205190240.png]]

其本质是剔除球体的创建
![[Pasted image 20250205190652.png]]


# 阴影淡化 
![[Pasted image 20250206133825.png]]

# 级联淡化  

![[Pasted image 20250206192341.png]]

# Depth Bias&slope-scale bias
##  光线推离光源
50000能消除一个伪影
500000才能基本消除全部的bias，导致PeterPanning
![[Pasted image 20250206193352.png]]
## 斜率刻度偏差
改变斜率，这里后面用于设置灯光的微调，原理差不多，也有perter-panning

# Normal Bias
 根据深度计算纹素大小，并将其提前沿法线偏移
![[Pasted image 20250206202107.png]]

# Shadow Pancaking
![[Pasted image 20250206205718.png]]
![[Pasted image 20250206205624.png]]


# PCF
![[Pasted image 20250206214155.png]]

# Cascade Blend级联混合


![[Pasted image 20250206214738.png]]
## 插值过渡与抖动过渡
![[Pasted image 20250206222149.png]]


# Culling Bias 剔除偏差
如果保证被覆盖，则可以剔除一些总是被覆盖的阴影投射物
![[Pasted image 20250206222337.png]]![[Pasted image 20250206222345.png]]

# 阴影模式
![[Pasted image 20250206224604.png]]