# 第三部分《Programming in Lua》语言特性

# 十八 迭代器和泛型 for

## 1.迭代器和闭包
- 迭代器：遍历一个集合中所有元素的代码结构
- 典型：io.read()
- 机制： 保存状态（闭包）
    - 闭包结构 = 闭包本身 + 封装变量的工厂
- 举例，返回元素的值
```lua
function values (t)
    local i = 0
    return function() i = i+1;
    return t[i] end
end
```
在这个例子中，values 就是工厂。每当调用这个工厂时，它就会**创建一个新的闭包**(即迭代器本身)。这个闭包**将它的状态保存在其外部的变量 t 和 i 中**，这两个变量也是由 values 创建的。每次调用这个迭代器时，它就**从列表 t 中返回下一个值**。在遍历完**最后一个元素后迭代器返回 nil**，表示迭代结束。

可以利用 while 或者 for 来使用这个迭代器

## 2. 泛型 for 语法
保存了三个值：
- 一个迭代函数
- 一个不可变状态
- 一个控制变量:变量列表第一个，永远不为 nil
```lua
for var-list in exp_list do
    body
end

for k, v in pairs(t) do print(k, v) end
```

## 3.无状态迭代器（如ipairs）
特点：
1.  不保存任何状态
2.  多个循环使用同一个迭代器，避免创建**新闭包的开销**

ipairs示例：
```lua
lua function iter (t,i)
	i = i+1
	local v = t[i]
	if v then
		return i,v
	end
end

function ipairs( t )
	return iter, t ,0
end

function pairs(t)
	return next,t,nil
end
```


# 二十 元表和元方法
> 可以认为，元表是面向对象领域中的受限制类。像类一样，元表定义的是实例的行为
> 
> 不过，由于元表只能给出**预先定义的操作集合的行为**，所以元表比类更受限。
> 同时，元表也**不支持继承**

* 元表可以修改一个值在面对一个未知操作时的行为。
* Lua 语言中的每一个值都可以有元表
* 每一个**表和用户数据类型**都具有**各自独立的元表**
* 其他类型**共享对应类型所属的同一个元表**
```lua
t = {}
print(getmetatable(t))  -->nil
```
设置元表(在lua种，我们**只能为表设置元表**)
如果要为其他类型的值设置元表，则必须通过**C代码或调试库**完成

```lua
t1 = {}
setmetable(t,t1)
print(getmetatable(t) == t1) -->true
```

# 二十一 面向对象编程
## 1.对象
Lua一张**表即为对象**，拥有一个与其值无关的标识**self**。

## 2.方法(self,冒号操作符)
+ 全局名称（糟糕，只能针对特定对象使用）
```lua
function Account.withdraw(v)
	Account.balance = Account.balance - v
end
```


+ 指定对象
```lua
function Account.withdraw(self,v)
	self.balance = self.balance - v
end


--使用
a1.withdraw(a1,100.00)
```

使用参数self是所有面向对象语言的核心点，大多数面向对象语言都隐藏这个机制。Lua语言同样可以使用冒号操作符隐藏
```
function Account:withdraw(v)
	self.balance = self.balance - v
end
```
* 
## 3. 类Class
Lua语言中没有类的概念，截至目前，我们的对象具有了标识、状态和对状态进行的操作。但还缺乏类体系，继承和私有性



+ 利用元表来实现原型
```lua
setmetatable(A,{__index==B})
```
在此之后，A就会在B中查找所有它没有的操作。可以把B看作对象A的类。

+ 或者就直接使用__index元方法实现原型继承.
a创建的时候自动将**mt作为其元表**，deposit在a找不到则会自动在__index中寻找
```lua
local mt = {__index = Account}

function Account.new(o)
	o = o or{}
	setmetable(o,mt)
	return o
end


--- 创建新账户调用方法
a = Account.new(balance = 0)
a:deposit(100.00)

```


* 改进
	* 不创建扮演元表角色的表而是把表直接Account用作元表
	* 第二种改进，对new方法也使用冒号语法。
```c++
function Account:new(o)
	o = o or {}
	self.__index = self
	setmetatable(o,self)
	return o
end
```


### 继承
由于类也是对象，因此它们也可以从其他类获得方法，这种行为使得继承可以很容易在Lua语言中实现.

* Lua语言中有一个有趣的特性：
	* 无需为了**指定新行为**而创建新类。如果一个函数withdraw里面实现了原型的getlimit方法。想要修改则直接在类里面重新设置getlimit方法就好了


### 多重继承
`__index`只是实现继承的一种方法，是最均衡的做法。

当然，还有其他方法。


#### createClass
定义一个独立的函数来创建子类，设置新类元表中的元方法__index，由元方法来实现多重继承。
虽然是多重继承，每个实例仍属于单个类，并在其中查找所有的方法。

```c++
local function search(k,plist)
	for i = 1, #plist do
		local v = plist[i][k]
		if v then return v end
	end
end


function createClass(...)
	local c = {}    ---新类
	local parents = {...}  --- 父类列表

	-- 在父类列表中查找类缺失的方法
	setmetatable(c,{__index = function (t , k)
		return search(k,parents)
	end})

	-- 将'c'作为其实例的元表
	c.__index = c

	-- 为新类定义一个新的构造函数
	function c:new(o)
		o = o or {}
		setmetatable(0,c)
		return o
	end

	return c
end


---使用

NamedAccount = createClass(Account,Named)

```
首先，lua语言在子类找不到某个方法，那么就会查找该子类的元表c的__index字段，从__index查找就会发现这是一个函数，那么Lua语言就调用了这个函数，即search。
该函数遍历每一个父类，直到找到对应的方法。
缺点：
* 搜索具有复杂性，所以性能不太好

* 也可以将继承方法移动到子类中，可以达到访问局部方法的速度，但是这样就不好修改方法定义了。

## 4. 私有性(信息隐藏)
Lua并没有提供私有性机制，
* 一方面这是使用普通结构（表）来表示对象所带来的后果。
* 一方面为了避免冗余和人为限制所采取的方法，程序员不想访问就**不要去访问**
* 一种常见的作法就是把所有私有名称的**最后都加上一个下画线**

尽管如此，Lua语言的另外一项设计目标就是灵活性，提供能够模拟许多不同机制的**元机制**。
* 基本思想：两个表来表示一个对象，一个存状态，一个存操作（接口），通过第二个表来访问对象本身。第一个表则为**私有表**
* 这是通过**设置函数内部局部变量和方法+返回方法名称**实现私有
* 而不放入接口中的函数就是**私有方法**
```lua
function newAccount(initialBalance)
	local self = {balance = initialBalance}

	local withdraw = function(V)
		self.balance = self.balance - v
	end

	local deposit = function(v)
		self.balance = self.balance + v
	end

	local getBalance = function return self.balance end

	return{
		withdraw = withdraw,
		deposit = deposit,
		getBalance = getBalance
	}
end
```



## 5.单方法对象
使用单方法对象可以不用创建接口表，只用将这个单独的方法以对象的表现形式返回即可
* 举例：一个在内部保存了状态的迭代器就是一个单方法对象
* 另一种情况：一个根据不同的参数完成不同任务的分发方法(这样其实很**高效**，)
	* 每个对象使用一个**闭包**，要比使用一个表的**开销更低**
	* 虽然不能继承，但可以拥有完全的私有性：访问单方法对象中某个成员只能通过该对象的唯一方法。
```lua
function newObject(value)
	return function(action,v)
		if action == "get" then return value
		elseif action == "set" then value = v
		else error("invalid action")
		end
	end
end

---use
d = newObject(0)
print(d("get"))
d("set",10)
```

## 6.对偶表示
实现私有性的另一种方式：表当作键，同时又把对象当作表的键
```lua
table[key] = value

key = {}

key[table] = value
```

举例：银行账户
好处在于即便能访问withdraw，除非能同时访问balance，否则也不能访问余额
```lua

local balance =  {}
Account = {}

function Account.withdraw(self,v)
	balance[self] = balance[self] - v
end

```

### 缺陷
一旦这样做，那么这个账户对于垃圾收集器而言**永远不会变为垃圾**，直到**显式删除**
##  优点
无须修改即可实现**继承**

# 二十二 环境
Lua语言不使用全局变量，但又不遗余力地进行模拟。

第一种近似模拟是把全局变量保存在_G表中。因此`_G._G = _G`
## 1.具有动态名称的全局变量
一般，赋值操作对于访问和设置全局变量已经够了。然而有时也需要某些形式的元编程。
```c++
	value = _G[varname]
```
* 如果直接使用`_G["io.read"]`，显然不能从表io中得到字段read的。但我没可以编写一个函数getfield让getfield("io.read")返回想要的结果。这个函数主要是一个循环，从_G开始逐个字段地进行求值
```c++
function getfield(f)
	loval v = _G
	for w in string.gmatch(f,"[%a_][%w_]") do
		v = v[w]
	end
	return v
end

```


## 2.全局变量的声明
lua本身变量声明即可访问，但我们要避免错误的访问不存在的全局变量该怎么做呢？
```lua
setmetable(_G,{
	__newindex = function(_,n)
		error("attemp to write undeclared"..n,2)
	end,
	__index = function(_,n)
		error("attemt to read undeclared variable"..n,2)
	end,
})
```

那么如何声明呢？
方法一：rawset，绕过元方法
```c++
function declare(name,initval)
	rawset(_G, name, inirval of false)
end
```

方法二：使用元方法允许全局变量=nil的赋值



## 3.非全局环境
一个**自由名称**是指没有关联到显示声明上的名称，即它不出现在对应局部变量的范围内。例如，在下面的代码段中，x和y是自由名称。
```
loacl z = 10
x = y + z
```
而lua语言编译器就会将代码段中的所有自由名称x转换为_ENV.x。因此之前代码段
```
local z = 10
_ENV.x = _ENV.y + z
```

> 那么_ENV变量又究竟是什么呢？

Lua语言把所有代码段都当作匿名函数。所以，Lua语言编译器实际上将原来的代码段编译为如下形式
```lua
local _ENV = some value(某些值)
return function(...)
	local z  = 10
	_ENV.x = _ENV.y + z
end
```
Lua语言是在一个名为_ENV的预定义上值存在的情况下编辑所有的代码段的。
+ `_ENV`的初始值可以是任意的表。任何一个这样的表都称为一个环境
+ 为了维持全局变量存在的幻觉，lua语言在内部维护了一个表来用全局环境。
```c#
local _ENV = the global enviroment(全局环境)
return function(...)
	local z  = 10
	_ENV.x = _ENV.y + z
end
```


### 阶段总结
lua处理全局变量的方式：
+ 编译器在编译所有代码前，在外层创建局部变量_ENV;
+ 编译器将所有自由名称var变换为_ENV.var;
+ 函数load(或者loadfile)使用全局环境初始化代码段的第一个上值，即lua语言内部维护的一个普通的表


## 4.使用_ENV
由于_ENV只是个普通变量，因此可以对其赋值或者像访问其他变量一样访问它。

