Lua这玩意儿自己学习时肯定用不到，但是面试时又喜欢考，而且没有经过实战大概率没法完全弄明白这玩意儿...不过话又说回来，建议找工作前还是看一眼，不然当UI仔的机会都没有。这块也算是进阶知识了，最好对Unity有着充分的了解后再来看。
# 一 XLua与热更新介绍

游戏**热更新**是指在不需要重新对游戏包体进行**编译、打包、发布**的情况下，在**运行时**更新游戏中的一些非核心代码和资源的一些技术。比如你需要在游戏上线时对一些运营活动打打补丁、改改数值和bug，但你不可能让玩家又重新下载一遍这个游戏，所以热更新对于网游开发来说就相当重要。

- **资源热更新**：一般使用AB(AssetBundle)包，更新一些资源（纹理，模型，特效）。前几年的厂子依旧在用AB包，但是现在Unity已经逐渐淘汰AB改为AA包了，后续技术选型如何还未可知。不过资源热更新现在不是这篇文章要讨论的话题，暂且略过。

- **代码热更新**：现在主流采用的依然是Lua的方案，此外还有类似ILRuntime，HybirldCLR的技术来支持代码热更新。如果你要修改代码逻辑又不需要将所有游戏代码重新编译，那么就可以用Lua来解决，这是网游UI仔的必备技能→_→。


不过Lua的技术方案也不止一种，Lua只是一种**解释型语言**。Unity本身并没有支持Lua，因此就诞生了以xLua，ToLua为主流的技术方案。Lua技术方案大差不差，懂一个就行，本文就主要讲述xLua的使用。

  

这里先直接将[腾讯开源的xLua项目](https://github.com/Tencent/xLua)介绍搬过来供大家了解一下：

> xLua 为 Unity、.Net、Mono 等 C# 环境增加 Lua 脚本编程的能力，借助 xLua，这些 Lua 代码可以方便的和 C# 相互调用。

  

# 二 Lua基础语法快速入门

> Lua 是一种轻量小巧的解释型语言（类似于Python），用标准C语言编写并以源代码形式开放。其设计目的是为了**嵌入应用程序**中，从而为应用程序提供灵活的扩展和定制功能。

学习xLua使用前，建议先了解一下Lua的语法。由于本文**默认读者有Unity程序开发的基础**，所以主要还是为想学习Lua的进阶游戏开发者**快速扫盲**，不会讲解一些编程语言的共性，理解Lua的语言差异。

  

我们先不用考虑框架，也不用下载什么东西，先用在线Lua网址来快速练习Lua语言：https://www.jyshare.com/compile/66/。

后面我也会给出每个模块的测试代码，可以运行一下看看Lua的结果，也可以自己敲一下试试看不同的运行结果。

  

## 2.1 注释

Lua语言不以//为注释，而是用--来表示

**输入：**

```Lua
--这是单行注释
--[[
    这是跨行注释
]]
print("Hello World!")        --Lua可以不使用分号划分语句
```

**输出：**

```Lua
Hello World!
```

  

## 2.2 Lua数据类型

Lua 是动态类型语言，**不需要定义**变量类型就可以使用，我们只需要为变量**赋值**，此时可以使用`local`标识符来创建局部变量。 值可以存储在变量中，作为参数传递或结果返回。

Lua 中有 **8 大基本类型**，分别为：

- **nil**：无效值(条件表达式中也等同于false)，给任意变量赋值nil都等于删除它。
- **boolean**：布尔类型，包含两个值false和true
- **number**：双精度浮点数
- **string**：字符串类型，用""或''表示
- **userdata**：表示任意存储在变量中的C数据结构
- **function**：由 C 或 Lua 编写的函数
- **thread**：协程
- **table**：个人认为Lua最重要的结构--表，本质上是一个“**关联数组**”，需要用{}来创建表。

测试代码：

```Lua
print(type("Hello world"))      --> string
print(type(10.4*3))             --> number
print(type(print))              --> function
print(type(type))               --> function
print(type(true))               --> boolean
print(type(nil))                --> nil
print(type(type(X)))            --> string
print(type({}))                 --> table

-- 创建一个空的 table
local tbl1 = {}
-- 直接初始表
local tbl2 = {"apple", "pear", "orange", "grape"}

print(tbl1)
print(tbl2)
```

### Table 表

针对表我们还需要单独讲讲，因为**表可以说是lua用的最广泛的数据类型**

- 表可以理解为由多个**键值对**构成，初始化默认按照按照1、2、3、4的递增序列为值赋予索引。
    
- 表也可以单独指定任意的索引和值，只要确保满足是number，string，table的类型。
    
- 用nil可以回收表，移除引用。
    
- table提供了一些操作如contact、insert、maxn、remove、sort，用来快速做一些表的操作
    

```Lua
-- 初始化表
mytable = {}

tbl2 = {"apple", "pear", "orange", "grape"}

-- 指定值
mytable[1]= "Lua"
mytable["wow"] = "修改前"
-- 使用table操作
table.insert(mytable,"mango")

-- 移除引用
mytable = nil
-- lua 垃圾回收会释放内存
```

## 2.3 Lua循环

lua循环的思想还是和正常代码类似，不过for循环有不少细节值得注意一下

- while循环：

```Lua
while( true )
do
   print("循环将永远执行下去")
end
```

- for循环
    - 数值for循环：格式为`for` **`var=exp1,exp2,exp3`** `do ... end` ，其中var以exp3（默认为1）为**步长**，从exp1变化到exp2。
    - 泛型for循环：通过一个**迭代器****来遍历所有值。**可以将其理解为C#中的foreach，lua本身也提供了两种默认的迭代器ipairs和pairs供程序员使用。
        - ipairs: 仅仅遍历值，按照**索引升序遍历**，**索引中断停止遍历**。即不能返回 nil,只能返回数字 0，如果遇到 nil 则退出。它只能遍历到集合中出现的第一个不是整数的 key。
        - pairs :能遍历集合的所有元素。即 pairs 可以遍历集合中所有的 key，并且除了迭代器本身以及遍历表本身还**可以返回** **nil**。

> **注意**：lua中的for循环是**默认从1开始**的，这点

```Lua

--数值for循环--
for i=1,f(x) do
    print(i)
end
 
for i=10,1,-1 do
    print(i)
end

--泛型for循环--

local tabFiles = {
        [1] = "test2",
        [6] = "test3",
        [4] = "test1"
    }

for k, v in ipairs(tabFiles) do    --输出"1 test2",在key等于2处断开
    print(k, v)
end

for k, v in pairs(tabFiles) do  --输出所有键值对
    print(k, v)
end
```

## 2.4 Lua运算符

主要说说和其他语言差异比较大的地方

- 算术运算符：`//`--整除符号，因为lua没有整型，这个方法做了一些计算上的弥补。
- 关系运算符：`~=`不等于,替代`!=`
- 逻辑运算符:用`and，or，not`来表示，替代`&,|,!`
- 其他运算符：
    - `..`连接左右两边的字符串，形成新的字符串
    - `#`返回右边**字符串或者表的长度**

测试用例:
```Lua
if ( a and b )
then
   print("a and b - 条件为 true" )
end

if ( a or b )
then
   print("a or b - 条件为 true" )
end


a = "Hello "
b = "World"

print("连接字符串 a 和 b ", a..b )
print("b 字符串长度 ",#b )
print("字符串 Test 长度 ",#"Test" )

local tab = {0,1,2}

print("tab长度",#tab)
```
## 2.5 Lua模块与包

> 这一部分涉及多文件不太好在网站上测试，不过也比较简单就顺便讲了。有兴趣的同学可以自己下载lua在本机上进行测试。
### 创建模块
Lua的模块是由变量、函数等元素组成的一个table。因此**创建模块就是创建table。**创建一个完整的模块步骤如下：
- 创建table
- 将导出的常量、函数放入其中
- 最后返回table
一般我们会将一个文件直接创建为一个模块来使用

**module.lua**

```Lua
-- 文件名为 module.lua
-- 定义一个名为 module 的模块
module = {}
 
-- 定义一个常量
module.constant = "这是一个常量"
 
-- 定义一个函数
function module.func1()
    io.write("这是一个公有函数！\n")
end
 
local function func2()
    print("这是一个私有函数！")
end
 
function module.func3()
    func2()
end
 
return module
```
### 使用模块
我们使用require来引用其他文件模块，类似于C/C++的include。引用模块后，我们就可以直接调用模块中的函数与数据结构来进行操作。
**test_module.lua**
```C++
-- test_module.lua 文件
-- module 模块为上文提到到 module.lua
require("module")
print(module.constant)
module.func3()
```

## 2.6 元表Metatable

在 Lua table 中我们可以访问对应的 key 来得到 value 值，但是却无法对两个 table 进行操作(比如相加)

元表(metatable)是Lua语言中相当重要的一部分内容，允许我们改变 table 的行为，每个行为关联了对应的**元方法**。在我看来，元表类似于其他语言中的**重载运算符操作**，但更加复杂，基于元表我们还可以实现lua的面向对象（如封装、继承、多态）的功能。这部分有相当多的部分可以扩展，因此会留到后面的Lua进阶内容详细讲述相关内容。目前将元表提出，也是为了让大家了解这个概念，不至于看到后陷入迷茫。
### 两大元表函数

元表主要由下面两个函数处理
- **setmetatable(table,metatable):** 对指定 table 设置元表(metatable)，如果元表(metatable)中存在 __metatable 键值，setmetatable 会失败。
- **getmetatable(table):** 返回对象的元表(metatable)。

```Lua
mytable = {}                          -- 普通表
mymetatable = {}                      -- 元表
setmetatable(mytable,mymetatable)     -- 把 mymetatable 设为 mytable 的元表
--上面这一部分等价于
mytable = setmetatable({},{})

getmetatable(mytable)       
```

### 元方法

元方法定义了元表的行为，我们可以将**表赋值**给元方法用于返回值，也可以将**函数赋值**给元方法用来执行方法。针对不同的元方法我们可以实现不同的效果。对于元方法，我将其分为下面几个部分方便大家记忆。

- **`__index`**:**主要用于访问**。通过键来访问 table 的时候，如果这个键没有值，那么Lua就会寻找该table的metatable

```Lua

--查看表中元素是否存在，如果存在则直接返回结果
--否则由 __index 返回结果，key2返回metatablevalue字符串，其他的返回nil。

返回结果为 nil；
mytable = setmetatable({key1 = "value1"}, {
  __index = function(mytable, key)
    if key == "key2" then
      return "metatablevalue"
    else
      return nil
    end
  end
})

print(mytable.key1,mytable.key2)
```
- **`__newIndex`**：**主要用于更新**。当你给表的一个缺少的索引赋值，解释器就会查找__newindex 元方法，并赋值给元表。如果存在则调用这个函数而不进行赋值操作。
```Lua
--给表赋值，若存在新索引则将其转换为字符串
mytable = setmetatable({key1 = "value1"}, {
    __newindex = function(mytable, key, value)
        rawset(mytable, key, "\""..value.."\"")
    end
})

mytable.key1 = "new value"
mytable.key2 = 4

print(mytable.key1,mytable.key2)
```

- **`__add`**，**`__sub`**...等：**主要用来定义表之间的各种运算。**对应的是+、-等运算符。

```Lua

--------------------实现两表的加法--------------------
-- 自定义计算表中最大键值函数 table_maxn，即返回表最大键值
function table_maxn(t)
    local mn = 0
    for k, _ in pairs(t) do
        if type(k) == "number" and k > mn then
            mn = k
        end
    end
    return mn
end

-- 两表相加操作
mytable = setmetatable({ 1, 2, 3 }, {
  __add = function(mytable, newtable)
    local max_key_mytable = table_maxn(mytable)
    for i = 1, table_maxn(newtable) do
      table.insert(mytable, max_key_mytable + i, newtable[i])
    end
    return mytable
  end
})

secondtable = {4, 5, 6}

mytable = mytable + secondtable

for k, v in ipairs(mytable) do
    print(k, v)
end
```

- **`__call`**：**主要用于调用。**__call 元方法在 Lua 调用一个值时调用，类似于回调函数。

```Lua
--调用表时，返回表内值的总和

function table_maxn(t)
    local mn = 0
    for k, v in pairs(t) do
        if mn < k then
            mn = k
        end
    end
    return mn
end

-- 定义元方法__call
mytable = setmetatable({10}, {
  __call = function(mytable, newtable)
        sum = 0
        for i = 1, table_maxn(mytable) do
                sum = sum + mytable[i]
        end
    for i = 1, table_maxn(newtable) do
                sum = sum + newtable[i]
        end
        return sum
  end
})
newtable = {10,20,30}    
print(mytable(newtable))        //10 + 20 + 30 = 70
```

输出：

```Lua
70
```

- **`__tostring`**：**主要用于输出。**__tostring 元方法用于修改表的输出行为，常和print搭配使用。
    
```Lua
mytable = setmetatable({ 10, 20, 30 }, {
  __tostring = function(mytable)
    sum = 0
    for k, v in pairs(mytable) do
                sum = sum + v
        end
    return "表所有元素的和为 " .. sum
  end
})
print(mytable)
```

输出：

```Lua
表所有元素的和为 60
```

  

# 总结

lua说难也不算太难，掌握上面这些内容就可以进行正常的lua编程了。对于lua的面向对象、闭包、协程等进阶内容，我后续有时间的话可以单独再搞一搞。总之现在暂时摸了~毕竟教程主要还是教会大家怎么使用xlua。