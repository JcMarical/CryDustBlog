# 一 Lua解析器 LuaEnv

LuaEnv--Lua解析器的功能：能够让我们在Unity中执行Lua
- **Dostring**：**最重要的语句**，执行Lua语句
	- require（）：可以用来执行一个脚本
- Tick()：帧更新中定时执行/切场景时执行（垃圾回收）
- Dispose():销毁解析器
虽然Lua解析器可以不唯一，但是尽量保持解析器的唯一性。
```c#
//引用命名空间
using XLua；

void Start()
{
	//Lua解析器 能够让我们在Unity中执行Lua
	LuaEnv env = new LuaEnv();
	
	//执行Lua语言
	//可以加入第二个参数：报错显示
	env.DoString("print('你好世界')"."Error!");

	//执行脚本
	env.DoString("require('Main')");

	//帮助我们清除Lua中没有手动释放的对象
	//帧更新中定时执行
	env.Tick();

	env.Dispose();
}

//Update is called once per frame
void Update()
{

}

```
## 默认加载路径
默认都在Resouces文件夹下，我们就可以直接在这个文件夹下创建Main.lua
但是Resouces文件识别不了.lua类型文件，不能通过Resources,Load加载。
所以需要把名字改为`Main.lua.txt`才能加载

# 二 修改路径--文件加载重定向
xlua本事提供了一个路径重定向的方法**AddLoader**
需要传入一个委托，该委托有`byte[]`类型的数据返回。
我们需要向委托里传入一个方法，这个方法执行修改路径的逻辑。

原理主要是修改require逻辑：
- 自定义函数找文件1
- 自定义函数找文件2
- ...
- 默认路径寻找
## 新建Lua文件夹
新建一个路径文件夹
```c++
private byte[] MyCustomLoader(ref string filePath)
{
	//拼接路径
	string path = Application.dataPath + "/Lua/" + filePath + ".lua"
	Debug.Log(path);

	//有路径，就去加载文件
	if(File.Exists(path))
	{
		//用File度文件
		retun File.ReadAllBytes(path);
	}
	else
	{
		Debug.Log("MyCustomLoader重定向失败,文件名为"+ filePath);
	}
	
	return null;
}


void Start{
	LuaEnv env = new LuaEnv();
	env.AddLoader(MyCustomLoader);
	env.DoString("require('Main')");
}
```

# 三 Lua解析器管理器
主要有以下几个功能
- 执行Lua语言的函数
- 释放垃圾
- 销毁
- 重定向

```c#
public class luaMgr:BaseManager<LuaMgr>
{
	private LuaEnv luaEnv;

	//---------------------------
	public void Init()
	{
		if(luaEnv != null)//确保唯一性
			return;
		luaEnv = new luaEnv();
		//加载lua脚本，重定向
		luaEnv.AddLoader(MyCustomLoader);
		luaEnv.AddLoader(MyCustomABLoader);
	}

	public void DoString(string str)
	{
		luaEnv.DoString(str);
	}

	public void Tick()
	{
		luaEnv.Tick();
	}

	public void Dispose
	{
	
	}
	//---------------------------------------


	//项目内Lua路径
	private byte[] MyCustomLoader(ref string filePath)
	{
		//拼接路径
		string path = Application.dataPath + "/Lua/" + filePath + ".lua"
		Debug.Log(path);
	
		//有路径，就去加载文件
		if(File.Exists(path))
		{
			//用File度文件
			retun File.ReadAllBytes(path);
		}
		else
		{
			Debug.Log("MyCustomLoader重定向失败,文件名为"+ filePath);
		}
		
		return null;
	}

	//项目内AB包路径
	private byte[] MyCustomLoader(ref string filePath)
	{
		string path = Application.streamingAssetsPath + "/lua";
		AssetBundle ab = AssetBundle.LoadFromFile(path);

		//加载lua文件
		TextAsset tx = ab.LoadAsset<TextAsset>(filePath + ".lua")
		//加载lua文件 byte数组
		return tx.bytes;
		//
	}
}

```
# 四 全局变量的获取与修改
`_G`也是lua的核心，后续一系列操作需要用到它，用Global来获得。
```c#
public LuaTable Global
{
	get
	{
		return luaEnv.Gloabl;
	}
}
```

我们先写个lua脚本
```lua
print("hello,world")
testNumber = 1;
```

获得G表后，我们就可以或得全局变量了。
- 注意，要**确保字符串和lua中的一致**

## Get获取int变量
```c++

//使用lua解析器luaenv中的Global属性
int i = luaMgr.GetInstance().Global.Get<int>("testNumber");

```
## 获取其他值类型变量（值拷贝）
虽然lua数值只有number类型，但都可以转换，是**值传递**
- int、bool、float、double等变量都可以用Get获取。

## Set修改全局变量
可以通过Set修改全局变量
```c++

//使用lua解析器luaenv中的Global属性
int i = luaMgr.GetInstance().Global.Set<int>("testNumber");
```


# 五 全局函数的获取

## Lua
```lua
--无参无返回函数
testFun = function()
    print("无参无返回")
end

--有参有返回函数
testFun2 = function(a)
    print("有参有返回值")
    return a + 100
end


--多返回值函数
testFun3 = function(a)
    print("多返回值")
    return 1, 2, false, "123", a
end


--变长参数函数
testFun4 = function(a, ...)
    print("变长参数函数")
    print(a)
    arg = {...}
    for k,v in pairs(arg) do
        print(k,v)
    end
end
```

## 通过委托和Get获取函数
### 无参无返回
因为lua函数本质都是闭包，因此可以直接用委托来获取。
一共有四种方式可以获取Lua。

### 有参又返回
如果要用普通委托
- 需要加一个特性CSharpCallLua，让XLua认识不认识的委托。
- 添加特性后，需要点击编辑器Xlua--GenerateCode选项（原理是XLua通过遍历特性找到相关的委托并进行处理）
当然也可以用Func或者LuaFunction



```c++
//无参无返回的委托
public delegate void CustomCall();

//有参有返回的委托
[CSharpCallLua]
public delegate int CustomCall2(int a);
void Start()
{

	...
	//----------------------无参无返回---------------------
	//委托
	CustomCall call = LugMgr.GetInstance().Global.Get<CustomCall>("testFunc");
	call();
	//unity自带委托
	UnityAction ua =  LugMgr.GetInstance().Global.Get<CustomCall>("testFunc");
	ua();
	//C# 提供委托
	Action ac =  LugMgr.GetInstance().Global.Get<CustomCall>("testFunc");
	ac();
	//Xlua提供的一种(尽量少用)
	LuaFunction lf = UnityAction ua =  LugMgr.GetInstance().Global.Get<CustomCall>("testFunc");
	lf.Call();

	//----------------------有参有返回--------------------
	
}


```

## 多返回值
使用out 和 ref来完成
这个不能用C#和Unity自带委托了，必须自定义委托或者用xlua提供的.
- 注意，**ref必须初始化**
```c++
//out 方式
[CsharpCallLua]
public delegate int CustomCall3(int a, out int b, out bool c, out string d, out int e)

//ref方式
[CsharpCallLua]
public delegate int CustomCall3(int a, out int b, out bool c, out string d, out int e)

void Start
{
	
	CustomCall3 call = LugMgr.GetInstance().Global.Get<CustomCall>("testFunc3");
	int b;
	bool c;
	string d;
	int e;
	//第一个返回值
	Debug.Log("第一个返回值:"+ call3(100, out b,out c,out d, out e));
	//接多返回值
	Debug.Log(b+"_"+c+"_"+d+"_"+e);

	//ref方式
	CustomCall4 call = LugMgr.GetInstance().Global.Get<CustomCall>("testFunc4");
	int b1 = 0;
	bool c1 = 0;
	string d1 = 0;
	int e1 = 0;
	//第一个返回值
	Debug.Log("第一个返回值:"+ call3(100, ref b1,ref c1,ref d1, ref e1));

	//多返回值
}

```
## 变长参数
一样，自定义委托或者luafunction


# 六  List和Ditionary
### 指定类型List
用`List<int>`作为返回值Get就行。

### 不指定类型
`List<object>`来存

### Dictionary
也是object传参，同一类型可以使用对应的变量（含有隐式转换）

# 七 类获取
## 声明C#类一定lua那边一样（且为公共）
可以更多，可以更少，但是没法拿到对应的值了。
![[Pasted image 20250220220317.png]]
最后直接Get就行了

# 八 接口获取
和类基本一样，记得加个【CSharpCallLua】特性

# 九 table映射到LuaTable
LuaTable是为C#定制的类似Lua中的table的一个数据结构
```c++
LuaTable table = LuaMgr.GetInstance().Global.Get<LuaTable>("testClass");
```
获取table里的变量，需要再用一个Get
```c++
table.Get<int>("testInt");
```