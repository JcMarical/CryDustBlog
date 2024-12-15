我们知道，对象由属性和方法组成
Lua 中的面向对象：
* **类**可以**通过 table + function 模拟**出来。
* **继承**可以通过table+function模拟出来（但不推荐）


# 1. New-- 元表设给自己，调用__index方法
找不到就调用创建方法咯

```c++
	function ClassName:new(obj,...)
	    local obj = obj or {}  -- 创建一个新的空表作为对象
	    setmetatable(obj, self)  -- 设置元表为当前类，使对象继承类的方法
	    self.__index = self  -- 设置索引元方法
	    -- 初始化对象的属性
	    obj.name = name  
	    obj.age = age
	    --或者
		obj:init(...)  -- 可选：调用初始化函数（构造函数）
    return obj
end
```



# 2.Lua继承/重写/多态
Lua 中的继承通过设置子类的元表来实现，我们可以创建一个新表，并**将其元表设置为父类**

```lua
-- 定义矩形类
Rectangle = {area = 0, length = 0, breadth = 0}

-- 创建矩形对象的构造函数
function Rectangle:new(o, length, breadth)
  o = o or {}  -- 如果未传入对象，创建一个新的空表
  setmetatable(o, self)  -- 设置元表，使其继承 Rectangle 的方法
  self.__index = self  -- 确保在访问时能找到方法和属性
  o.length = length or 0  -- 设置长度，默认为 0
  o.breadth = breadth or 0  -- 设置宽度，默认为 0
  o.area = o.length * o.breadth  -- 计算面积
  return o
end

-- 打印矩形的面积
function Rectangle:printArea()
  print("矩形面积为 ", self.area)
end

-- 定义正方形类，继承自矩形类
Square = Rectangle:new()  -- Square 继承 Rectangle 类

-- 重写构造函数（正方形的边长相等）
function Square:new(o, side)
  o = o or {}  -- 如果未传入对象，创建一个新的空表
  setmetatable(o, self)  -- 设置元表，使其继承 Rectangle 的方法
  self.__index = self  -- 确保在访问时能找到方法和属性
  o.length = side or 0  -- 设置边长
  o.breadth = side or 0  -- 正方形的宽度和长度相等
  o.area = o.length * o.breadth  -- 计算面积
  return o
end

-- 运行实例：
local rect = Rectangle:new(nil, 5, 10)  -- 创建一个长为 5，宽为 10 的矩形
rect:printArea()  -- 输出 "矩形面积为 50"

local square = Square:new(nil, 4)  -- 创建一个边长为 4 的正方形
square:printArea()  -- 输出 "矩形面积为 16"
```




# 一个完整的Lua类

```lua

--深拷贝：拷贝值，拷贝方法，拷贝元表
local function _copy(object, lookup_table)

    if type(object) ~= "table" then
        return object --不是table
    elseif lookup_table[object] then 
        return lookup_table[object]
    end 
    local new_table = {}
    lookup_table[object] = new_table
    for key, value in pairs(object) do
        new_table[_copy(key, lookup_table)] = _copy(value, lookup_table)
    end
    return setmetatable(new_table, getmetatable(object))

end

  

function clone(object)

    local lookup_table = {}

    return _copy(object, lookup_table)

end

  

--Create an class.

function class(classname, super)

    local superType = type(super)

    local cls

    if superType ~= "function" and superType ~= "table" then

        superType = nil

        super = nil

    end

  

    if superType == "function" or (super and super.__ctype == 1) then

        -- inherited from native C++ Object

        cls = {}

  

        if superType == "table" then

            -- copy fields from super

            for k,v in pairs(super) do cls[k] = v end

            cls.__create = super.__create

            cls.super    = super

        else

            cls.__create = super

        end

  

        cls.ctor    = function() end

        cls.__cname = classname

        cls.__ctype = 1

  

        function cls.new(...)

            local instance = cls.__create(...)

            -- copy fields from class to native object

            for k,v in pairs(cls) do instance[k] = v end

            instance.class = cls

            instance:ctor(...)

            return instance

        end

  

    else

        -- inherited from Lua Object

        if super then

            cls = clone(super)

            cls.super = super

        else

            cls = {ctor = function() end}

        end

  

        cls.__cname = classname

        cls.__ctype = 2 -- lua

        cls.__index = cls

  

        function cls.new(...)

            local instance = setmetatable({}, cls)

            instance.class = cls

            instance:ctor(...)

            return instance

        end

    end

  

    return cls

end

  

---@param A any class|object

---@param B any class

---@return boolean 判断A是否是B的实例或子类

function is_instance_of(A, B)

  if not A or not B then return false end

  A = A.class or A

  while A do

    if A == B then

      return true

    end

    A = A.super

  end

  return false

end
```