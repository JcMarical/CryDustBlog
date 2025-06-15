# 声明一个主包，和依赖包获取用的配置文件
```c#
private AssetBundle mainAB = null;
private AssetBundleManifest manifest = null;
```

## 存储管理（字典）
- 使用字典《string，AssetBundle》用来存储AB包

# 属性存放路径
- PathUrl：前缀
- MainABName：根据平台和宏，分为IOS、Android、PC等

# 同步加载
## 不指定类型版本
- 加载AB包及依赖
- 获取依赖包相关信息
- 循环检测信息
	- 通过字典判断包是否加载过（因为不能重复加载）
	- 没有则继续加载，并**存进字典**
- 先判断是否加载过**资源来源**包，没有则加载
- 此时肯定有资源包了，**加载资源**

- 可以多加一个判断（也可以把前面那一部分再单独拆出来做逻辑）
	- 如果是Gameobject类型，则直接Instance实例化
	- 否则直接返回obj


## Lua特殊化版本（指定Type）
因为lua并**不支持泛型**，所以需要重载不支持模版的加载方法。该方法需要多传入一个Type确定类型。


## 泛型版本
好处是可以直接返回对应类型 ，c#用的多


# 单个包卸载
- 判断字典是否包含
- 卸载
- 移除字典

# 所有包卸载
- 全部卸载
- 字典清空 
- 主包也清空
- 配置文件也清空



# 异步加载资源（没写包）
需要加一个`UnityAction<Object> callBack`作为回调函数
- AB包加载部分，和同步一样
- 主要是资源，用异步加载的方法
- yield retun abr返回异步加载资源；
- 加载完成后，通过**委托传递给外部使用**callBack
	- Instanctiate(...)
	- abr.asset

## Type和泛型变种
和同步类似，省略了。


## 异步使用lambda捕获
直接使用lambda捕获传回来的资源，并对该资源进行操作。
```c++
LoadResAsync(“路径”，(obj) =>{
	obj.
})

```


