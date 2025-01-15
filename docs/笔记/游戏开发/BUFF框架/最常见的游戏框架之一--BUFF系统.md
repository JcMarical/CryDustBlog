# BUFF Info 基本Buff数据结构
## BuffData
### 基本信息
+ ID：区分Buff辨别的基础
+ buffName：
+ description
+ icon
+ maxStack；
+ priority:buff优先级 
+ EBuffType：buff主要类型枚举，如正面/负面效果
+ string[] tags：

### 生命周期信息
* isForever：是否为永久 
* duration：Buff持续时间
* tickTime: 间隔触发时间


### 回调点
+ OnCreate
+ OnRemove
+ OnHit
+ OnBehurt
+ OnKill
+ OnBeKill
+ OnTick
* 其他业务需要的回调点（根据需要进行扩展）


### 更新方式
BuffTimeUpdateEnum

# InfluenceInfo 影响因子




# BaseBuffModule