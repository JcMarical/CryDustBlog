# 九 闭包

## 1.Lua语言中函数是第一类值
* 第一类值:   意味着 Lua 语言中的函数与其常见类型的值（例如数值和字符串）具有同等权限。
* 词法定界:   Lua 语言中的函数可以访问包含其自身的外部函数中的变量

	请注意，在 Lua 语言中，**所有的函数都是匿名的（ anonymous** 像其他所有的值一样，
**函数并没有名字**。当讨论函数名时 ，比如 int **实际上指的是保存该函数的变量** 。

	

* sort函数
```lua
	table.sort(network, function (a,b) return (a. name > b.name) end)
```
* 计算导数

## 2.非全局函数
* 函数不仅可以被存储在全局变量中，还可以被存储在表字段和局部变量中
* 在**表字段中存储函数**中实现面向对象编程的关键要素
* 当把一个函数存储到局部变量时，就得到了一个**局部函数** ，**即一个被限定在指定作用域中使用的函数**。局部函数对于包（ package ）而言尤其有用 。由于Lua将每个程序段（ chunk ）作为一个函数处理，所以在一段程序中声明的函数就是局部函数，**这些局部函数只在该程序段中可见**


## 3.词法定界
* 词法定界外加**嵌套的第一类值函数**可以为编程语言提供强大的功能，但很多编程语言并不支持将这两者组合使用
* 非局部变量(上值)：在该匿名函数中， grades 不是全局变量也不是局部变量
	* 为什么？函数作为第一类值，能够**逃逸**出它们变量的原始定界范围 。
```lua
function sortbygrade (names, grades)
	table.sort(names, function (n1, n2)
		return grades[n1] > grades[n2]
	end)
end
```
* ![[Pasted image 20240809231128.png]]
* 匿名函数访问了一个非局部变量（ count ）并将其当作计数器 然而，由于创建变量的函数（newCounter ）己经返回，因此当我们调用匿名函数时，变量 count 似乎已经超出了作用范围 但其实不然，由于闭包 closure ）概念的存在， lua 语言能够正确地应对这种情况。简单地说，**一个闭包就是一个函数外加能够使该函数正确访问非局部变量所需的其他机制** 
* 如果我们再次调用 newCounter ，那么**一个新的局部变量 count 和一个新的闭包会被创建出来**，这个**新的闭包针对的是这个新变量**：

从技术上讲，**Lua 语言中只有闭包没有函数。函数本身只是闭包的一种原型。** 尽管如此，只要不会引起棍淆，我们就仍将使用术语“函数”来指代闭包。

![[Pasted image 20240809231917.png]]
根据可见性规则，**局部变量old Sin 只在这部分代码段中有效**。因此，只有新版本的函数 sin 才能访问原来的 sin 函数，其他部分的代码则访问不了。并将原来的版本保存为一个私有的变量。


![[Pasted image 20240809233209.png]]



# 十 模式匹配
用的时候再查，反正记不住


# 十二 日期和时间

# 十三 位和字节
用时再记，反正记不住

# 十四 数据结构
1. 稀疏矩阵(表的特点就决定了矩阵为稀疏矩阵)
2. 链表
```lya
list = {next = list，value = v}
```
3. 队列以及双端队列(头尾两个索引)
```lua
function listNew()
	return {first = 0, last = -1}
end

function pushFirst(list,value)
	local first = list.first - 1
	list.first = first
	list[first] = value
end

fuction pushLast(list,value)
	local last = list.last +  1
	list.last = last
	list[last] = value
end

---pop(省略)----
```
4. 反向表（索引表，根据值名获得键）
实现：遍历，反向赋值创建新表即可
5. 字符串缓冲区
用表来一行一行存储流式读取的每一行数据，读完再将其合并。相比读一行连接一行可以大幅度提高性能。
6. 图

# 十五 数据文件和序列化

## 1.数据文件
使用Lua构造器构造数据，使得读取数据变得容易（相比其他文件，更适用于Lua宝宝体制的文件）
**原文件：**
```
Donald E. Knuth, Lite ate og amming, CSL!, 1992
Jon Bentley ，”。「 Prag amming Pearls,Addison-Wesley,1990
```
**Lua构造器表示:**
```lua
Entry{"Donald E. Knuth",
	"Literate Programming",
	"CSLI",
	1992}
	
Entry{"Jon Bentley",
	"More Programming Pearls"
	"Addison-Wesley",
	1990}
```
计算某个数据文件中的**数据条目的个数**:
```lua
local count = 0
function Entry()count=count +1 end
dofile("data")
print("number of entries:".. count)
```
**获取某个数据文件中所有作者的姓名，然后打印出这些姓名:**
```lua
local authors ={}  --保存作者姓名的集合
function Entry(b)authors[b[1]]= true end
dofile("data")
for name in pairs(authors)do print(name)end

```

上述的代码段中使用了**事件驱动**（ event-driven ）的方式：函数 Entry 作为一个回调函数会在函数 dofile 处理数据文件中的每个条目时被调用




**键值对的表示方法**：
```lua
Entry{
	author ="Donald E. Knuth"
	title = "Literate Programming"
	publisher ="CSLI",
	year =1992
	}


Entry{
	author ="Jon Bentley",
	title ="More Programming Pearls"
	year =1990
	publisher ="Addison-Wesley",
	}

```

获取作者姓名的集合(可以**无视次序了**)
```lua
local authors ={}     --保存作者姓名的集合
function Entry(b)authors[b.author]= true end
dofile("data")

for name in pairs(authors)do print(name) end
```

## 2.序列化
1. type(o) == "number"
```lua
function serialize(o)
 if type(o) == "number" then
	 io.write(tostring(o))
 elseif type(o) == "string" then
	 io.write("[[",0,"]]")
 else other cases
 end
end
```
2. 代码注入
```lua
varname = [[]]..os.excute('rm*')..[[]]
```
3. 解决方案：使用string.format
---
4. 保存不带循环的表：递归处理子子节点
5. 保存带循环的表：引入名称，使用之前已被保存过的表作为键，表名为值


# 十六  编译、执行和错误

# 1.编译
1.dofile
```lua
function dofile(filename)
	local f = assert(loadfile(filename))
	return f()
end
```
2.load:
```lua
f = load("i = i + 1")

i = 0
f(); print(i)  --> 1
f(); print(i)  --> 2
```
这段代码和用函数i = i +1效果基本相同，但是函数与外层函数一起编译，会**快得多**


3.loadfile
常见误解：加载一段程序也就是定义了函数。
实际上在 Lua 语言中函数定义是在**运行时**而不是在编译时发 的一种赋值操作。这些函数只是将程序段编译为一种中间形式，然后将结果**作为匿名函数返回**
```lua
-- 文件"foo.lua"
function foo(x)
	print(x)
end
```

```lua
f = loadfile("foo.lua")
print(foo)      -->nil
f()             -- 运行代码
foo("ok")       -->ok
```

## 2. 预编译的代码
* 预编译代码：.lc格式
	* `luac -o prog.lc prog.lua`
* 实现一个最简单的的luac
	* 关键函数 string.dump(p):传入一个Lua函数参数，返回值是对应的**字符串形式**的预编译代码
	* 加载更快
	* 避免由于意外修改源码
```lua
p = loadfile(arg[1])
f = io.open(arg[2],"wb")
f:write(string.dump(p))
f:close()
```

## 3.错误
* Lua作为常见嵌入应用程序的扩展语言，不能简单崩溃或退出。而是要提供处理错误的方式。
* error
```lua
if not n then error("invalid input") end
```
* assert
```lua
n = assert(io.read("*n"),"invalid input")

```
* debug.debug:为用户提供一个Lua提示符来让用户检查错误的发生原因
* debug.traceback：使用调用栈构造详细错误信息，**lua独立解释器错误信息构造**就是用的这个


# 十七 模块和包
一个模块就可以看作一段代码，使用**require**进行加载，然后**创建并返回一个表**
```lua
local m = require"math"
print(m.sin(3.14))

local mod = require "mod'
mod.foo()

```