# 十八 迭代器和泛型for

## 1.迭代器和闭包
* 迭代器：遍历一个集合中所有元素的代码结构
* 典型：io.read()
* 机制： 保存状态（闭包）
	* 闭包结构 = 闭包本身 + 封装变量的工厂
* 举例，返回元素的值
```lua
function values (t)
	local i = 0
	return function() i = i+1

end
```
