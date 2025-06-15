# 一 叶柄
行为树最核心的表现
## Action 动作
包含了一个动作执行的原子，执行并返回成功或失败
![](Pasted%20image%2020240919151756.png)

# Condition 条件
判断一个条件并返回成功或失败




# 二 复合行为
## Sequence序列
从左到右依次触发，失败就返回
![](Pasted%20image%2020240919151644.png)



## PARALLEL  并行
**同时**执行所有子节点，满足条件返回true，否则false
* 可以设置Repeat，会重复到条件满足为止

![](Pasted%20image%2020240919151917.png)


## REPEAT 重复
顾名思义，重复
* Repeat Forever:重复执行，除非发生异常或者退出，可以模拟循环
* Until Scuccess：重复执行，直到成功为止
![](Pasted%20image%2020240919152149.png)


## BINARYSELECTOR 条件执行IFELSE
基于条件选择执行左边还是右边
![](Pasted%20image%2020240919173332.png)

##  Switch 开关
根据enum或index进行状态的切换。可以打断其他行为
![](Pasted%20image%2020240919173819.png)



# 三 Decorators（装饰节点）
## Conditional 条件节点
只有满足条件时，才会执行该节点
![](Pasted%20image%2020240919173125.png)


# INVERT 取反
成功变失败，失败变成功
![](Pasted%20image%2020240921110119.png)
# Remap 逆变
图片看起来和INVERT差不多，他也确实包含了取反的功能
可以设置成功或失败后的辩护，成功的可以变为成功、失败，失败的也可以变为成功、失败。
![](Pasted%20image%2020240921105730.png)

# 四 Sub-Behaviour子行为
## SubTree 行为树
执行一个子行为树
![](Pasted%20image%2020240919173617.png)