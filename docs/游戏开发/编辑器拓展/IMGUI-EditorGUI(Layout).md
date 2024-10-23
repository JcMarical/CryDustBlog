# 编辑器下的GUI
用法和游戏画面中的GUI差别不会太多。只不过有不少的细节处理


# 编辑器菜单栏打开--浮动窗口
```csharp
using UnityEditor;

public class TutorialWindow : EditorWindow
{
    private static TutorialWindow window; //窗口实例对象，必须是一个static

    [MenuItem("MyWindows/TutorialWindow")] //定义菜单栏位置
    public static void OpenWindow() //打开窗口函数，必须是static
    {
        window = GetWindow<TutorialWindow>(false, "TutorialWindow", true); //实例化窗口
        window.Show(); //显示窗口
    }
    /// <summary>
    /// 窗口内显示的GUI面板
    /// </summary>
    private void OnGUI()
    {
    
    }
}
```

## 编辑器-检视面板Inspector
## 1.Mono代码
```csharp
public class TutorialMono : MonoBehaviour //基本就是个空的Mono
{
	//实现内容
}
```
## 2. Editor代码
+ 设置CustomEditor特性
+ 设置实例目标target
+ OnInspectorGUI函数
```csharp
using UnityEditor;
using UnityEngine;

[CustomEditor(typeof(TutorialMono))] //指定自定义Editor所要绑定的Mono类型，这里就是typeof(TutorialMono)
public class TutorialMonoInspector : Editor //继承Editor
{
    private TutorialMono m_target; //在Inspector上显示的实例目标
    /// <summary>
    /// 当对象活跃时（在Inspector中显示时），unity自动调用此函数
    /// </summary>
    private void OnEnable()
    {
        m_target = target as TutorialMono; //绑定target，target官方解释： The object being inspected
    }
    /// <summary>
    /// 重写OnInspectorGUI，之后所有的GUI绘制都在此方法中。
    /// </summary>
    public override void OnInspectorGUI()
    {
        base.OnInspectorGUI(); //调用父类方法绘制一次GUI，TutorialMono中原本的可序列化数据等会在这里绘制一次。
        //如果不调用父类方法，则这个Mono的Inspector全权由下面代码绘制。

        if (GUILayout.Button("这是一个按钮"))   //自定义按钮
        {
            Debug.Log("Hello world");
        }
    }
}
```


## 编辑器ToolBar
+ 定义
```c#
 [InitializeOnLoad]
 public class ToolbarGUIUtility
 {
   
        static ToolbarGUIUtility()
        {
            ToolbarExtender.RightToolbarGUI.Add(OnRightToolbarGUI);
        }
}

   static void OnRightToolbarGUI()
   {

       if (GUILayout.Button(new GUIContent("HelperMonitor", "HelperMonitor"), ToolbarButtonRightStyle, GUILayout.Width(80)))
       {
           HelperMonitor_UIElement.ShowEnergyMonitor_UIElement();
       }
   }
```
+ 展示
```c#
		public static readonly List<Action> RightToolbarGUI = new List<Action>();
		private void OnGUI()
		{
		
			if (rightRect.width > 0)
			{
				GUILayout.BeginArea(rightRect);
				GUILayout.BeginHorizontal();
				foreach (var handler in RightToolbarGUI)
				{
					handler();
				}

				GUILayout.EndHorizontal();
				GUILayout.EndArea();
			}
		}
```

