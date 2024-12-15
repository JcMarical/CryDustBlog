> 定义：_元表_ 是**定义了原始数据在某些事件下行为**的一个普通 Lua 表。每个事件对应的键都是一个字符串，内容是以两个下划线做前缀的事件名，其相应的值被称为 _元值（metavalue）_。对于大部分事件，其元值必须是一个称为 _元函数（metamethod）_ 的方法。
> 若非另有说明，元函数实际上可以是任意可调用的值，它要么是个函数，要么是个带有元方法“`__call`”的值。

- getmetatable:查询元表
- setmetatable:替换元表

默认情况下，值没有元表，但是字符串库给字符串类型设置了一个元表

# 对表设置原表
```lua
mytable = {}                          -- 普通表  
mymetatable = {}                      -- 元表  
setmetatable(mytable,mymetatable)     -- 把 mymetatable 设为 mytable 的元表

---缩写成一行
mytable = setmetatable({},{})

---返回对象元表
getmetatable(mytable) 
```

# 常用元方法
## `__index 元方法`--用于对表访问

这是 metatable 最常用的键。
通过**键来访问** table 的时候，如果这个**键没有值**，那么Lua就会寻找该table的metatable（假定有metatable）中的`__index 键`。
* 如果 `__index`包含一个表格，Lua会在表格中查找相应的键。
* 如果`__index`包含一个函数的话，Lua就会调用那个函数，**table和键会作为参数**传递给函数。
```c++
mytable = setmetatable({key1 = "value1"}, {  
  __index = function(mytable, key)  
    if key == "key2" then  
      return "metatablevalue"  
    else  
      return nil  
    end  
  end  
})  
  
print(mytable.key1,mytable.key2)
```

Lua 查找一个表元素时的规则，其实就是如下 3 个步骤:
* 查找table
* 查找元表
* 元表中再查找__index


## `__newindex 元方法`--对表更新

当你给表的一个缺少的索引赋值，解释器就会查找__newindex 元方法
* 如果不缺少索引，就直接赋值，否则：
	+ **如果元方法存在且赋值为函数，则调用这个函数而不对原来的表进行赋值操作**
	* **如果元方法存在且赋值为表，则赋值给对应的表而不对原表进行赋值操作**
* 


# `__add，__sub,__mul等等`--运算符重载（添加）
很明显咯，传入方法，参数就是运算符两边的东西

## `__Call 元方法`--对表更新

 Lua 调用一个值时调用。比如setmetatable的参数为（{10}，call=...}
 那就是调用10的时候执行对应的方法。


## `__tostring元方法`--用于修改表的输出行为

print（table）时调用