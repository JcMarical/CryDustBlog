
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


# TreeView重要的类和方法
## 1. TreeViewItem 
为了处理 TreeView 的渲染，需要确定一个扩展项（称为行）列表，用于在Editor中构建树结构的表示。每一行代表一个 `TreeViewItem`。
+ 每个 `TreeViewItem` 都包含**父子信息**，此信息可供 TreeView 用来处理导航（按键和鼠标输入）。
+ 每个 `TreeViewItem` 必须以唯一的整数 ID（在 TreeView 中的所有项中是唯一的）进行构造，用于：
	+ 查找项
	+ 选择状态
	+ 展开状态
	+ 导航
+ 如果树表示 Unity 对象，应为每个对象使用 [GetInstanceID](https://docs.unity.cn/cn/2019.4/ScriptReference/Object.GetInstanceID.html) 作为 `TreeViewItem` 的 ID
+ depth属性：表示视觉缩进

## 2.TreeViewState状态信息
包含交互时的状态信息，**唯一可序列化**：
+ 选择状态
+ 展开状态
+ 导航状态
+ 滚动状态

## 3.BuildRoot
TreeView的单个抽象方法，必须实现该方法才能创建TreeView。
+ 使用此方法发可以创建树的根项
+ 每次Reload都会调用该方法
对于小型树，每次重新加载可以直接创建整个TreeViewItems
## 4.BuildRows
虚拟方法，此方法默认基于BuildRoot中创建的完整树来构建行列表。可以重写此方法来处理展开的行



# Tree的创建

## 初始化TreeView
要创建TreeView，需要创建一个扩展TreeView的类，并实现抽象方法 `BuildRoot`
```c++
class SimpleTreeView : TreeView{

}
```
### 1. 调用基类构造，并实现自己的构造
```c#
public SimpleTreeView(TreeViewState treeViewState) : base(treeViewState) { 
	Reload();
}
```

## 2.实现BuildRoot重载
+ ID应该唯一。
+ 根项深度必须为-1，其余的深度在此基础上递增
方法一：使用了深度信息构建
```c#
    protected override TreeViewItem BuildRoot()
    {
        var root = new TreeViewItem { id = 0, depth = -1, displayName = "Root" };
        var allItems = new List<TreeViewItem>
		{
	        new TreeViewItem {id = 1, depth = 0, displayName = "Animals"},
	        new TreeViewItem {id = 2, depth = 1, displayName = "Mammals"},
	        new TreeViewItem {id = 3, depth = 2, displayName = "Tiger"},
	        new TreeViewItem {id = 4, depth = 2, displayName = "Elephant"},
	        new TreeViewItem {id = 5, depth = 2, displayName = "Okapi"},
	        new TreeViewItem {id = 6, depth = 2, displayName = "Armadillo"},
	        new TreeViewItem {id = 7, depth = 1, displayName = "Reptiles"},
	        new TreeViewItem {id = 8, depth = 2, displayName = "Crocodile"},
	        new TreeViewItem {id = 9, depth = 2, displayName = "Lizard"},
		};

        // 用于初始化所有项的 TreeViewItem.children 和 .parent 的实用方法。
        SetupParentsAndChildrenFromDepths(root, allItems);

        //返回树的根
        return root;
    }
```
方法二：使用AddChild直接设置父项和子项
```c#
   protected override TreeViewItem BuildRoot()
   {
       var root = new TreeViewItem { id = 0, depth = -1, displayName = "Root" };
       var animals = new TreeViewItem { id = 1, displayName = "Animals" };
       var mammals = new TreeViewItem { id = 2, displayName = "Mammals" };
       var tiger = new TreeViewItem { id = 3, displayName = "Tiger" };
       var elephant = new TreeViewItem { id = 4, displayName = "Elephant" };
       var okapi = new TreeViewItem { id = 5, displayName = "Okapi" };
       var armadillo = new TreeViewItem { id = 6, displayName = "Armadillo" };
       var reptiles = new TreeViewItem { id = 7, displayName = "Reptiles" };
       var croco = new TreeViewItem { id = 8, displayName = "Crocodile" };
       var lizard = new TreeViewItem { id = 9, displayName = "Lizard" };

       root.AddChild(animals);
       animals.AddChild(mammals);
       animals.AddChild(reptiles);
       mammals.AddChild(tiger);
       mammals.AddChild(elephant);
       mammals.AddChild(okapi);
       mammals.AddChild(armadillo);
       reptiles.AddChild(croco);
       reptiles.AddChild(lizard);

       SetupDepthsFromParentsAndChildren(root);

       return root;
   }
```

# TreeViewWindow : EditorWindow实现方法
+ 序列化TreeViewState
+ 实现重载的树结构
+ 检查是否已经存在序列化视图状态
+ OnGUI展示树结构
+ 添加到菜单栏
```c#
	class SimpleTreeViewWindow : EditorWindow
	{
		// SerializeField 用于确保将视图状态写入窗口
		// 布局文件。这意味着只要窗口未关闭，即使重新启动 Unity，也会保持
		// 状态。如果省略该属性，仍然会序列化/反序列化状态。
		[SerializeField] TreeViewState m_TreeViewState;

		//TreeView 不可序列化，因此应该通过树数据对其进行重建。
		SimpleTreeView m_SimpleTreeView;

		void OnEnable()
		{
			//检查是否已存在序列化视图状态（在程序集重新加载后
			// 仍然存在的状态）
			if (m_TreeViewState == null)
				m_TreeViewState = new TreeViewState();

			m_SimpleTreeView = new SimpleTreeView(m_TreeViewState);
		}

		void OnGUI()
		{
			m_SimpleTreeView.OnGUI(new Rect(0, 0, position.width, position.height));
		}

		// 将名为 "My Window" 的菜单添加到 Window 菜单
		[MenuItem("TreeView Examples/Simple Tree Window")]
		static void ShowWindow()
		{
			// 获取现有打开的窗口；如果没有，则新建一个窗口：
			var window = GetWindow<SimpleTreeViewWindow>();
			window.titleContent = new GUIContent("My Window");
			window.Show();
		}
	}
```

