## Unity文档的描述
[EditorWindow - Unity 脚本 API](https://docs.unity.cn/cn/2021.3/ScriptReference/EditorWindow.html)
+ 从此类派生以创建编辑器窗口。
+ 创建自己的自定义编辑器窗口，这些窗口可以自由浮动，也可以作为选项卡停靠，就像 Unity 界面中的原生窗口一样。
```c# 
using UnityEngine;
using UnityEditor;

public class MyWindow : EditorWindow
{
	string myString = "Hello World";
	bool groupEnabled;
	bool myBool = true;
	float myFloat = 1.23f;

	// 使用属性，将其添加到菜单栏上，并利用反射运行时获取Mywindow的信息
	[MenuItem("Window/My Window")]
	static void Init()
	{
		// Get existing open window or if none, make a new one:
		MyWindow window = (MyWindow)EditorWindow.GetWindow(typeof(MyWindow));
		window.Show();
	}

	//显示GUI
	void OnGUI()
	{
		GUILayout.Label("Base Settings", EditorStyles.boldLabel);
		myString = EditorGUILayout.TextField("Text Field", myString);

		groupEnabled = EditorGUILayout.BeginToggleGroup("Optional Settings", groupEnabled);
		myBool = EditorGUILayout.Toggle("Toggle", myBool);
		myFloat = EditorGUILayout.Slider("Slider", myFloat, -3, 3);
		EditorGUILayout.EndToggleGroup();
	}
}
```
# 类型变量
```c++

```