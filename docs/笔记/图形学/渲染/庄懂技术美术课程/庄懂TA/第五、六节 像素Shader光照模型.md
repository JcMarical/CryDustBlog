## VSCode 插件Debug
+ ShaderLabVS

# Shader黑话--各种向量
## 常用向量（全得记）
+ nDir:法线方向（转换一下世界坐标）
+ lDir: 光照方向（直接获得吧）
+ vDir:观察方向（世界坐标-pos），一般计算出来得归一化一下
+ rDir：光反射方向
+ hDir：半角方向(HalfWay),lDir和vDir的中间角方向，点乘操作时简称h（记得归一化）；

## 所在空间：
+ OS：ObjectSpace 物体空间，本地空间；
+ WS：WorldSpace 世界空间；
+ VS： ViewSpacce 观察空间；
+ CS：HomogenousClipSpace 齐次裁剪恐慌
+ TS：TangentSpace 切线空间
+ TXS：TextureSpace 纹理空间

## 举例
nDirWS：世界空间下的法线方向

# 光照模型
+ Phong：适合玻璃水冰，更尖锐
+ Blinn-Phong：更便宜（但对于现在的设备来说微乎其微了），适合金属

# 像素Shader拆解四段法
+ 准备要用到的向量，不会计算就去SF拆
+ 准备要用到的中间数据
+ 便些光照模型
+ 后处理（本例无），返回结果


# FakeEnvReflect假环境光照
用便宜的方法模拟环境光照
将下面的两个加起来：
+ Phong取Ramp（这个是重中之重）+环境系数
+ 单独的Phong

# 贴图制作
Substance Designer制作


## 生锈
+ 噪声贴图+单独的光照模型或者无光照
+ 其余部分就普通的光照模型

## 排线规整化问题
+ 使用模型中心深度 = mul(unity_ObjectToWorld, float3(0,0,0))

# BRDF双向反射分布函数




