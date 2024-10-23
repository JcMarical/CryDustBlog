
# UIElements 开发指南 

```c++

```

# VisualElement
负责管理Styles and Unity style sheets
是UIElements 可视化树的成员对象的基类。
VisualElement 包含几项 UIElements 中的所有控件通用的功能，如布局、样式和事件处理。 还有几个派生自它的其他类，可用来实现自定义渲染和定义控件行为。

UIElements支持用USS(Unity style sheet)写的样式表。USS文件是文本文件，受到HTML中层叠样式表Cascading Style Sheets (CSS)的启发。USS格式和CSS相似，但USS中包含一些重写和自定义，以便 在Unity中更好的工作。

本篇翻译包括关于USS的一些细节，它的语法，以及和CSS的区别。



# VisualElement
