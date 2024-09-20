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
	* 优先级顺序：越下面的层级优先级越高，不过也和Blending设置有关。
	* Weight：权重[0,1]，当前动画层级的影响，1则为全部替代
	* Mask：角色身体的哪些部分会播放我们的动画
    * 资源文件里建立一个新的Avatar Mask文件
      * Humanoid,人性骨骼的影响部位，绿色()
      * Transform，选择非人形的骨骼节点
        * Import skelecton 即可导入节点进行修改
        * 导入了就删不掉，只能重新建立了
  * Blending
    * Override：覆盖其他层级，如**拿枪动画**
    * Additive：混合其他层级，如**疲惫动画**。注意：如果被混合的层级根本没有相应的动画Curve，则没有影响（比如有个动画就没有手臂动画曲线，那么是不会混合的，不能混合不存在的动画）
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

### 5.1 准备
* animation rigging：快速定位骨骼
* 将武器拖进去

### 5.2 原理
* 原理：CCD循环梯度下降
* 正向动力学问题：上级旋转误差会累积到下一级

### 5.3 使用
* 需要IK的动作请设置IK Pass选项
* 在控制器脚本中，使用OnAnimationIK()函数
* 把双手两个IK Goal位置和角度权重设置为1
```c#
private OnAnimationIK(int layerIndex)
{
		animator.SetIKPositionWeight(AvatarIKGoal.LeftHand,1f);
		animator.SetIKRotationWeight(AvatarIKGoar.LeftHand,1f);
		animator.SetIKPositionWeight(AvatarIKGoal.RightHand,1f);
		animator.SetIKRotationWeight(AvatarIKGoar.RightHand,1f);
		Debug.Log(layerIndex);
}

```
* 如果枪的位置显得不合适，可以设置一个RightHandPosition空物体，并让手的IK Goal位置与这个一致
```c#
private OnAnimationIK(int layerIndex)
{
		animator.SetIKPosition(AvatarIKGoal.RightHand,rightHandPosition.position)
		animator.SetIKRotation(AvatarIKGoal.RightHand,rightHandPosition.position)
		animator.SetIKPosition(AvatarIKGoal.LeftHand,legtHandPosition.position)
		animator.SetIKRotation(AvatarIKGoal.LeftHand,leftHandPosition.position)
		Debug.Log(layerIndex);
}
```


## 六 Animation Rigging功能
> 离成功总是差那么点
* Rig：控制骨骼的工具
* 多种约束提供选择

## 七 动画状态机控制IK

### 7.1 切换Target
* 切换Target，一般要编写脚本。但简单一点就可以直接将两个target的位置本身存成动画片段。
* 然后把他们用一个新的Layer存起来，实现两个动画片段的过渡

### 八 拔枪、收枪和动画片段三种操作
### 8.1 分割
Inspector--Animation设置中有滑块可以分割需要的动画

###  8.2 设置循环
请确保起始帧和结束帧足够的相似。相似度可以通过下面绿色条形图来判断


### 8.3 动画事件
以拔枪收枪为例，我们需要将枪放在肩部骨骼上。通过**动画事件**在拔枪收枪动画合适的时间中切换位置
* 注意：这里是在Inspector中直接设置动画文件的事件Events。而不是在Animation动画窗口添加动画帧事件
* 原理：发送一个Message，并调用这个游戏对象上绑定的所有这些组件
* 造成的问题：**扭曲**，IK可能会把原动画覆盖掉。后面使用Curve来逐渐减少IK权重

### 8.4 为动画添加Curve
* 可以为没有root Motion的动画添加Curve
* 为IK权重变化（保证接触到枪时为1，脱离时为0）
![[Pasted image 20240915124938.png]]
* 在Animator的Parameters建立一个和动画曲线同名的float类型参数，curve的参数变化会自动传入