# Reload

在Unity中，`TreeView`的`Reload`方法用于强制重新加载其数据。当你调用这个方法时，它会导致`BuildRoot`和`BuildRows`方法被调用。这通常在数据发生变化时需要更新`TreeView`显示时使用。

具体来说，`Reload`方法会做以下几件事情：

1. 调用`BuildRoot`方法，这是`TreeView`类的一个抽象方法，你需要在你的`TreeView`实现中提供具体的实现。这个方法负责创建`TreeViewItem`的完整树结构，并返回树的根节点。每次调用`Reload`时，都会调用一次`BuildRoot`方法。
    
2. 调用`BuildRows`方法，这个方法负责基于`BuildRoot`中创建的树结构来构建行列表。如果`BuildRoot`中只创建了根节点，那么你需要重写`BuildRows`方法来控制行的生成方式，特别是当你处理的是大型数据集或者数据经常变化时。
    
3. 刷新`TreeView`的显示，确保所有的更改都被反映出来。


## 所以每次清理数据是不对的。。。