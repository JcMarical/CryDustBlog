# 第一部分《Programming in Lua》语言基础
# 一 语言入门
## 词法规范
- 下画线+大写字母：特殊用途
- 下画线+小写字母：哑变量
- 保留字：and、end、if、until、goto、nil······
## 全局变量
无需声明即可使用

## 动态类型语言
没有类型定义，每个值带有其自身的类型信息，共八种：
```lua

type(nil)  
type(true) --boolean
type(10.3*2)  --number
type("111") --string
type(io.stdin) --userdata
type(print) --function
type(type) --thread
type({}) --table
-----------------------
type(type(x)) --string

type(X)  --（没有预定义的类型，任何变量都可以包含任何值）

```
注意**userdata 和 thread **两个不常见的类型
## 独立解释器
没有 `#!/usr/local/bin/lua` 的话，就默认

有几个负数和正数参数下标，感觉没啥用就跳过了

# 三 数值
Lua 5.2 前都是双精度浮点格式
Lua5.3 提供 64 位整型 integer 和**float 双精度**（注意**不是单精度**）类型

## 数值常量
- 科学计数法
```lua

4.57e-3  -->0.00457
5E+20    -->5e+20

```
- 具有**十进制小数或指数**的数值都会被当作浮点型值，否则会被当做整型值，但是类型都是（number），意味着**可以转换**
- 具有相同算术值的整型值和浮点型值在 lua 中也是相等的 `1= 1.0`
- 区分可以使用 math.type()
- 支持 16 进制 0x，p 开头指数 0x1p-1

## 算术运算
加减乘除、取模、指数运算^、**整除 floor**
- 整除
```lua
3 // 2  -->1
1.5 // 0.5 ->3.0
```
- 取模运算定义
```lua
a % b = a-((a//b))*b

```

## 数学库 math
- 随机数发生器(math.random)
    - 一个参数【1，n】
    - 两个参数【l,r】
    - randomseed
    - os.time()
- 取整
    - floor 向下
    - ceil 向上
    - modf 向 0（负向上，正向下）

## 表示范围
- **回环**：对于**整型**，数值超过 2^63-1(math.maxinteger)或者低于(math.mininteger)，那么就会发生回环，即**丢弃最高进位**

```lua
math.maxinteger + 1 == math.mininteger
math.mininteger - 1 == manth.maxinteger
-math.minintefer == math.mininteger
math.minintefer // -1 == math.mininteger  

--以上都为true

```

- 浮点数 64 比特位，则 11 位为指数，范围-10^308 到 10^308
- 由于整型值和浮点型值的表示范围不同,因此当超过它们的表示范围时，整型值和浮点型值的算术运算**会产生不同的结果**
```lua
math.maxintege ＋ 2.0 == math.maxintege ＋ 1.0 --> true
```

## 惯例
- +0.0 将整型强制转换为浮点型,超过 2^53 则有可能导致**精度损失**
- 与零进行**按位或运算**，强制转换为整型 `2^53 | 0`
    - 注意，此时会检查是否与整型数值表示一致，否则会报错
```lua
3.2 | 0 -->不等，报错
2^64 | 0 -->超出范围
```
- 另外一种则是 math.tointeger,无法转换则返回 nil
```lua
math.tointeger(3.2)  -->nil
math.tointeger(2^64) -->nil

```

# 四 字符串
- 8bit 存储（一般和 7bit ASCII 比较）--1Byte
- 是**不可变值**，修改的话只能**创建一个新的字符串**
```lua
a = "one string"
b = string.gsub(a,"one","another") -->another string
```
- # 长度
- .. 连接（新值，不会改变原来的值）

## 长字符串/多行字符串

```lua
page = [[
<html>
<head>
    ...
</head>
<body>
    ...
</body>

]]

```
- 避免数组 a【i】的影响，两边可以使用**相同数量的=号**来配对

## 强制类型转换
```lua
"10" + 1 --> 11.0
tonumber("10e-3") 100000.0
```
当然，也可以数值转字符串
```c++
print(tostring(10) == "10")  -->true
```
- 注意，**比较操作符**> < <=之类的**不会进行强制转换**，“2” < "15"比较的是字母顺序，为 false

# 字符串标准库
```lua
string.rep("abc".3)   -->abcabcabc
string.reverse("A Long Line!")  --> !eniL gnol A
string.lower("A Long ine!")     --> a long line!
string.upper("A Long Line!")    -->A LONG LINE!

string.lower(a) < string.lower(b)  -->忽略大小写进行比较

s = "[in brackets]"   
string.sub(s，2，-2)   --> in brackets
string.sub(s，1，1)    -->[
string.sub(s，-1，-1)  -->]
-->sub是从s第i个字符提取到第j个字符，正数正着数，复数倒着数

string.char(97)  --> a
i = 99
string.char(i,i+1,i+2) cde
string.byte("abc")    -->97
string.byte("abc",2)  -->98
string.byte("abc",-1)  --->99
--> 这里第二、第三个参数乃至后面的参数仍然是索引

string.format("x=%d y=%d"，10，20) -->x=10 y= 20
string.format("x=%x"，200)  --> x = c8
string.format("x= 0x%X"，200)  -->x=0xC8
string.format("x=%f"，200) -->x= 200.000000
tag,title = "h1","a title"
string.format("<名s>%s</%s>",tag,title,tag)   --> <h1>a title</h1>
print(string.format("%02d/%02d/%04d"，d，m，y))-->05/11/1990

--->类似于c语言的printf

--模式匹配
string.find("hello world","wor") --> 7 9（两个返回值）
string.find("hello world","war") --> nil 

--替换
string.gsub("hello world", "l",".")  --> he..o wor.d        3
string.gsub("hello world", "ll","..")    --> he..o world    1
string.gsub("hello world", "a",".") --> hello world         0

```

## UTF8 标准库
感觉没啥应用，跳过了
```
utf8.len()

```

# 五 表 Table

## 表索引
- 如同全局变量一样，未经初始化的表元素为 nil ，将 nil 值给表元素可以将其删除。这并非巧合，因为 **Lua 语言实际上就是使用表来存储全局变量** 的
- `a. name ` 等价于 ` a["name"]`，更多的可能是意图区别
    - a.name 点分---结构体
    - `a["name"]`---强调表可以使用任意字符串作为**键**
    - 注意和 `a[name]` 作区分

## 表构造器
- 构造器表达式 a={} 创建表
- 构造器初始化索引（列表式和记录式）
```lua
----------列表式-----------
days = {"Sunday"," Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"}
days[4] -->Wednesday

----------记录式--------------
a = {x = 10, y = 20}
--等价于
a={},a.x = 10, a.y = 20;

----------混合式------------
polyline = {color = "blue"
            thickness = 2,
            npoints = 4,
            {x = 0, y = 0}   -- polyline[1]
            {x = -10, y = 0}  --polyline[2]
            {x = -10, y = 1}  -- polyline[3]
            {x = 0, y = 1} -- polyline[4]
    }

```
上面的方法不可以使用**负数索引初始化**，也不能使用不符合规范的标识符

更加通用
```lua
opnames = {["+"] =  "add" ,  ["-"] = "sub",
            ["*"] = "mul" , ["/"] = "div"}

i = 20; s = "-"
a = {[i+0] = s, [i+1] = s..s, [i+2] = s..s..s}

```

## 数组、列表和序列

###  符号#
- 对于存在**空洞（nil）值**的表，序列长度操作符是不可靠的
```
a ={}
a[1] = 1
a[2] = nil
a[3] = 1
```
### 序列
- 特指{1...n}的 n 个**正数数值类型**的键所组成集合的表。
- 不包含**数值类型键**的表就是**长度为零**的序列
*

## ⭐遍历表
### pairs 遍历
由于**底层实现机制**，遍历过程中元素的出现顺序**可能是随机的**，相同的程序在每次运行时也可能**产生不同的顺序**。
- 唯一确定的是，遍历时每个元素都只会出现一次

### ipairs 遍历
对于列表而言，可以使用 ipairs 迭代器，确保遍历**按照顺序**进行

### k = 1，# t 遍历
自己设置数值

## 安全访问
容易导致无意的编程错误。
```lua
E = {}

zip = (((company or E).director or E).address or E).zipcode

```

###  表标准库
- **插入**: `table.insert()`
- **移动**: `table.move(a,1,#a,2)`
    - 这其实只是拷贝过去，一般我们还要在移动后显示删除 `a[#a] = nil`
- 检测 nil：`table.pack()`

# 六 函数
- 可变长参数
```lua
function add(...)

    return ...
end

function fwrite(fmt,...)
    
    return io.write(string.format(fmt,...))
end

```
- 另一种可变参数 select
```lua
print(select(1,"a","b","c"))  -->a b c
print(select(2,"a","b","c"))  -->b c
print(select(3,"a","b","c"))  -->c
print(select("#","a","b","c"))  -->3

----可以配合着使用-----

for i = 1, select("#",...) do
    s = s + select(i,...)
end
    return s
end
```

- 函数 `table.unpack` 返回数组内所有的元素
    - 重要用途：**泛型调用**，允许调用任意参数的任意函数（先跳了，感觉不怎么用得到）
```lua
a,b = table.unpack{10,20,30}  --a = 10, b = 20, 30被丢弃

-------generic call泛型调用 --------

f(table.unpack(a))

--等价调用
f = string.find
a = {"hello","ll"}

print(f(table.unpack(a)))

```

## 正确的尾调用（区分递归调用）
- 不会使用栈空间，尾调用消除
    - 如下，程序会**直接返回**到调用 f 的位置
```
function f (x) x = x + 1;return g(x) end
```
- 而且由于不会使用栈空间，理论上可以**无限调用**
```lua
function foo (n)
    if n > 0 then return foo(n - 1) end
end
```
- 如果还**进行了其他工作**，那么就**不是尾调用**
    - 下面都不是尾调用
```lua
function f (x) g(x) end
return g(x) + 1    --加法
return x or g(x)   --限制一个返回值
return ((g(x)))    --限制一个返回值
```

# 七 输入输出

# 八 补充知识

## 控制结构
### if ... then else
### while ... do
### repeat ... until

## 数值型 for
- 变化范围：exp1，exp2
- 变化步长：exp3（默认为 1）
```
for var = exp1,exp2, exp3 do
    ...
end
```

## 泛型 for
- 遍历迭代所有值
