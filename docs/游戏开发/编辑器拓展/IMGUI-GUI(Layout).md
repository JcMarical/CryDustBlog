# 介绍
IMGUI是标准的即时模式，即不存储状态，即时刷新


# 使用
OnGUI()函数:挂载到mono的脚本都可以使用的一个函数。
+ 每帧执行两次左右
+ 生命周期：OnDisable之前，LateUpdate之后 

# GUI基础三部曲
## 一 GUI控件绘制的共同点
+ 他们都是GUI公共类中提供的静态函数，直接调用
+ 参数都大同小异
	+ 位置参数：Rect参数 x y 位置， w 、h尺寸
	+ 显示文本： string参数
	+ 图片信息：Texture参数
	+ 综合信息：GUIContent参数
	+ 自定义样式：GUIStyle参数
+ 每一种控件都有多种重载，都是各个参数的排列组合

必备参数内容：位置信息和显示信息


## 二 GUI文本控件
+ 基本使用（Rect也可以设置为变量进行调整）：
```c#
//位置+文本
GUI.Label(new Rect(0,0,100,20),"Hello,world！")
//位置+纹理
public Texture tex;
GUI.Label(new Rect(0,30,100,20),tex);
```
+ 综合使用：可以在外部设置组合的参数（Text，Image，ToolTip）
```c#
public GUIContent content;
GUI.Label(rect1,content);
```
+ 自定义样式,style内部含有非常多的参数可以自定义：
```c#
public GUIStyle style;
GUI.Label(new Rect(0,0,100,20),"Hello,world!",style)

```
![](res/Pasted%20image%2020241008151052.png)
## 三 按钮控件
+ 基础
+ 综合
+ 自定义样式
```c++
 GUI.Button(btnRect,content,style)
//处理点击事件
if(GUI.Button(btnRect,btnContent,btnStyle))
{
	Debug.Log("按钮被点击")
}


//只要在长按按钮范围内，按下鼠标，就会一直返回true
if(GUI.RepeatButton(btnRect,btnContent,btnStyle))
{
	Debug.Log("长按按钮被点击")
}
```

# GUI多选框/单选框控件
## 一 多选框
+ 普通样式:
```c++
GUI.Toggle(new Rect(0,0,100,30),true,"效果开关"）

//条件存储
private bool isSel;
isSel = GUI.Toggle(new Rect(0,0,100,30),isSel,"效果开关")

```

## 二 单选框
核心：通过一个int标识决定是否选中
```c#
if(GUI.Toggle(new Rect(0,60,100,30)),nowSelIndex == 1, "选项一"))
	nowSelIndex = 1;
if(GUI.Toggle(new Rect(0,100,100,30),nowSelIndex == 2,"选项二"))
	nowSelIndex = 2;
if(GUI.Toggle(new Rect(0,140,100,30),nowSelIndex == 3,"选项三"))
   nowSelIndex = 3;
```


# 自定义整体样式--GUILayout自动布局

## 一 自动布局
省去自己排版的功夫，自动从左上开始帮你布局
+ 默认纵向
```c#
GUILayout.Button("123");
GUILayout.Button("1234");
GUILayout.Button("123456");
```

+ 设置横向
```C#
GUILayout.BeginHorizontal();
GUILayout.Button("123");
GUILayout.Button("1234");
GUILayout.Button("123456");
GUILayout.EndHorizontal();
```

+ 设置可见范围
```c#
GUILayout.BeginArea(new Rect(100,100,100,100));
..
GUILayout.EndArea();
```
+ 也可以配合着GUI使用
```c++
GUI.BeginGroup(new Rect(100,100,100,100));
GUILayout.BeginHorizontal();
GUILayout.Button("123");
GUILayout.Button("1234");
GUILayout.Button("123456");
GUILayout.EndHorizontal();
GUI.EndGroup();
```

## 二 GUILayoutOption 布局选项
+ 控件固定宽高
```c#
GUILayout.Width(300);
GUILayout.Height(200);
//允许空间的最小宽高
GUILayout.MinWidth(50);
GUILauoyt.MinHeight(50);
//允许空间的最大宽高
GUILayout.MaxWidth(100);
GUILauout.MaxHeight(100);
//允许或禁止水平拓展
GUILayout.ExpandWidth(true);//允许
GUILayout.ExpandHeight(false);//禁止
GUILayout.ExpandHeight(true);//
```