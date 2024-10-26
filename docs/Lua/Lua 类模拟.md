众所周知，Lua没用对象

```lua
local function _copy(object, lookup_table)

    if type(object) ~= "table" then

        return object

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