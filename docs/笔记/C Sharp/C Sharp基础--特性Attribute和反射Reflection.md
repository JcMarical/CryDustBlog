# C Sharp 基础--特性 Attribute 和反射 Reflection

# C#特性 Attribute
C#的特性跟 Java 的注解差不多，可以将描述程序集的信息和描述程序集中任何类型和成员的信息添加到**程序集的元数据和 IL 代码**中，程序可以在运行时通过反射获取到这些信息；

+ .Net 框架提供了两种类型的特性：预定义特性和自定义特性。

## 预定义特性

预定义特性分为三种：

- AttributeUsage：描述了**如何使用一个自定义特性类**
- Conditional(常用)：**引起方法调用的条件编译**
- Obsolete：标记了不应被使用的程序实体

## Unity 常用特性

[Space]
　　可以与上面形成一个空隙，可以带参数[Space（30）]
[Header(“XXX”)]
　　在 Inspector 面板上给定义的字段的上一行加段描述，可以将属性隔离开，形成分组的感觉
[Tooltip(“XXX”)]
　　给一个变量添加这个属性后,在 Inspector 面板将鼠标悬停在该变量上可以显示提示
[Range(min, max)]`
　　限制数值变量的取值范围并以滑动条显示在 Inspector 中
[Min(min)]
　　限制一个 float,int 类型的变量的最小值(测试 2018,2019 不能正常使用,据说 2020 修复了这个 bug)
[SerializeField]
　　强制序列化一个私有的变量,使其可以在 Inspector 面板显示,很多 UI 都会对 private 的组件进行强制序列化
[NonSerialized]
　　在 Inspector 版面中隐藏 public 属性，不执行序列化
[HideInInspector]
　　使属性在 Inspector 中隐藏，但是还是可序列化，想赋值可以通过写程序赋值序列化
[System.Serializable]
　　使自定义的类能进行序列化，即当做一个 public 成员的时候可以在 Inspector 显示
[InspectorName(“枚举 A”)]
　　标记枚举类型的枚举值，可以使枚举值在 Inspector 上显示的名字改变
[FormerlySerializedAs(“XXX”)]
　　使变量以另外的名称进行序列化，并且在变量自身修改名称的时候，不会丢失之前的序列化的值
[ContextMenuItem(“显示的方法名”,“方法”)]
　　标记字段，在 Inspector 面板上给字段右键段添加一个菜单,不能是静态函数
[Multiline]
　　添加在 string 类型的变量上,可以在 Inspector 面板上显示一个多行文本框
[TextArea]
　　该属性可以把 string 在 Inspector 面板上变为一个带有滚动条的文本域
[NotConverted]
　　在变量上使用，可以指定该变量在 build 的时候，不要转换为目标平台的类型
[NotFlashValidated]
　　在变量上使用，在 Flash 平台 build 的时候，对该变量不进行类型检查。Unity5.0 中已经移除了这个属性
[NotRenamed]
　　禁止对变量和方法进行重命名。Unity5.0 中已经移除了这个属性
[ColorUsage(false, true, 0f, 8f, 1f, 1f)]
　　第一个参数:是否启用 Alpha 通道
　　第二个参数:是否启用 HDR 模式,启用后多四个参数为 最小/最大亮度,最小/最大曝光度
[GradientUsage]
　　给一个 Gradient 类型的变量添加这个属性用来设置是否为 HDR 渐变模式
[Delayed]
　　标记 int/float/string 类型的变量,在 Inspector 面板修改变量值时,只有按下 Enter 键 或 鼠标失去焦点后值才会改变

标记类/方法
[RequireComponent(typeof(ClassName))]
　　将被标记的类拖到（或者 AddComponent）GameObject 上时，自动再给你加上“ClassName”这个类，如果已经存在该组件不会重复添加，且不能移除该组件
[ExecuteAlways]
　　 添加这个属性后脚本无论是在 Edit Mode 还是 Play Mode 都会执行。(每次切换状态时要运行一次)
[ExecuteInEditMode]
　　在编辑界面让你的功能(类)(非 Play 模式)起作用。默认状态下，MonoBehaviour 中的 Start、Update、OnGUI 等方法需要在 Play 状态下才会被执行，此属性似的程序在 Editor 模式下也能执行。
　　添加这个属性后的脚本可以在 EditMode 下执行,要注意的是有些函数的执行方式与 PlayMode 不同：
　　Update：只在 Scene 编辑器中有物体产生变化（如在编辑器中修改数值）时才会调用。
　　OnGUI：当 GameView 收到一个 Event 时才会调用。
[AddComponentMenu(“XXX/XX/XXX”)]
　　让 Component 菜单下出现你自定义的类，位置是“XXX/XX/XXX”
[CustomEditor(typeof(ClassName))]
　　声明一个 Class 为自定义 Editor 的 Class,可以制作一个自定义编辑器
[MenuItem(“一级菜单名/二级菜单名 _ 全局快捷键”]
　　标记函数：在菜单中出现选项栏，执行对应功能。注：对应的函数必须是 static
　　[MenuItem(“一级菜单名/二级菜单名”,false,1)]
　　第三个参数决定菜单的优先级。间隔超过 10，就另开一组，用下划线分隔
　　第二个参数是 true 则是是给该菜单项添加验证，分别标记两个函数，true 标记的函数作为 false 标记的函数能否启用并执行的验证，菜单名，优先级要相同
　　GameObject 菜单与 Hierarchy 面板右键菜单一样，优先级在 10 左右。
　　Assets 菜单与 project 面板右键菜单一样
　　菜单名 + _快捷键，给菜单指定单一快捷键
　　菜单名 + % 快捷键，给菜单指定组合快捷键 %-Ctrl #-Shift &-Alt
[ContextMenu(“菜单选项名”)] / [MenuItem(“CONTEXT/组建名/菜单名”)]
　　标记函数：在 Inspector 面板，右击包含这条标记的脚本，出现“菜单名”的菜单选项。
　　注：对应的函数不能是 static
　　标记的函数可以添加 MenuCommand cmd 参数，cmd.context 转换为当前组建类型后操作
[CreateAssetMenu(menuName = "MySubMenue/Create XXX ")]
　　标记类，可以给 project 面板下的 Creat 菜单下新建一个自定义子菜单，用于新建自定义资源
[PreferBinarySerialization]
　　只能用于 ScriptableObject 的派生类，使用二进制进行序列化。这个属性可以提升大量数据资源文件的读写性能。可以搭配 CreateAssetMenu 属性一起使用
[SerializeReference]
　　序列化时共享相同的对象数据，可以用来减少序列化的内容
[GUITarget(0)]
　　标记 OnGUI()函数，控制对应的 OnGUI 在哪个 Display 显示
[HelpURL(“http://www.baidu.com”)]
　　标记一个类提供一个帮助文档的 URL，点击后可以跳转到该网址(与自带组件点击小树效果相同)
[AssemblyIsEditor]
　　汇编级属性，使用该属性的 Class 会被认为是 EditorClass。具体用法不明
[DisallowMultipleComponent]
　　对一个 MonoBehaviour 的子类使用这个属性，那么在同一个 GameObject 上面，最多只能添加一个该 Class 的实例。尝试添加多个的时候，会出现提示
[ImageEffectOpaque]
　　在 OnRenderImage 上使用，可以让渲染顺序在非透明物体之后，透明物体之前
[ImageEffectTransformsToLDR]
　　渲染从从 HDR 变为 LDR 具体使用方法不明
[RuntimeInitializeOnLoadMethod]
　　此属性仅在 Unity5 上可用。在游戏启动时(runtime)，会自动调用添加了该属性的方法(Awake 之后)。要注意的是使用这个属性的方法的调用顺序是不确定的，同时要求方法为静态
[SelectionBase]
　　当一个 GameObject 含有使用了该属性的 Component 的时候，在 SceneView 中选择该 GameObject，Hierarchy 上面会自动选中该 GameObject 的 Parent
[SharedBetweenAnimators]
　　用于 StateMachineBehaviour 上,指定该 StateMachineBehavior 只实例化一次,不同的 Animator 将共享这一个 StateMachineBehaviour 的实例,可以减少内存占用
[UnityAPICompatibilityVersion]
　　用来声明 API 的版本兼容性
[CallbackOrderAttribute]
　　定义 Callback 的顺序
[UnityAPICompatibilityVersion]
　　用来声明 API 的版本兼容性
[CanEditMultipleObjects]
　　Editor 同时编辑多个 Component 的功能
[CustomPreview(typeof(GameObject))]
　　将一个 class 标记为指定类型的自定义预览
[CustomPropertyDrawer]
　　标记自定义 PropertyDrawer 时候使用。当自己创建一个 PropertyDrawer 或者 DecoratorDrawer 的时候，使用该属性来标记
[DrawGizmo (GizmoType.Selected | GizmoType.Active)]
　　以在 Scene 视图中显示自定义的 Gizmo,Gizmo 的图片需要放入 Assets/Gizmo 目录中
[InitializeOnLoad]
　　在 Class 上使用，可以在 Unity 启动的时候，运行 Editor 脚本。需要该 Class 拥有静态的构造函数。
[InitializeOnLoadMethod]
　　在 Method 上使用，是 InitializeOnLoad 的 Method 版本。Method 必须是 static 的
[PreferenceItem (“My Preferences”)]
　　使用该属性可以定制 Unity 的 Preference 界面
[OnOpenAsset()]
　　在打开一个 Asset 后被调用
[PostProcessBuild()]
　　该属性是在 build 完成后，被调用的 callback。同时具有多个的时候，可以指定先后顺序
[PostProcessScene()]
　　使用该属性的函数，在 scene 被 build 之前，会被调用。具体使用方法和 PostProcessBuildAttribute 类似

NetWork
[Command]
　　由客户端发起，运行在服务器上，方法名必须以 Cmd 开头
　　出于安全考虑，命令只能从玩家控制的物体上发出
[ClientRpc]/[RPC]
　　由服务器发起，运行在客户端上，方法名必须以 Rpc 开头
　　可以从任何带有 NetworkIdentity 并被派生出来的物体上发出
[SyncVar]
　　同步变量，从服务器同步到客户端上
　　同步变量的状态在 OnStartClient（）之前就被应用到物体上了
　　同步变量可以是基础类型，如整数，字符串和浮点数。也可以是 Unity 内置数据类型，如 Vector3 和用户自定义的结构体，但是对结构体类型的同步变量，如果只有几个字段的数值有变化，整个结构体都会被发送。每个 NetworkBehaviour 脚本可以有最多 32 个同步变量，包括同步列表
[SyncVar(hook = “Function”)]
　　同步变量还可以指定函数，使用 hook，客户端调用
　　Function 函数有一个 同步变量类型 的参数，参数就是该同步变量的最新值
　　public void OnChangeHealth(int newHealth){}
[Server]
　　只执行在服务器端但是不能标识一些特殊函数（可以在这里调用 Rpc 类函数）
[ServerCallback]
　　只执行在服务器端，并使一些特殊函数（eg: Update）不报错
　　若在此函数中改变了带有[SyncVar]的变量，客户端不同步
　　使用 ServerCallback 时，将 Update 中的重要语句摘出来写入 Rpc 函数中并调用
[Client]
[ClientCallback]
只执行在客户端

[NetworkSettings(channel = 0, sendInterval = 0.333f)]
　　对组件进行配置
[ClientRpc(channel = 1)]

## 自定义特性
.Net 框架允许创建自定义特性，用于存储声明性的信息，且可在运行时被检索。该信息根据设计标准和应用程序需要，可与任何目标元素相关。
自定义特性一般与**反射**同时使用，例如：我想把几个数据模型与数据库做匹配，那么我就可以写一个数据模型特性，再写一个数据处理类，在模型的属性上标注特性（列名、列类型、是否主键、是否可为空等），然后在数据处理类中对数据进行反射，根据数据特性来对数据进行验证或持久化等操作。

创建并使用自定义特性包含四个步骤：

+ 声明自定义特性
+ 构建自定义特性
+ 在目标程序元素上应用自定义特性
+ 通过反射访问特性

最后一个步骤包含编写一个简单的程序来读取元数据以便查找各种符号。元数据是用于描述其他数据的数据和信息。该程序应使用反射来在运行时访问特性。我们将在下一章详细讨论这点。

### 声明自定义特性
一个新的自定义特性应派生自 System.Attribute 类。例如：
```c#
// 一个自定义特性 BugFix 被赋给类及其成员
[AttributeUsage(AttributeTargets.Class |
AttributeTargets.Constructor |
AttributeTargets.Field |
AttributeTargets.Method |
AttributeTargets.Property,
AllowMultiple = true)]

public class DeBugInfo : System.Attribute

```
在上面的代码中，我们已经声明了一个名为 DeBugInfo 的自定义特性。

### 构建自定义特性

让我们构建一个名为 DeBugInfo 的自定义特性，该特性将存储调试程序获得的信息。它存储下面的信息：

- bug 的代码编号
- 辨认该 bug 的开发人员名字
- 最后一次审查该代码的日期
- 一个存储了开发人员标记的字符串消息

我们的 DeBugInfo 类将带有三个用于存储前三个信息的私有属性（property）和一个用于存储消息的公有属性（property）。所以 bug 编号、开发人员名字和审查日期将是 DeBugInfo 类的必需的**定位（ positional）参数**，消息将是一个可选的**命名（named）参数**

```c#
// 一个自定义特性 BugFix 被赋给类及其成员
[AttributeUsage(AttributeTargets.Class |
AttributeTargets.Constructor |
AttributeTargets.Field |
AttributeTargets.Method |
AttributeTargets.Property,
AllowMultiple = true)]

public class DeBugInfo : System.Attribute
{
  private int bugNo;
  private string developer;
  private string lastReview;
  public string message;

  public DeBugInfo(int bg, string dev, string d)
  {
      this.bugNo = bg;
      this.developer = dev;
      this.lastReview = d;
  }

  public int BugNo
  {
      get
      {
          return bugNo;
      }
  }
  public string Developer
  {
      get
      {
          return developer;
      }
  }
  public string LastReview
  {
      get
      {
          return lastReview;
      }
  }
  public string Message
  {
      get
      {
          return message;
      }
      set
      {
          message = value;
      }
  }
}

```

### 应用自定义特性

通过把特性放置在紧接着它的目标之前，来应用该特性：

```c#
[DeBugInfo(45, "Zara Ali", "12/8/2012", Message = "Return type mismatch")]
[DeBugInfo(49, "Nuha Ali", "10/10/2012", Message = "Unused variable")]
class Rectangle
{
  // 成员变量
  protected double length;
  protected double width;
  public Rectangle(double l, double w)
  {
      length = l;
      width = w;
  }
  [DeBugInfo(55, "Zara Ali", "19/10/2012",
  Message = "Return type mismatch")]
  public double GetArea()
  {
      return length * width;
  }
  [DeBugInfo(56, "Zara Ali", "19/10/2012")]
  public void Display()
  {
      Console.WriteLine("Length: {0}", length);
      Console.WriteLine("Width: {0}", width);
      Console.WriteLine("Area: {0}", GetArea());
  }
}

```

# 反射Reflection
反射指程序可以**访问、检测和修改它本身状态或行为**的一种能力。

程序集包含模块，而模块包含类型，类型又包含成员。反射则提供了封装程序集、模块和类型的对象。

您可以使用反射**动态地创建类型的实例，将类型绑定到现有对象，或从现有对象中获取类型**。然后，**可以调用类型的方法或访问其字段和属性**。

## 反射优缺点
### 优点：

1. 反射提高了程序的灵活性和扩展性。
2. 降低耦合性，提高自适应能力。
3. 它允许程序创建和控制任何类的对象，无需提前硬编码目标类。
### 缺点：

* **性能**问题：使用反射基本上是一种解释操作，用于字段和方法接入时要远慢于直接代码。因此反射机制主要应用在对灵活性和拓展性要求很高的系统框架上，普通程序不建议使用。
* 使用反射会**模糊程序内部逻辑**；程序员希望在源代码中看到程序的逻辑，反射却**绕过了源代码的技术**，因而会带来**维护**的问题，反射代码比相应的直接代码更复杂。



## 反射（Reflection）的用途
反射（Reflection）有下列用途：

+ 它允许在**运行时查看特性**（attribute）信息。
+ 它允许**审查**集合中的各种类型，以及**实例化**这些类型。
+ 它允许**延迟绑定**的方法和属性（property）。
+ 它允许在**运行时创建新类型**，然后使用这些类型执行一些任务。

## 查看元数据
我们已经在上面的章节中提到过，使用反射（Reflection）可以查看特性（attribute）信息。

System.Reflection 类的 MemberInfo 对象需要被初始化，用于发现与类相关的特性（attribute）。为了做到这点，您可以定义目标类的一个对象，如下：
```c++
System.Reflection.MemberInfo info = typeof(MyClass);
```

### 演示

```c#
using System;

[AttributeUsage(AttributeTargets.All)]
public class HelpAttribute : System.Attribute
{
   public readonly string Url;

   public string Topic  // Topic 是一个命名（named）参数
   {
      get
      {
         return topic;
      }
      set
      {

         topic = value;
      }
   }

   public HelpAttribute(string url)  // url 是一个定位（positional）参数
   {
      this.Url = url;
   }

   private string topic;
}
[HelpAttribute("Information on the class MyClass")]
class MyClass
{
}

namespace AttributeAppl
{
   class Program
   {
      static void Main(string[] args)
      {
         System.Reflection.MemberInfo info = typeof(MyClass);//获取反射信息
         object[] attributes = info.GetCustomAttributes(true);//获取特性信息
         for (int i = 0; i < attributes.Length; i++)
         {
            System.Console.WriteLine(attributes[i]);
         }
         Console.ReadKey();

      }
   }
}

```
编译和执行后，会显示附加到类MyClass上的自定义特性
```c#
HelpAttribute
```

## 实例
```c++
using System;
using System.Reflection;//System.Reflection 类的 MemberInfo用于发现与类相关的特性（attribute）。
namespace BugFixApplication
{
    // 一个自定义特性 BugFix 被赋给类及其成员
    [AttributeUsage
    #region//定义了特性能被放在那些前面        
        (AttributeTargets.Class |//规定了特性能被放在class的前面
        AttributeTargets.Constructor |//规定了特性能被放在构造函数的前面
        AttributeTargets.Field |//规定了特性能被放在域的前面
        AttributeTargets.Method |//规定了特性能被放在方法的前面
        AttributeTargets.Property,//规定了特性能被放在属性的前面
    #endregion
        AllowMultiple = true)]//这个属性标记了我们的定制特性能否被重复放置在同一个程序实体前多次。

    public class DeBugInfo : System.Attribute//继承了预定义特性后的自定义特性
    {
        private int bugNo;
        private string developer;
        private string lastReview;
        public string message;

        public DeBugInfo(int bg,string dev,string d)//构造函数，接收三个参数并赋给对应实例
        {
            this.bugNo = bg;
            this.developer = dev;
            this.lastReview = d;
        }
        #region//定义对应的调用，返回对应值value
        public int BugNo
        {
            get 
            {
                return bugNo;
            }
        }
        public string Developer
        {
            get
            {
                return developer;
            }
        }
        public string LastReview
        {
            get
            {
                return lastReview;
            }
        }
        //前面有public string message;
        public string Message//定义了可以通过Message = "",来对message进行赋值。
                             //因为不在构造函数中，所以是可选的
        {
            get
            {return message;}
            set
            {message = value;}
        }
        /*
         * 这部分可以简写如下
         * public string Message{get;set;}
        */
    }
    #endregion

    [DeBugInfo(45, "Zara Ali", "12/8/2012",
         Message = "Return type mismatch")]
    [DeBugInfo(49, "Nuha Ali", "10/10/2012",
         Message = "Unused variable")]//前面定义时的AllowMultiple=ture允许了多次使用在同一地方
    class Rectangle
    {
        protected double length;
        protected double width;//定义两个受保护的（封装）的成员变量
        public Rectangle(double l,double w)//构造函数，对两个成员变量进行初始化，公开的
        {
            length = l;
            width = w;
        }

        [DeBugInfo(55, "Zara Ali", "19/10/2012",
             Message = "Return type mismatch")]
        public double GetArea()
        {
            return length * width;
        }

        [DeBugInfo(56, "Zara Ali", "19/10/2012")]//因为message是可选项，所以可以不给出
                                                 //不给出即为null，为空白
        public void Display()
        {
            Console.WriteLine("Length: {0}", length);
            Console.WriteLine("Width:{0}", width);
            Console.WriteLine("Area:{0}", GetArea());//常规打印
        }
    }

    class ExecuteRectangle
    {
        static void Main(string[] args)//程序入口
        {
            Rectangle r = new Rectangle(4.5, 7.5);//实例化
            r.Display();//执行打印长、宽、面积

            Type type = typeof(Rectangle);//让type对应这个Rectangle类
            // 遍历 Rectangle 类的特性
            foreach (Object attributes in type.GetCustomAttributes(false))//遍历Rectangle的所有特性
            {
                DeBugInfo dbi = (DeBugInfo)attributes;//强制转换
                if(null != dbi)//dbi非空
                {
                    Console.WriteLine("Bug on: {0}", dbi.BugNo);
                    Console.WriteLine("Developer: {0}", dbi.Developer);
                    Console.WriteLine("Last REviewed: {0}", dbi.LastReview);
                    Console.WriteLine("Remarks: {0}", dbi.Message);
                }
            }
            // 遍历方法特性
            foreach (MethodInfo m in type.GetMethods())//遍历Rectangle类下的所有方法
            {
                foreach (Attribute a in m.GetCustomAttributes(true))//遍历每个方法的特性
                {
                    DeBugInfo dbi = a as DeBugInfo;//通过 object 声明对象，是用了装箱和取消装箱的概念.
                                                   //也就是说 object 可以看成是所有类型的父类。
                                                   //因此 object 声明的对象可以转换成任意类型的值。
                                                   //通过拆装箱代替强制转换
                    if (null != dbi)//同理打印
                    {
                        Console.WriteLine("BugFixApplication no: {0},for Method: {1}", dbi.BugNo, m.Name);
                        Console.WriteLine("Developer:{0}", dbi.Developer);
                        Console.WriteLine("Last Reviewed: {0}", dbi.LastReview);
                        Console.WriteLine("Remarks: {0}", dbi.Message);
                    }
                }
            }
            Console.ReadKey();
        }
    }
}

```
# 最后输出结果
```
Length: 4.5
Width: 7.5
Area: 33.75
Bug No: 49
Developer: Nuha Ali
Last Reviewed: 10/10/2012
Remarks: Unused variable
Bug No: 45
Developer: Zara Ali
Last Reviewed: 12/8/2012
Remarks: Return type mismatch
Bug No: 55, for Method: GetArea
Developer: Zara Ali
Last Reviewed: 19/10/2012
Remarks: Return type mismatch
Bug No: 56, for Method: Display
Developer: Zara Ali
Last Reviewed: 19/10/2012
Remarks: 

```