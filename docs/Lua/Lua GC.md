# 一 Lua主要GC机制

## 1. 1 弱引用表
* 表：可为**对象**设置元表__mode字段,k键v值
```lua
a = {}
mt = {__mode = "k"}
setmetable(a, mt)

```
* 记忆函数：
* 可以引用非弱引用（活跃）对象作为键，不会回收
* 
## 1.2 析构器


## 1.3 函数collectgabage

