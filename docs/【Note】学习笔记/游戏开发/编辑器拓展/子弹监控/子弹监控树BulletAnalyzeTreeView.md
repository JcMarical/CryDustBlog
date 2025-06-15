# 主要依靠GUI的TreeView控件实现




## 刷新与重绘
在我们更新数据后，树不会重新绘制，我们需要调用`base.Repaint()`来保证数据的刷新


## 新数据绘制在前面
对于每个TreeItem，他的子列表children是通过一个List维护的。
+ AddChild()函数是自动放在这个List后面的，并提供了children的初始化功能
+ 而children最开始并没有初始化，直接Insert有可能会导致找不到引用
这样就可以实现每次绘制新的数据在前面了。
```c#
                    if (actorNode.children != null) 
                        actorNode.children.Insert(0,pRoot);
                    else
                        actorNode.AddChild(pRoot);
```


## 通过选择树选项，跳转到Hierarchy视图选择对应的物体
由于对象名带有/符号，使用GameObject.Find无法正确的识别到对应的物体。
这里采用搜索组件的方式来获得相关组件，并通过id来判断是否为选择的物体
```c#
    private void OnSelectionHierachyShow(BulletAnalyzeTreeItem item)
    {

        var bullets = BulletRoot.GetComponentsInChildren<BulletBase>(); //Bullet使用Find找到的根节点
        foreach(BulletBase bullet in bullets)
        {
            if (bullet.InstanceId == item.instanceID)
            {
                Selection.activeGameObject = bullet.gameObject;
            }

        }
    }
```