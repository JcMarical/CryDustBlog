## GPU Instancing
- 相同材质，打包发送到显存的常量缓存区，存成数组。减少到一次DrawCall
- 直接Graphics.DrawInstancedIndirect绘制

## 草地渲染流程
- 利用TrailRenderer将自动淡出的运行轨迹渲染到一张RT上面
- LateUpdate
- 定义草生成的世界坐标
- 更新草的信息
	- 生成草范围的**中心坐标**
	- **包围盒**
	- **草地分块**
- 传入shader和ComputeShader分别进行渲染和计算
- 计算出六个裁剪平面
- 草地构造Bound，进行AABB碰撞测试
- 根据草地块索引使用ComputeShader进行裁剪
- 将裁剪的草数量复制到argsBuffer中
- 绘制草
- 
# 剔除工作
Unity在应用阶段有自己的剔除工作（以对象为单位的剔除），而GPU Instancing无法享受到，所以我们必须有自己的**剔除**。

我们主要分为两次剔除
- CPU端的**剔除**，使用AABB包围盒快速筛选
- ComputeShader的GPU端的剔除
## 草地广告牌
草的**观察矩阵旋转信息**实现广告牌效果，再加上其锚点的世界坐标


# 草地交互
- 利用TrailRender组件，渲染轨迹到一张RT上
- 根据RT，计算影响到的草的位置（世界空间-草地中心/除以整个草地宽度）
- 将影响到的**草尖位置下移**。
- 风场使草倾倒

# 风场模拟
三波风浪
- 最后将偏移量**叠加到顶点位置**即可

# 光照
光照：half-lambert
