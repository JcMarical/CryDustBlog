# RE2：使用Character和Root Motion控制角色移动
# 一 设置
* 碰撞体三维设置
* Slope Limit：爬坡角度限制
* Step Offset：台阶跨越
* Skin Width：相当于在自己的碰撞体之外，添加了一个和角度相关的碰撞体。
	* 一般用来防止卡死，设置成碰撞体半径1/10比较合适
	* 正面影响大，侧面影响小
* Min Move Distance：小于这个值的移动会被忽略
# 使用
1. 控制器脚本获取组件
2. 使用OnAnimatorMove方法
3. controller.Move(animtor.deltaPositon)方法,需要手写重力
4. controller.SimpleMove(animator.velocity)方法