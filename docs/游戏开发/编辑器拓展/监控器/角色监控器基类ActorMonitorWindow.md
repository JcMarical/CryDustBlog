
# 变量声明

![](res/Pasted%20image%2020240930113414.png)![](res/Pasted%20image%2020240930114215.png

# 房间管理

![](res/Pasted%20image%2020240930114420.png)

# 日志管理
```c#

    protected LogManager LogManager
    {
        get
        {
            if(AppRoot.Instance == null)
            {
                return NULL_LOG_MANAGER;
            }

            RoomManager roomManager = AppRoot.Instance.GetRoomManager();
            if(roomManager == null)
            {
                return NULL_LOG_MANAGER;
            }

            GameLevelMG gameLevelMG = roomManager.GetGameLevelMGByRoomNumber(CurrRoomNumber);
            if(gameLevelMG == null)
            {
                return NULL_LOG_MANAGER;
            }

            return gameLevelMG.LogManager;
        }
    }
```

# 生命周期函数
```c++

    protected virtual void OnEnable()
    {
        LoadUXML();
    }

    protected virtual void OnGUI()
    {
        Rect worldBound = rootVisualElement.worldBound;

        fullWidth = worldBound.width - 2f;
        fullHeight = worldBound.height - 2f;
        bottomWidth = worldBound.width - 8f;
        bottomHalfWidth = bottomWidth / 2f;
        halfHeight = (worldBound.height - 85f) / 2f; // 如果新增了水平向的工具栏，需要增加相应的高度扣除量，才能保证尺寸计算准确
        bottomHeight = (worldBound.height - 105f) / 2f;// 如果新增了水平向的工具栏，需要增加相应的高度扣除量，才能保证尺寸计算准确

        try
        {
            dataOuterScrollView.style.width = fullWidth;
            dataOuterScrollView.style.height = halfHeight + verticalResize;

            horizontalDragBar.style.width = fullWidth;

            if (LogManager != null)
            {
                RefreshActor();
            }
        }
        catch (Exception e)
        {
            Debug.Log(e.StackTrace);
        }
    }

    void OnInspectorUpdate()
    {
        Repaint();
    }

    void OnDestroy()
    {
        ClearActor();
        ClearMonitorInfo();
    }
```
# LoadUXML 加载UXML文件
+ StyleSheet：样式表应用于视觉元素以控制用户界面的布局和视觉外观。
+ VisualTreeAsset:要根据 UXML 模板构建用户界面，必须先将模板加载到 `VisualTreeAsset` 中
+ 然后就是加载之前变量声明的UIElement元素
```c++
protected virtual void LoadUXML()
{
 root = rootVisualElement;
 StyleSheet styleSheet = AssetDatabase.LoadAssetAtPath<StyleSheet>("Assets/Shared/Editor/LogMonitor/LogMonitorWindowStyle.uss");
 root.styleSheets.Add(styleSheet);

 VisualTreeAsset actorMonitorVisualTree = AssetDatabase.LoadAssetAtPath<VisualTreeAsset>("Assets/Shared/Editor/LogMonitor/ActorMonitorWindow.uxml");
 actorMonitorVisualTree.CloneTree(root);

 rootContainer = root.Q<VisualElement>(name: "root-container");
 dataOuterScrollView = root.Q<ScrollView>(name: "actorStatus-outer-scrollview");
 dataRowContainer = root.Q<ScrollView>(name: "actorStatus-scrollview");
 visualTreeAsset_dataRow = AssetDatabase.LoadAssetAtPath<VisualTreeAsset>("Assets/Shared/Editor/LogMonitor/LogMonitor_DataRow.uxml");
 detailRoot = root.Q<VisualElement>(name: "detail-root");

 horizontalDragBar = root.Q<VisualElement>(className: "horizontal-drag-bar");
 LogMonitor_DragBar dragBar_Horizontal = new LogMonitor_DragBar();
 dragBar_Horizontal.Init(root, horizontalDragBar, LogMonitor_DragBar.BarDirection.Horizontal, delegate (float verticalOffset) { verticalResize = verticalOffset; });

 VisualElement toolbar_Log_Filter = root.Q<VisualElement>(name: "toolbar-actor-filter");
 m_hideDeadActorToggle = toolbar_Log_Filter.Q<Toggle>(name: "hideDeadActorToggle");
 m_hideDeadActorToggle.RegisterValueChangedCallback(x =>
 {
	 if (LogManager != null)
	 {
		 RefreshActor(true);
	 }

	 RefreshMonitorInfo();
 }
 );
 m_hideRightLogToggle = toolbar_Log_Filter.Q<Toggle>(name: "hideRightLogToggle");
 m_hideRightLogToggle.style.right = 20;
 
 List<string> proxyCategoryStrs = new List<string>();
 for(int i = 0 ; i < (int)ActorProxyType.Max; i++)
 {
	 if (Enum.IsDefined(typeof(ActorProxyType), i))
	 {
		 string str = GetActorProxyDescription((ActorProxyType)i);
		 proxyCategoryStrs.Add(str);
	 }
	 else
	 {
		 proxyCategoryStrs.Add("未定义类型" + i);
	 }
 }
 
 actorProxyMaskEnumField_Container = toolbar_Log_Filter.Q<VisualElement>(name: "actorProxyMaskEnumField-container");
 
 actorProxyMaskEnumField = new MaskField(proxyCategoryStrs, ~0);
 actorProxyMaskEnumField.AddToClassList("toolbar-element");
 actorProxyMaskEnumField.AddToClassList("toolbar-maskField");
 actorProxyMaskEnumField.RegisterValueChangedCallback(x => RefreshActor(true));
 actorProxyMaskEnumField_Container.Add(actorProxyMaskEnumField);
}
```

# USS
![](res/Pasted%20image%2020240930151101.png)

# UXML
![](res/Pasted%20image%2020240930152223.png)

# 内部功能
剩下的就是如何获取这些数据，以及一些更新方法了
```
```