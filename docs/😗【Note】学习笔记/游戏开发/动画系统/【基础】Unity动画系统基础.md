# Unity动画系统

## 动画获取方式：

动画：mixamohttps://www.mixamo.com/

模型：Fuse软件，Steam

蚌埠住了，fuse用不了，没几个格式能传给mixamo

## 动画文件

都是yaml格式的文件

### AnimationClip

#### 动画复用原理

* 都是对一个属性进行操作，比如门的旋转可以用到其他身上的旋转
* 需要保证游戏对象名字和动画文件的名字相同
* 人物动画则是骨骼旋转的动画，因此类似
* 理论上骨骼重命名保持一致，也可以动画复用 

#### Avatar文件

* Unity使用Avatar文件将模型和骨骼动画重定向成一个**肌肉**系统。
* 两个不同的骨骼和动画



### Animator

#### 属性

* Avatar系统
  * 没有使用Avatar文件，子物体一旦移动位置动画就会丢失。
  * 只要对象使用了Avatar系统，只要在该对象里面，都可以使用正常动画。

* Apply Root Motion
  * 是否启用动画自带位移

* Update Mode
  * Normal，即保持Update更新
  * Animate Physics，和物理系统同步更新，即保持FixedUpdate更新
  * Unscaled Time，跟随时间标尺的影响，即动画速率
* Culling剔除
  * Always Animate一直运动
  * Cull update Transform一直运动，但会剔除IK
  * Cull Completely被看到时，完全剔除动画

#### 功能面板

* Layer：用于制作混合动画
* Parameters：动画片段切换的参数
* 动画片段：
  * Single Animation Clip
  * Blend Tree:动画片段组合成的混合树
  * Another State Machine

### 动画片段导入设置

* 人形动作导入
  * Rig选择Humanoid
* 动作鬼畜
  * copy from another model**发现报错**--骨骼参数不一致
  * 选择copy from this model，apply后，**进入Configure对T Pose进行设置**（大部分旋转设置为（0,0,0）即可）

### 动画片段 AnimatorStateInfo

> `GetCurrentAnimatorStateInfo`获取到动画片段

* Tag：标签，片段.`IsTag()`可以用来判断标签
* Motion：片段
* Speed：播放速度
  * Multiplier:在Parameter中创建的变量，最终值与Speed相乘
  * 由于比较整型字符串和比较整型数据，整型字符串开销更大，所以Unity提供了StringToHash函数，可以先将参数名转换为整型变量。然后设置该参数的值比如`animator.SetFloat("Scalar",animationscalar)``animator.SetFloat(hashScalar,animationscalar)`

* Motion Time：播放到该动画的多少帧

* Mirror：镜像，水平翻转模型

* Cycle Offset：动画偏移，改变动画起始点

* Foot IK：**动画校正机制**，不是适应地形 。

  > Avatar骨骼转变为肌肉，会导致手脚偏移。Foot Ik会保留四个**IK Goal**，开启后，会使动画朝向ik goal和ik hint偏移。

  * 直接更改IK Goal不会改变Foot IK的效果，需要对新的Goal设置**权重**[0,1]。权重越高，脚就会越往goal移动。

  * 为了使用Ik，必须在IK的层级激活IK pass，这样才可以在脚本中调用相关的Ik方法了。

    ```c#
    private void OnAnimatorIK(int layerIndex)
    {
    	animator.SetIKPosition(AvatarIKGoal.RightFoot, new Vector3(0,0,0));   //设置位置 			
        animator.SetIKPositionWeight(AvatarIKGoal.RightFoot,weight);
    }
    ```

* Write Default：**不是很好用**，是否写入没有被运动animated的属性默认值

  * 游戏动画中，动画片段没有调用的属性在正常状态下不会保持不变。

  * 而勾选了Write Default选项中，该动画片段并不是不变，而是使用了最开始游戏对象`OnEnable`的初始值。

  * 不好用，是因为物体的每一次`OnEable`都会激活一遍默认值，导致变化太多。

  * 具体使用

    

    > 下面这个实例的开门动画中，如果是now property，电梯门会在不是(0,0,0)的上方打开（如果有其他动画将电梯移动向上）。如果是write property，则一定在下面（0,0,0）的位置打开

| Property          | Default | now property | write property |
| ----------------- | ------- | ------------ | -------------- |
| Elevator Position | 0,0,0   | Null         | 0,0,0          |

具体使用方式可以参照下面的文章：https://blog.csdn.net/rickshaozhiheng/article/details/77838379

### 动画状态转换 Transitions

* 名称：默认是state -> state，可以自己修改
* Transitions：显示该条线上所有的转换
  * solo：只考虑solo的转换，不考虑其他的。多个则在solo中判断优先度
  * mute：勾选了mute的转换永远不会执行
* Has Exit Time：勾选后，播放到设置的时间段后就会自动播放下一个
* Settings:
  * Exit Time：动画开始转换的时间
  * Fixed Duration：勾选后，Transition Duration计量单位变为秒
  * Transition Duration：状态转换时间，默认为百分比(%)，上面的勾了则变成秒(s)
  * Transition Offset:下一个状态开始的时间的偏移值,[0,1];
* Interrupt Source：复杂动画转换打断（比如身体动作做完了，立刻打断脸部动作。）
  * None：没有打断
  * Current State：从当前状态出发的任何动画转换可以被当前状态出发的某些其他转换打断，如A->B被A->C打断，则小球会立刻停止A飞到B的过程并飞到C。
    * Order InterruptTion：具有**优先级**，只有优先级比当前转换更高级别的转换才可以打断当前转换。不勾选则全都可以打断，优先级高的可以**优先执行**
  * Next Stage：从当前状态出发的任何动画转换可以被目标状态出发的某些其他转换打断。如A->B,可以被B->C,B->D打断
  * Current State Then Next Stage：优先当前，其次目标
    * Order InterruptTion：同上，只作用于current
* 动画状态转换条件 Conditions
  * 条件参数设置一般在脚本中设置
  * 同一个Transitions中，需全部同时满足条件才可以发生条件
  * 不同的Transitions中，只要满足一个就可以发生转换

## 单变量混合树 1D BlendTree

用一个值来控制不同的状态

Motion:需要混合的动画

* Threshold：不同动画的阈值s



## Root Motion根运动 & In Place 动画比较

动画自带位移， 记录的是绝对**坐标和方向**

* 如果启用了Apply Root Motion

  * 默认状态下，动画会使用自带的相对位移、旋转等变换（但这样做可能因为动画本身的制作导致位移偏移）

  * 脚本中如果启用了`OnAnimatorMove()`方法，则不会直接启用RootMotion，而是交给**脚本调用**

  * 我们可以在脚本中获取到动画文件的下一帧偏移。

    ```c#
    //这一句代码就可以实现rootMotion的位移了
    transform.position +=animator.deltaPosition;
    //此外还有deltaRotation角度变换等应用
    ```

### Generic

Generic也有自己的Avatar，但只用管理一个骨骼**Root Node**,实际上的作用就是讲角色**根骨骼hips**的运动应用到游戏对象上

* 实际工作中，3D美术会给模型单独制作一根骨骼，它不是deformation bone，该骨骼作为根骨骼仅用来记录位移和旋转。
* UE没有Avatar,所以必须给人物模型单独添加一个专门的根骨骼（UE用户可以使用一个插件一键傻瓜式在Blender添加根骨骼:**mixamo_converter**）

#### 基础设置

> 全部交给RootMotion还是不令人放心，尽量用代码吧

* **Root Transform Rotation**
  * bake Into Pose：不要把根骨骼的旋转当作RootMotion处理 （游戏对象跟着骨骼旋转），而是当作一般的骨骼动画处理（游戏对象不旋转，仅骨骼旋转）。
  * Based Upon：初始方向
    * Original:3D动画本来就制作好的
    * Root Node Rotation:算出来的，一般不准
  * Offset：可以设置方向的偏移量

* Root TransforPosition(Y)
  * bake Into Pose：不要把根骨骼的Y轴位移(向上向下，如跳跃)当作RootMotion处理 

* **Root Transform Rotation(XZ)**
  * bake Into Pose：不要把根骨骼的X、Z轴位移(前后左右，如奔跑等水平平面位移)当作RootMotion处理 

### Humanoid

* unity分析骨骼结构，会计算出重心**center of mass**，也可以称为**body transform**

  * 而重心在水平面上的投影，就会被当作**Root Motion**的根骨骼节点使用，这个点叫做**root transform**

  * 脚本中可以方位它的坐标和指向，可用`OnDrawGizmos()`方法打印出来

    ```c#
    private void OnDrawGizmos(){
    	Gizmos.color = Color.green;
    	Gizmos.DrawSphere(animator.bodyPosition,0.05f); 
    }
    ```

#### 基础设置

大部分和Generic一样：

不过Based Upon稍微有点不一样：

* Root Transform Rotation
  * Original:3D动画本来就制作好的
  * Body Orientation:算出来的，一般不准

* Root TransforPosition(Y)
  * Based Upon：初始方向
    * Original:3D动画本来就制作好的原点
    * Center of Mass:重心：
    * Feet：脚（比如脚陷入地下就可以调整到feet，或者看看baked in Pose有没有勾选上）

### 再谈BlendTree

* Compute Threshold：自动计算阈值（适用于Root Motion）
  * Velocity Z：选择该选项，就可以自动计算水平位置的位移
* Adjust Time Scale：自动计算播放速度
  * Idle由于不需要位移所以可以设置成1
  * 或者先排除原地不动的idle，计算后再加进来，这样更准确（存疑）

### 模型差异，速度不同

不同模型的缩放Scale会导致同一状态机产生的速度不同。

解决方法：

* `anomator.Speed/= animator.humanScale`
* 或者设置一个速度因子，将其传给混合树的muliply属性：`animator.SetFloat("ScaleFactor",1/animator.humanScale)`

### 自定义动画速度

> 标准的动画移动和播放速度是制作者给定的，我们如何调整动画移动速度，并使动画播放速度与之匹配？

* 人物可以修改阈值threshold来改变动画移动速度，而动画播放速度初始会默认为`1`
* 修改方法：
  * 先记录下来目前的动画移动速度(Threshold)$V_0$
    * 不需要太精确，因为unity自动计算出的值也是一个平均值
  * 确定你需要的**预期动画速度$V_1$**
  * 播放速度修改：设置为: $S=V_1/V_0$（unity输入除法可以自动计算出值）
  * 动画移动速度(Threshold) : $V_0$修改为$V_1$

> 去看动画RootT.z，会发现速度并不是完全线性的(unity计算出的速度只是平均速度，并不是稳定的）

* NPC则基本上需要使用导航系统（unity有内置导航系统Navigation）了，那就不能用Root Motion了

Root Motion原本要解决的问题就是**同步**，而不是**位移**。

---

我们需要将动画速度赋值给rigidbody组件，并且确保动画是通过物理计算的（Update Mode = Animate Physics）

为什么不放在FixedUpdate()?

* 因为OnAnimatorMove()具体调用时间在`FixedUpdate()`和动画系统之后，物理引擎计算之前，也是同步的
![img](https://crydustblog.oss-cn-chengdu.aliyuncs.com/image-20240202234350663.png)
## 重力不起作用？RootMotion和Rigidbody的冲突

* 没有y轴的bake Into Pose

* 使用`OnAnimatorMove`，每次循环会刷新rigidbody的速度。

  * 解决方法，传入上次的速度，在Move中这样修改：

    ```c#
      Vector3 vector3 = new Vector3(animator.velocity.x, rig.velocity.y, animator.velocity.z);
            rig.velocity = vector3;
    ```

