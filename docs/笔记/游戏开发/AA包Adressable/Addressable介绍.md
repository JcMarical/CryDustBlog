
什么是Asset
## 资源目录
+ Project目录：项目文件目录，存放所有资源。如png、fbx、anim等
+ Hierachy目录：游戏场景的目录，如gameobject、canvas、image等

## 资源加载方式
+ Resoureces文件夹：通过Resource.Load读取文件
+ StreamingAsset文件夹：通过UnityWebRequest读取（网络接口，URL也可以通过这个获取）
+ AssetReference：通过Addressables.LoadAsstAsync读取，可以代替上面的所有方法

# 为什么要使用Addresable
+ 加块迭代时间
+ 依赖管理
+ **内存管理**：
+ **内容打包**：
+ 配置文件：
![[Pasted image 20241004205254.png]]

## AssetBundle前情提要
举例：原始包只需要第一关，其余关卡可以后续下载


# 加载过程

## 创建本地资源
+ 传统过程：我们需要加载Level1、Level2、Level3
+ Addresable：
+ 打开窗口中的Addressables Groups，将需要加载的资源拖进去
  ![[Pasted image 20241005012401.png]]
+ 或者直接在Inspector勾选Addressable
  ![[Pasted image 20241005012337.png]]
## 协同打包
Inspector中，Bundle Mode选择Pack Together。
勾选后如果下载完了第二关，第三关也会下载好。

## 创建远端资源
+ 在Addressables Group新建一个Remote Group
	+ Build Path勾选RemoteBuildPath，填写下载存储的位置
	+ Load Path勾选RemoteLoadPath，填写要上传的网址


# Addressable 三种测试方式
+ 不打包Use Asset Database
+ 模拟打包Simulate Groups
+ 真打包Use Existing Build（**每次修改需要重新打包**）


# 代码实现API
+ 加载场景
```c#
Addressables.LoadSceneAsync(levelReferences[sceneIndex],LoadSceneMode.Additive)
```
+ 取消加载场景
```C#
Addressbles.UnloadSceneAsync(handle)
```
+ 下载
```c#
Addressables.GetDownloadSizeAsync(levelReferences[index].RuntimeKey)//Download接口
Addressables.GetDownloadDependenciesAsync(levelReferences[index])//下载过程中调用


//可以用协程来监控下载过程
IEnumerator DownloadScene(int index)
{
	var handle = Addressables.GetDownloadDependenciesAsync(levelReferences[index],false);

	handle.Completed += SceneDownloadCompelete;
	sceneDownlaoded = index
	
	while(!handle.IsDone)
	{
		var status = handle.GetDownloadStatus();
		float progress = status.Percent;
		_UIManager.SetDownLoadPercent(progress);
		yield return null;
	}

}

```
+ AssetReferce：


## 远端对象存储OSS
这里使用阿里云对象存储服务（要钱，和博客图床一个东西），将`.bundle`文件存储到阿里云服务器上/
设置Addressables Profiles：填写对应的阿里云URL


# Addressable打包策略

## 资源重复

 打包场景的时候，会将依赖资源一起打包起来，但这样就会造成**资源重复**。
 Addressables的tools中有一个Analyze分析器，可以查看重复的资源有哪些。

## 理解Prefab和Scene运作原理
+ scene、prefab大小很小，因为他们并没有存储原资源，只有引用**对应资源meta文件中的Id**
+ prefab在scene中的运用，相当于连续翻开了两个本子，引用再查找引用

## 解决策略
1. 直接生成公共资源
 + 点击Fix Seleceted Rules，就可以自动修复，生成一个新的bundle包。（缺点：凌乱）
2. 将prefab放在场景里的，会一并打包资源
3. 要单独打包prefab，最好将引用的资源也一起打包，不然场景和prefab会生成两份
+ 建议文件夹分类放好，每次单独打包拖动文件夹就行
4. 空物体，用脚本引用prefab，这样不会扫描prefab引用的资源。（缺点，只有跑起来才能看到资源）




## 资源重复不一定是坏事  
如果有一个通信介质（比如跨场景的对话介质ScriptableObject），那么他需要单独打包出来，由于他本身也是资源，所以场景引用不会打包对应资源。


## 总结打包策略
+ 本地化的东西
+ 分辨率（低清包，高清包）
+ 游戏场景Scene（第一关原始包体，后续云端）
+ 公共资源



# 内存管理
## 内存分析工具
+ Profiler（unity自带）
+ Memory Profiler（unity插件）

## Texture内存优化
> 这一段只是简单的讲述一下，商业游戏会有更健壮的优化策略
+ Project Settings设置Quality的Texture Quality
+ 设置Max Size，最重要的是法线贴图

## 音频优化
+ mp3本身就是优化后的音频格式！！！使用时会转换成wav！！！不要看着小就用mp3了
+ 而且压缩的够狠，游戏运行解压时就会更耗时
+ 可以设置LoadType来决定什么时候解压

## Addressable优化
直接引用的内存，会全部提前引用到内存中，不管有没有实例化（不管有没有Instantiate）
+ 将内存分包加载，可以不用提前把所有的资源全部加载进去
+ 必须要load和unload成对的写，否则会一直存在于内存中
+ Bundle中Asset可以单独Load，但必须一次性全部卸载unload掉。因为他们都属于一个bundle包体里面