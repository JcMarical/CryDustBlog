lua中使用C#的类相当简单
直接CS.命名空间.类名
Unity的类 比如 GameObject Transform等等 -- CS.UnityEngine.类名就可以


调用逻辑其实是：
- Unity中写Lua
- xlua帮我们处理

# 一 使用C#类

![[Pasted image 20250220230306.png]]
## Lua的Main函数
```lua
require("test1")
```
## test1.lua文件
lua中没有 new，所以我们直接 **类名括号** 就是实例化对象。
- 默认调用--等同于无参构造
- 传参，就是有参构造
```lua
local obj1 = CS.UnityEngine.GameObject()

local obj1 = CS.UnityEngine.GameObject(“测试”)


```

为了方便使用并节约性能，我们可以**定义全局变量存储**C#中的类
```c++
GameObject = CS.UnityEngine.GameObject
local obj3 = GameObject("111");
```
### 类中的静态对象
--类中的静态对象 可以直接使用.来调用
```c++
local obj4 = GameObject.Find("测试")
```

### 获得对象中的成员变量和静态方法
静态方法也可以直接用
```lua
print(obj4.transform.position)
Debug = CS.UnityEngine.Debug
Debug.Log(obj4.transform.position)
```

### 对象中的成员方法
冒号`:`的作用，可以把对象直接传进去，相当于
```lua
Vector3 = CS.UnityEngine.Vector3
obj4.transform:Translate()
			--相当于obj4.Tranlaste();
```

## 获取继承Mono的类
- lua中==不支持带泛型的函数==，Unity提供了一个==含Type参数的Addcomponent方法==
- xlua也提供了一个重要的方法叫做==typeof()==

```c++
local obj5 = GameObject("加脚本测试")
obj5::AddComponent(typeof(CS.LuaCallCSharp));

```

# 二.枚举
![[Pasted image 20250220230518.png]]

# 三.List Dictionary
![[Pasted image 20250220230701.png]]![[Pasted image 20250220230727.png]]

# 四 拓展方法（静态类）
![[Pasted image 20250220231759.png]]

# 五 Ref和out

Ref需要占位，out不需要
![[Pasted image 20250220232138.png]]

## 混合使用
混合使用就是从左到右依次对应
![[Pasted image 20250220232427.png]]

![[Pasted image 20250220231932.png]]
# 六 重载函数调用
![[Pasted image 20250220232720.png]]
![[Pasted image 20250220232534.png]]
# 七 委托和事件
## 调用委托
第一次往委托中加函数，因为是nil，不能直接+

![[Pasted image 20250220233752.png]]

![[Pasted image 20250220233905.png]]
## 调用事件
Lua的事件甲减函数 和 委托非常不一样
类似使用成员方法。
![[Pasted image 20250220234154.png]]

# 九 二维数组遍历
![[Pasted image 20250220234253.png]]

# 十 null和nil比较
 ![[Pasted image 20250220234355.png]]

# 十 特殊问题
# 一 系统类型和Lua能相互访问
## CSharpCallLua
- 自定义委托：目的让Xlua识别这个是装函数的
- 接口

## LuaCallCSharp
- **拓展方法时**
- 该特性建议每个被lua调用的类都加上，用来提升性能


## 无法为系统类和第三方库代码使用
- 一定要是在静态类中
- 一定要生成代码

## 静态类汇总：好处就是把所有特性汇聚在一起

## 十一 协程相关知识点
![[Pasted image 20250220235337.png]]
![[Pasted image 20250220235359.png]]

# 十二 泛型
![[Pasted image 20250220235451.png]]