类似于网页HTML的存在
```xml

<?xml version="1.0" encoding="utf-8"?>    //可选声明
<UXML    //命名空间前缀定义+模式定义文件位置
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns="UnityEngine.UIElements"  //命名空间
    xsi:noNamespaceSchemaLocation="../UIElementsSchema/UIElements.xsd"
    xsi:schemaLocation="UnityEngine.UIElements ../UIElementsSchema/UnityEngine.UIElements.xsd">


    <Label text="Select something to remove from your suitcase:"/>
    <Box>
        <Toggle name="boots" label="Boots" value="false" />
        <Toggle name="helmet" label="Helmet" value="false" />
        <Toggle name="cloak" label="Cloak of invisibility" value="false"/>
    </Box>
    <Box>
        <Button name="cancel" text="Cancel" />
        <Button name="ok" text="OK" />
    </Box>
</UXML>

```

## xmlns 定义默认的命名空间


## 元素基类
元素名字与C#中的类名一致，且以VisualElement作为基类，提供如下公共属性。
+ name：名字
+ picking_mode:
+ tabindex:有两个值
+ focusable: 元素是否可聚焦
+ class：以空格分隔的标识符列表。使用类将**视觉样式**分配给元素。
+ tooltip：悬停提示
+ view-data-key:一个字符串，它定义了用于元素序列化的键

## 添加样式< Style >


## 在C# 中加载UXML
```c++
EditorWindow w = EditorWindow.GetWindow(typeof(MyWindow)); //编辑器窗口
VisualTreeAsset uiAsset = AssetDatabase.LoadAssetAtPath<VisualTreeAsset>("Assets/MyWindow.uxml");
VisualElement ui = uiAsset.CloneTree();//形成树状结构
w.rootVisualElement.Add(ui); //将树结构加入window窗口可视化元素里面

```