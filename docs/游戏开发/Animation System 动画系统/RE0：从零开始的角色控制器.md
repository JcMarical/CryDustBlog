# RE0：从零开始的角色控制器

## 一 前期准备

### InputSystem插件

![](https://crydustblog.oss-cn-chengdu.aliyuncs.com/image-20240206110650184.png)
### Cinemachine插件

* 虚拟相机
  * Follow：跟随
  * Look at：盯着角色转
  * Aim: Do nothing
  * Body:
    * Binding Mode:World Place防止乱动


## 二 手持武器行走
### Animator Layers 动画层级

> 玩家持枪站立和玩家行走两个动画如何缝合到一个上面？
> 如何单独控制一个部位的变化？变脸又如何实现？

* 设置：
  * Weight：权重[0,1]，当前动画层级的影响
  * Mask：角色身体的哪些部分会播放我们的动画
    * 资源文件里建立一个新的Avatar Mask文件
      * Humanoid,人性骨骼的影响部位，绿色()
      * Transform，选择非人形的骨骼节点
        * Import skelecton 即可导入节点进行修改
        * 导入了就删不掉，只能重新建立了
  * Blending
    * Override：覆盖其他层级，如**拿枪动画**
    * Additive：混合其他层级，如**疲惫动画**
  * Sync:选择同步，如建立在原动作上的**受伤动画**，**“高兴”和“伤心”动画**
    * Source Layer：选择哪个层级同步
    * Timing：不同动画的时长不一样，动画系统会自动为动画片段进行**缩放并同步**
	    * Timing为权重，0就是以目标选择同步层级为准，1则是以当前选择同步层级为准。
  * IK Pass：如果要使用IK的话，就需要勾选，尤其是**手部**


## 三  动画层级覆盖
动画之间的层级会影响动画显示，如受伤影响了拿枪动画。所以我们必须要把拿枪动画放到受伤动画上面。

## 四  碰到物体会旋转
*  刚体RigidBody设置Y轴锁定Constraint

## 五 武器与IK
* animation rigging：快速定位骨骼
* 将武器拖进去