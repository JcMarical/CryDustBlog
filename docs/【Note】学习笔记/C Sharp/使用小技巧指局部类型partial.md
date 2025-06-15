平时都没怎么用到，项目中为了即使不生成序列化代码也不会报错，不影响正常的开发流程，使用partial分隔代码
```c#
public partial class CameraRenderer
{
	//逻辑A
}

partial class CameraRenderer
{
	//逻辑B：编辑器专用
}
```
等开发者把逻辑全部写完之后，用工具生成一下发送、接收函数的序列化和反序列化代码，再测试一下即可使用正常功能

# 编辑器分离

我们可以把编辑器的代码分离，但是为了避免出现编译错误，我们可以使用partial声明来保证正常的使用。
```c++
//逻辑A
public partial class CameraRenderer
{
	void SetUp()
	{
	...
		DrawUnsupportedShaders();
	}
}

//逻辑B：编辑器专用
partial class CameraRenderer
{
	partial void DrawUnsupportedShaders () ;
#if UNITY_EDITOR
	partial void DrawUnsupportedShaders () { … }
#endif
}
```