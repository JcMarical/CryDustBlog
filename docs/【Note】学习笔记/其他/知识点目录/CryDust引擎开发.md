# 引擎层
## 1.Core
- ApplicationRun运行逻辑--Run循环：
	- 分Layer--OnUpdate更新+ImGUILayer的渲染
	- Run（）本身为private，仅声明并提供mian友元函数交给外部main函数来执行
- 程序main入口：初始化日志模块，创建Application，执行Run，并插入性能分析工具会话
- 简易文件系统FileSystem：
	- Buffer缓冲：分配、释放、拷贝（基于memcpy），以及任意**指针强制转换**`As<T>（）`
		- ScopedBuffer:基于Buffer的独占sturct实现，**结构体实现的继承**。
	- 用Buffer作为文件缓冲，用来二进制的读取文件
	- 文件读取：ifstream流打开文件，定位tellg到末尾指针，再seekg定位到开头，计算文件大小，分配Buffer内存，并返回buffer
- 层栈结构：UI层级与点击事件的分离控制。
	- Log日志系统：第三方库，做了点API封装和核心与客户端封装
- 平台检测：一个公用宏库来做条件编译，目前做了识别，但代码只有Windows
- 计时器：chrono库记录当前时间戳和起始时间戳进行计时
	- 时间步TimeStep：记录当前时间，转换为秒、毫秒等其他单位。并且可以直接构造强制转换为float
- UUID：主要用库，有几个静态变量设置用来生成随机种子并映射到uint64数据范围内
	- 哈希特转：构建UUID特化hash结构体，提供一个uint64_t转换重载以支持哈希容器（注意需要先声明通用模版）。
- Window：（**注意不是微软的意思**）一系列声明，窗口属性，属性获取，窗口回调，VSync垂直同步，事件回调等等具体用策略模式分平台去做。
- 一些鼠标、键盘按键声明
## 2. Debug工具
- 性能监控分析工具：即插桩的简易计时器与监控会话建立，采用宏的方式调用函数进行条件编译。将缓存结果上锁按一定格式写入到json可以在Chrome上查看图像分析。
## 3. 事件
一个单播的事件处理，主要处理按键
- Event：枚举分类型，分事件类别，以及处理结果
- EventDispatcher事件执行器：
	- 提供一个带有bool返回值的function对象绑定函数
	- 事件执行：调用func并获取事件处理结果。
- 其他的一些应用、按键、鼠标事件派生Event设计

**Input设计**：
- 函数注册：Application，应用生成时，注册一个OnEvent函数，
- 传参：其实就是在窗口变动（包括按键）时，设置一个按键Event并传入到对应的窗口事件（函数）对象绑定`EventCallback(event)`。
- 方法执行**轮询**OnEvent：Application的OnEvent轮询所有Layer层级的所有Event可能性,判断**类型相同**才在该层级调用event。
## 4.ImGUI封装
这块不是很想讲，具体用什么功能时查api就行。主要也是单独做一个Layer生命周期设置和一些按键绑定、字体设置

## 5.Math
主要还是用glm库，这里目前只做了个拆解Transform矩阵的方法。
> 这玩意儿还被考了，奶奶滴

# 6. Physics2D
主要也是用box2D库，做点API封装
- 刚体组件的bodyType碰撞类型和实际box2D的类型进行互转


# 7.Project
项目这一块倒不需要加载文件了，都是路径。
- ProjectConfig项目配置：项目名字+初始场景文件路径+资产文件路径+脚本模块路径
- ProjectSerializer项目序列化器：主要做YAML序列化的保存和加载，存的是项目配置。
- project：存储一些项目相关的东西，以及加载、保存（用前面的序列化）等功能
	- 一个静态变量存储**项目上下文**
	- 项目目录存储
	- 项目配置
# 8.Renderer
- Texture组件：基类，主要交给子类用队应的API去做
	- ImageFormat：纹理格式枚举
	- TextureSpecification：纹理描述符，存储基本信息（大小、格式、mip等）
	- 方法：一些纹理信息的获取，设置、绑定到GPU，是否加载的判断
	- 两种2D纹理创建：描述符创建，路径创建

- Font字体渲染：本质是一个**纹理**，前向声明MSDF多通道SDF结构，用Texture做的一些东西去渲染。
	- 为什么要SDF？分辨率限制
	- MSDF本身三通道记录左、上、斜边（Z）的距离，可以保留更多的尖角信息（但是大）
	- MSDFData：存储到引擎里面的数据，vector存字形几何集合和字体几何信息
	- 字体渲染纹理算法：本质上用库，将字形集合通过库生成器创建成一个位数据集合。然后我们只需要通过位集合大小去创建纹理描述符，再去创建纹理将数据赋值到纹理上就OK了。
- Renderer2D：
	- Renderer2Ddata：静态数据，存下面一切的东西
	- 初始化：顶点数组VAO、缓冲VBO、quad、Circle、line的下标、纹理初始化、sampler采样器缓存（绑定对应的纹理）、四种对应的shader初始化与生成、相机的VP开辟显存空间。
		- 缓存与合批：即在CPU上将同一种类型的绘制合在一起，发送给GPU绘制，以此降低DrawCall。
		- 
	- 关闭：delete掉顶点缓存就OK
	- 渲染场景准备：清理数据，合批清理
	- 结束准备：Flush（DrawCall绘制，顺便计数）
	- 合批：合批到极限的时候，会Flush一次
		- 绘制四面体
		- 绘制圆
		- 绘制线
		- 绘制字体：其实也是绘制四面体，但是需要做一些特殊字符的识别（回车、换行、空格）
	- 统计数字
# 9.Scene场景
ECS：
- Component：
	- ID：实例识别
	- Tag：名称识别（组件名字，场景里显示的）
	- Transform：存3个vector3 ，平移* 旋转 * 位移，旋转用glm库四元数计算
	- SpriteRenderer
	- CircleRenderer
	- CameraComponent
	- ScriptComponent：C#脚本
	- NativeScriptComponent：**没加头文件**，需要做脚本实体的**前向声明**，C++原生脚本，**必须**存指针，需要bind提供脚本实例和摧毁脚本的函数：
	- Rigidbody2DComponent:box2D需要的参数，比如碰撞Static、Dynamic、Kinematic
	- BoxCollider2DComponent：偏移、大小，密度、恢复力度、恢复力阈值、摩擦力、RuntimeFixture
	- CircleCollider2DComponent
	- TextComponent：文字、字体、颜色、字符间距、行距
	- 一个Component组
- Entity：
	- 本质：一个entt的实体handle，一个当前场景指针。
	- 实体**基类**，提供一些添加、替换、删除、获取Component的方法，以及一些component的信息，比如UUID和Tag。
- System：entt有专门的view和group，使用时直接拿到实体组后顺序遍历即可。

Scene：存有实体注册表，视口信息、运行时和暂停参数、物理World、UUID实体哈希表
- 场景的一些复制和拷贝
- 实体创建、复制、查找
- 主相机查找、窗口视口改变函数->影响相机视口。
- 生命周期：模拟、运行时卡开关，编辑器运行时，渲染场景，，组件添加。
	- OnCreate：说说这里，模拟只打开物理，而运行时打开时除了打开物理，还要**运行脚本ScripEngine**并拿到所有的ScriptComponent，执行其OnCreate的生命周期方法。
	- 运行时OnUpdate：拿到**时间步**，
		- 脚本：执行脚本的OnUpdate，Native脚本的创建和OnUpdate
		- 物理：传入物理库的**Step步进更新方法**并拿到所有有rigidbody2D的实体，再去拿其Transform和刚体组件，将刚体计算过的的位移旋转重新赋值给Transform。
		- 渲染：
			- 相机：判断主相机拿到Transform传入**变换矩阵**来算VP。
			- 如果是主相机，开启渲染器StartScene功能，P都是相机决定好的，V是刚才那个变化矩阵的逆矩阵，拿到VP矩阵，将其传入到UniformData里面去准备渲染。
			- 然后就是各种Renderer、Text去传入渲染的数据。
			- 渲染器EndScene：设置各种批顶点数据、绑定纹理，shader，绘制。
	- 模拟OnUpdateSimulation：**没有暂停时**仅模拟，然后渲染场景（没有相机的一些设置，但是有绘制）
	- 编辑器运行时：仅渲染
- 物理2D启动和停止:
	- 启动：设置world（重力加速度）
		- 刚体：将刚体组件的参数转换成物理库body，将其设置到physicsWorld中，并用一个void* 去拿到这个body的引用。
		- 碰撞体：将大小偏移什么的也都传进去，还有一些碰撞参数
	- 停止：即删除physicsWorld，然后置为null
- 
- 启动、停止、步进功能。
- 友元：Entity，场景序列化器，场景层次显示界面


- SceneCamera：正交、透视、投影矩阵计算（目前只做了正交相机
	- glm本身就有正交和透视的计算函数。


- SceneSerialize场景序列化：利用YAML库，存储为Node。
	- 各种解码和编码，输出流重载：vec2，vec3，vec4，UUID，，刚体碰撞检测选项，
	- ECS实体组件序列化：首先序列化实体，然后轮询该entity下的**所有类型组件**。
		- 注意Script要用一个Field的东西，来存储序列化的字段
		- 部分字段可以用脏数据的形式存储
	- 序列化：遍历ECS注册表，重新加入
	- ECS实体组件反序列化：YAML库读文件转换成Node，再根据字段进行重新加载

- ScriptableEntity：脚本在C++上的代码
	- 提供析构
	- C#获取C++组件函数
	- 生命周期：Create、OnDestroy、OnUpdate。
	- 本质也是存储一个实体
	- 友元场景。

## 10.脚本C#与C++交互编程Scripting
- ScriptGlue：注册c#方法，注册能调用的C++静态函数，使得C#能够调用C++的函数。
	- 工具类：monoString转C++ string。
	- 一个静态哈希表：对应MonoType和对应带bool返回值的组件检查方法（需要注册）。
	- **C#调用C++**：可以被C#调用的一系列C++方法（**必须是静态**）:
		- **宏封装**：mono_add_internal_call注册函数， InternallCalls宏+#Name，Name来注册内部调用。
		- C++Log,hascomponent，Entity信息相关，脚本实例获取，
			- 获取组件：获取当前场景，UUID找到对应物体，
		- 一些组件方法：比如获取、设置C++的Transform的参数，刚体施加力和冲量，获取速度、刚体类型，文字组件信息等，按键查询
	- 注册组件RegisterComponents：
		- 采用模版参数包lambda展开，typeid识别类型信息获取对象名字，将其按照格生成对应的dl==l`Crydust.函数名`==的形式。然后`mono_reflection_type_from_name`获取根据**程序集和名称**拿到对应的**MonoType**指针（存储Mono运行时的元信息），
		- 如果存在MonoType，将**entity的Hascomponent**绑定到前面的哈希表里面，建立映射。
	- **判断持有组件HasComponent**：获取的时候也是根据反射信息参数 ==MonoReflectionType*==，去哈希表里查对应的调用函数指针，执行得到是否拥有组件。
	- 注册方法RegisterFunctions：用==mono_add_internal_call注册函数==将每个需要C#调用C++的方法都要根据名字和具体对象注册一遍。这个过程就是前面宏封装的调用.
- ScriptEngine的一些辅助工作：获取C#的元信息，实现C++调用C#。
	- **extern C**：确保消除函数签名的影响。
	- 字段Field：用于序列化显示值，枚举类型，文字，MonoClassField在mono的字段（可以用来修改值)。
		- 字段实例：预留16个8位空间buffer来存，记得初始化memset掉buffer。并提供一些获取、设置（如memcpy，可以做任意数据的拷贝）的接口。
		- 字段实例哈希表：存储字段实例，通过string来查找字段实例
	- ScriptClass：提供类的实例化，方法获取，以及函数触发的封装。以及当前类本身含有的string--字段哈希表（非实例）。
	- ScriptInstance脚本实例：由ScriptClass创建得来的产物
		- **存储**：Class，Mono对应的实例Object，构造、创建、更新的Method，字段缓冲。
		- 生命周期：oncreate，OnUpdate的调用。
		- 获取该对象的ScriptClass
		- 字段获取：从class里拿哈希表，传字符串，从Mono处获取，返回字符缓冲区
		- 字符设置：从class里拿哈希表，通过mono设置
	- 获取字段当前所在的物体：类似于unity的gameObject
- 真正的ScriptEngine：生成，加载程序集，
	- 提供修改重载，按键重载功能：
	- 脚本的运行时和暂停控制
	- 创建更新实体，实体类存储。
	- 当前场景
	- 脚本的实例、类获取，类生成。
	- 创建C#的字符串MonoString
	- 文件监视：主要就是通过文件监视库检测，并将重载事件**提交给主线程**
	- 数据构成：
		- Mono环境：RootDomain，AppDomain，核心程序集，核心程序集image，AppAssembly，AppAssemblyImage，CoreAssemblyFilepath，AppAssemblyFilepath
		- 脚本集合：名称-脚本类的哈希表
		- **根引用集合**：UUID-脚本实例的组件实体哈希表
		- 实体字段集合：UUID--脚本实体字段实例哈希表
		- 场景上下文：当前场景
		- 文件监视：
		- DEBUG开关 

MonoDomian：
	RootDomain加载JIT、GC、线程池等核心组件爱你
	APPDomain是 ​**​用户代码的隔离容器​**​，加载程序集和执行托管代码。
- CoreAssembly是什么：**核心程序集**，确保其​**​依赖项完整解析**，不支持**热重载**
- AppAssembly是什么：**应用脚本**，依赖**核心库**，支持**热重载**。

这里详细讲讲过程：
1. MonoAssemblyLoad程序加载：
	- 从路径加载文程序集，拿到MonoImage（所有元数据和IL)。
	- 调试信息：如果要加载，从Image读取到pbd文件进行缓存
	- 程序集加载：从image里再次加载出MonoAssembly。

2. 核心程序集加载：
	- 创建Appdomain，打开它。然后通过根据路径先加载出CoreAssembly，保存元数据到Image
3. MonoInit：
	- 初始化RootDamain，开启调试
4. AppAssembly加载：
	- 不需要再加载AppDomain，根据路径加载出AppAssembly后，保存元数据到Image。添加**文件监视**。 
5. Mono类加载：
	- 情况之前的Class缓存
	- 先从image获取所有MonoTableInfo程序集的类型定义表信息总数
	- 获取基准类Entitiy（类似于Unity的Object），开始遍历类型总数
		- 所有类型，解码元数据行，从元数据堆里获取类名和命名空间
		- 将类名和命名空间构建成完整类名，再去获取赌赢的MonoClass对象（跳过基准类）
		- 检查其是否是Entity，跳过。
		- 检查其是否是Entity的**派生类**，创建脚本包装器并缓存到C++里。
		- 最后遍历字段，将字段也存到C++里面（这里细节就不详细赘述了）。
6. Init：
	- MonoInit、注册方法、加载AppDomain、加载核心程序集、加载应用程序集、然后加载所有Mono的类，最后注册组件，最后生成基准类**Entity**。
7. Unload：卸载AppDomain和RootDomain就行了，最后再卸载C++的数据
8. 热重载：
	- Mono无法单独卸载掉某个程序集，但是可以卸载掉整个AppDomain，然后再重新加载核心程序集和应用程序集。
	- 调用ScriptGlue注册组件，获取并实例化出C#的Entity类。
9. 热重载的添加：将重载方法**提交给主线程**进行热重载任务的等待
	- 按R重载：
	- 文件监视重载：轮询检查
10. Mono实例化类：传入MonoClass，在Mono环境中init。
11. 调用方法：传入MonoObject、MonoMethod，`void**`指代的参数，Invoke就行。
12.  Entity的生命周期 
	- InvokeOnCreate：如果脚本有绑定创建的方法，就执行对应的MonoMethod
	- InvokeOnUpdate：如果脚本有绑定更新的方法，就执行对应的MonoMethod
13. 获取C#方法：由于C#并没有静态多态的机制，那么就需要通过**参数名+参数数量**获取方法。
14. 
15. C++脚本实例化：
	1. 先去将Mono对应的类实例化，
	2. 然后拿到构造、OnCreate、OnUpdate函数，等待后续执行。
	3. Invoke执行构造
16. UI


## 11.UI
ScopedStyleColor：ImGui的颜色设置

## 12.Utils
PlatformUtils：平台工具，基类，具体交给平台实现
- 打开文件、保存文件














- 程序集文件监视重载：Application添加主线程方法队列，**记得上锁**


# 平台层
引擎层RHI和平台提供的一些接口，需要在这个位置进行实现，基本上都是引擎层的**基类的一些派生**
- OpenGL：
	- Bufffer：VBO，EBO（IndexBuffer）
	- FrameBuffer：做帧缓冲，深度模版纹理，纹理拾取
	- Context：渲染上下文，保存当前窗口，提供创建和双缓冲的接口。
	- RendererAPI：渲染初始化，设置视口，设置清屏，绘制命令，设置线宽、
	- Shader：着色器程序：Int、Float、Mat4等各种数据的设置，Unitform变量上传，SPIR-V编译出GLSL，Shader获取，创建着色器编译程序，Shader信息反射。绑定、解绑。着色器代码缓存，SPIR-V缓存存储。
	- Texture：纹理格式选择：纹理，宽、高设置、数据（数组）设置，加载判断，绑定
	- UniformBuffer:仅设置
	- VertexArray: 顶点数组，VAO处理，步长等设置，EBO（IndexBuffer）的设置。

- Windows：窗口、平台工具、输入检测

# 其他
- cdpch.h预编译头
- CryDust.h 引擎层接口。

# 脚本层-核心程序集
定义C#、C++交互方式，定义基础变量和类
- C#调用C++--**核心InternalCalls**：`[MethodImplAttribute(MethodImplOptions.InternalCall)]`的属性设置，Internal、extern、static的修饰，确保封装性和函数内部可调用。基础变量和类再去获取其中这些internal，最后才能被外部调用
- EC结构：
	- Entity：一些获取、设置实体的方法，Transform相关的设置，组件的获取设置
	- Component：定义一些派生类如transform的组件，其属性都是通过InternalCall获取和设置

- KeyCode绑定：按键枚举，和C++一直，用于判断按键
- Input：按键检测
- Vector系列：这些就是底层数学库定义，不需要去InternalCall
	- Vector2：
	- Vector3
	- Vector4