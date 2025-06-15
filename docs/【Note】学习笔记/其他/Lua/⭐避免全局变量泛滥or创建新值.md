# 设置全局表_G表的元表和元方法的创建和修改
```lua
setmetatable(
  _G,
  {
	  --创建
    __newindex = function(_, key)
      print("attempt to add a new value to global, key: " .. key)
    end,
    --访问
    __index = function(_, key)
      print("attempt to index a global value, key: " .. key)
    end
  }
)
```