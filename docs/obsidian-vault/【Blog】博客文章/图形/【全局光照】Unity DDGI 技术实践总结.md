---
date: 2025-06-28T15:53:42
publish: false
comments: true
permalink: ""
aliases:
---

# 【全局光照】DDGI 技术总结

最近参与了Tencent的远程课题组，做了这样一个全局光照DDGI的探究并将其移植到Unity，这里也是总结一下最近复刻的一些成果：

- 原论文：[Dynamic Diffuse Global Illumination with Ray-Traced Irradiance Fields](https://jcgt.org/published/0008/02/01/paper.pdf)

# 问题提出
在DDGI之前，首先回顾**classical irradiance probes**和**传统体素光照**一直以来的问题：
- 远离探测器中心点进行采样时，容易出现**leaking of light or shadow**
如果探针附近的光线因为墙壁而发生剧烈变化，它们可能会从室外的阳光中吸收**光线**进入屋内，或者从室外的黑暗中吸收**阴影**进入屋内：

漏光：

![image-20250628171351258](https://crydustblog.oss-cn-chengdu.aliyuncs.com/image-20250628171351258.png)

伪影：

![Pasted image 20250628155727](https://crydustblog.oss-cn-chengdu.aliyuncs.com/Pasted%20image%2020250628155727.png)

# 问题解决

DDGI论文在**light field probes**数据结构基础之上，作出了以下贡献：

## 1. 漏光
1. 存储用于防止**漏光、漏影**的**visibility information**。
2. 在**着色**的**采样**阶段进行**空间域**上的**trilinear interpolation（三线性插值）**， 从而应对场景在**时域**上不断变化的几何物体和动态光线。

## 2. 动态漫反射
- **每帧硬件光线追踪**：为了应对动态的几何物体和光线，**每一帧**对场景中的 m 个活动探针根据随机序列发射 n 条光线。
	- 为保证性能，活跃探针大概发射144~255的动态均分分布光线。
	- 采用稀疏摆放的Probe来降低光线追踪所需的采样数
	
- **radiance纹理存储光追结果**：对探针发出的每一条光线进行追踪，对光线与场景的各个**相交点**进行着色计算得到**radiance**，可以看做一个Gbuffer，存储交点的Albedo，Normal，Position等用于后续计算。

  - **阴影采样**：采用二次光追，向光源投射射线用于判断遮挡

  ![img](https://crydustblog.oss-cn-chengdu.aliyuncs.com/v2-0323ce85861f3419f47e9895b16f9d66_1440w.png)

- **irradiance压缩存储间接光**：采用八面体纹理存储加速计算——在**空间域**上，对探针的每个texel，计算其半球内发射光线与场景相交点的radiance对于新一帧**irradiance**的贡献，过滤得到当前帧的irradiance；并结合上一帧已保存的irradiance，在**时域**上**混合**得到当前帧最终的irradiance。

![img](https://crydustblog.oss-cn-chengdu.aliyuncs.com/v2-b44ad9ae0299421d6302ced05edde367_1440w.png)

![image-20250628164500937](https://crydustblog.oss-cn-chengdu.aliyuncs.com/image-20250628164500937.png)



> 注意区分Radiance 和 Irradiance

![image-20250628161548370](https://crydustblog.oss-cn-chengdu.aliyuncs.com/image-20250628161548370.png)



## 3. 无限次弹射
其实论文里面只是简单带过了一下，我觉得比较有意思就单独写一下，这里lumen做的无限次弹射其实也是和其类似。通过时域和累积权重，采样过去已经被间接光处理的贴图，在时间域上做到无限次反弹。

而由于权重会根据时间无限次变小直到逼近于0，所以也不会出现间接光叠加过度的问题。

这方案提出的比lumen早，不知道lumen有没有收到DDGI的影响。
> ​**​2021年UE5 Lumen​**​首次在消费级硬件上实现实时无限次弹射，标志着技术从理论走向实践
## 4. 消除手动探针和代理放置

DDGI之前的一些GI方案，如果不进行手动调整，就无法自动避免导致明暗（即阴影）泄漏或阴影bias的探针放置。为了避免这些问题，一些引擎转而依赖**屏幕空间光线**跟踪来实现**像素级精确反射**。

但屏幕空间GI有一个很大的问题，但是，当反射对象从摄像机的视角不可见时，这些方法会失败，从而导致照明不一致和视图相关。

> 包括最近玩的《33号远征队》估计也是采用了屏幕空间GI方案，当靠近墙的时候几乎全黑，视野里出现光源的时候光照出现明显变化，能明显看出来变亮了。
# 缺点

- **漫反射**：其天生低频特质，中间还对光追采样做了**过滤**得到irradiance再进行光照，所以只适合做漫射GI，故又称弟弟GI
- **依赖硬件加速**：脱离了RTX硬件光追支持，加速效果会显著降低（不过在网上我看到有通过SDF加速光追来实现DDGI效果的改进）
- 局部死黑问题：由于探针体素自适应摆放的方式，虽然避免了手动排布探针，但是

# 移动端优化方案

之前做课题时的目的是将其优化到移动端上，做了不少的调研，不过因为找工作的事情耽搁了，这里就暂时列一下设想中的一些优化方案（不保真，因为没实际测试过）

- 尝试自适应的Volume放置方案（如根据摄像机放置）
- 层级摆放：考虑根据类似LOD、CSM的方案，根据远近位置不同控制稀疏程度
- 改进剔除算法，考虑遮挡剔除
- **用SDF Ray March**代替预计算光追（浙大做过一版，发在了TGDC2020，雷火好像也使用过类似的方案并且作出了优化）

