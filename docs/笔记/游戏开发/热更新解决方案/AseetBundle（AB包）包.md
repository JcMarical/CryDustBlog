# 了解AB包
- 特定于平台的资产压缩包（模型、贴图、预设体、音效、材质球等等，除了**C#文件**）
- 作用：
	- 相对Resources更易管理
	- 减小包体大小
		- 压缩资源
		- 减少初始包大小
	- 热更新



## Resources VS AB包

| Resources | AB包\|AB包\|AB包 |
| --------- | ------------- |
| 打包时定死     | 存储位置可自定       |
| 只读        | 压缩方式自定义       |
| 无法修改      | 后期可动态更新       |


## 热更新
- 资源热更新
- 脚本热更新
- 更新原理：
1. 获取资源服务器地址
2. 资源对比文件，检测哪些要更新
3. 重新下载

# 生成AB包资源
## 打包方式
- 编辑器自定义打包工具
- 官方提供好的打包工具Asset Bundle Browser

## 打包流程

### 1.创建包
在Assets中选择资源，点击后显示右下角，可以新建AssetBundle包名。
![[Pasted image 20250218191415.png]]
### 2.管理包  Configure
![[Pasted image 20250218191614.png]]

### 3.注意点
- 不能打包C#
- prefab的组件是不是c#呢？**不是，只是关联的一堆数据**


### 4.Build模块
**最核心的模块**
- Build Target:**打包目标平台**（如Android）
- Output Path：**文件输出路径**
- Clear Folders：每次打包是否情况文件夹，一般可以选
- Copy To StreamingAssets：是否拷贝到后面这个文件夹，一般也勾上
> StreamingAsset：

进阶选项
- 压缩方式：
	- 不压缩：包体大，解压快
	- LZMA：包体最小，解压慢。用一个要全部解压
	- LZ4：只比LZMA大一点，用时解压，推荐

### 5.打包结果
- AB包文件：全是二进制
- 和AB文件名一样的manifest类型文件：用于记载关键信息，如**资源信息，依赖关系，版本信息**等

### 6.Inspect模块：检查页面
用来观测整个项目的抱得动信息




# StreamingAssets介绍
打包时，不会将Asset同级的AssetBundle里的文件一起打包出去。
- StreamingAssets：PC可读可写，IOS和Android只读

# 使用AB包资源文件
分为两步：
- 加载 AB包
- 加载 AB包的资源

## 加载AB包我们就从StreamingAssets里加载

- 加载AB包时，**只用名字加载**会出现**同名不同类型**资源分不清的问题
- 建议使用**泛型**加载
- 或**Type指定类型（需要转换类型） 的方法**加载（Lua需求）
```c++
	//加载AB包
	AssetBundle ab = AssetBundle.LoadFromFile(Application.streamingAssetsPath + "/"+ packageName);
	//加载AB包中的资源
	//ab.LoadAsset("Cube");    --不建议

	//建议泛型
	//GameObject obj = ab.LoadAsset<GameObject>("Cube");
	//或Type指定 
	GameObject obj = ab.LoadAsset("Cube",typeof(GameObject)) as GameObject;
```

## 注意事项
- AB包**不能重复加载**，否则会报错
-

## 异步加载包(协程)
异步--一定跟协程有关，分为三步：
- 加载AB包，返回
- 加载资源，返回
- 使用
```c++

Image img;

StartCoroutine(LoadABres("head","23_11100001"));

IEnumerator LoadABRes(string ABName, string resName)
{
	//第一步 加载AB包
	AssetBundleCreateRequest abcr = AssetBundle.LoadFromAsync(...)
	yield retun abcr;
	//第二步 加载资源
	AssetBundleRequest abq= abcr.assetBundle.LoadAssetAsync(resName,typeof(Sprite));
	yield return abq;
	//使用
	img.sprite = abq.asset as Sprite;
}
```

## 卸载AB包

### 1. 卸载所有
- UnloadAllAssetBundles:
	- false只卸载AB包。
	- true卸载AB包以及已经加载的资源。
```c#
AssetBundle.UnloadAllAssetBundles(false);
```

## 2.卸载单个
true和false和上面一样的作用
```c#
AssetBundle ab = AssetBundle.LoadFromFile(...)
ab.unload(false)
```


# AB包资源依赖
例子：一个Prefab，上面有一个材质，把他们分为两个AB包。

## 直接加载的问题
直接加载Prefab，会因为找不到材质球，加载出来的prefab材质直接丢失。
因此，我们需要把**依赖的资源一起加载出来**。


## 依赖加载步骤
1. 加载AB主包
2. 通过ab主包，加载对应的Manifest（ab包依赖文件）
3.  从固定文件中，得到依赖信息
	- 得到了依赖包的名字，可以将其打印出来
4. 根据名字加载依赖包
```c++
//加载主包
AssetBundle abMain = AssetBundle.LoadFromFile(...)
//加载主宝中的固定文件
AssetBundleManifest abManifests = abMain.LoadAsset<AssetBundleManifest>("AssetBundleManifest")

//从固定文件中，得到依赖信息
string[] strs = abManifest.GetAllDependencies("model");

//得到了依赖包的名字
for(int i = 0;i<strs.Length;i++)
{
	AssetBundle.LoadFromFile(Applicaiton...str[i]);
}

```

# AB包依赖的缺点
只知道包与包的依赖，不知道单个资源与资源，因此会一次性**加载他所有的依赖**。
- 依赖文件manifest里面也只记录了包