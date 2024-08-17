# 条款05：了解C++默默编写并调用哪些函数？
* 如果empty class没有声明，C++会默认声明**default构造、copy构造、copy assignment操作符、析构函数**,并且他们都是**public且inline**的。
	* 只有被调用时，它们才会被创建出来
	* 注意：编译器产生的析构函数是**non-virtual**的
	* 代码不合法，会拒绝生出**operator=**。比如类的成员是一个引用，而**operator=** 不可能拷贝**引用**。此外，**const的赋值**也是一个典型的例子。c++会**拒绝编译**

# 条款06：若不想使用编译器自动生成的函数，就应该明确拒绝
* 在**private里自行声明**来拒绝其创建，这一操作被实现于iostream中
	* **借明确声明，防止自行创建。借private，防止调用**
	* 并不绝对安全，**member**和**friend**函数可以调用你的private函数。
	* 可以**只声明不实现**不用写函数名称，毕竟不会使用。这样函数没实现就调用会获得一个**连接错误**（**linkage error**）
	* 可以根据这个规则构造一个`Uncopyable`类用来被继承，**包括不一定用public继承，且该类析构函数不一定需要virtual**,但有时候可能会产生多重继承
```c++
class
{
public：
private：
	HomeForScale(const HomeForSale&);
}

```
# 条款07：为多态基类声明virtual析构函数
>析构运作方式：从**最深层派生（most derived）**逐级向其base class调用析构
* 直接继承，通过**base class接口处理derived class**对象时，delete/析构时可能只会销毁base，不销毁derived的新增部分。导致局部销毁，资源**内存泄露**
* 如果不含virtual函数，通常表示它并不意图被用做一个base class，virtual析构便没有什么意义。（这会**徒增内存**）
* 抽象类一般都作为base class，所以声明一个**pure virtual**纯虚的析构函数是有必要的
* 
```c++
class AWOV{
public:
	virtual ~AWOV = 0;
}
```

# 条款08：别让异常逃离析构函数（感觉用不到，先跳过）
* 如果析构有异常，多个相同对象析构被调用的太快，会导致**同时出现多个异常**，导致程序结束执行或者不明确行为。
* 那么如何设计异常？
	* close抛出异常就结束程序。通常通过调用**abort()**完成
	  ```c++
	  DBConn::~DBconn
	  {
		  try{db.close()};
		  catch(...)
			  制作运转记录，记下对close的调用失败;
			  std:abort();
	  }
	  
		```
	* 或者直接吞掉
* 上面两个方法都不太好，选择。。。

## 条款09：绝不在构造和析构中调用virtual
* base的构造函数调用期间，**virtual函数绝对不会下降到derived  class**，会通向不明确的行为。 
* 析构也一样，derived class的析构开始执行时，对象内的成员变量便呈现未定义值。进入base class后就会变成一个base class对象。

# 条款10：令`operator=` 返回一个reference to * this(连锁赋值)--协议，并非强制
* 如何实现连锁赋值 x = y = z =15?
```c++
Widget& operator=(const Widget& rhs)
{

	...
	return* this;
};
...
```
* 该规则同样适用于`*= += -=`等

# 条款11：在 operator= 中处理“自我赋值”
* 正常是w=w
* 但有时候会有潜在的自我赋值比如`a[i] = a[j]`,`*px = *py`,`Base& rb,Derived* pd`
* 添加**证同测试(identity test)**，自我赋值时，不做任何事.(缺乏异常安全性,new出问题了，可能导致返回一块被删除的类)
	* 且**测试需要成本**（代码变大，新的控制流分支），需要平衡大小和效率。
```c++
Widget& Widget::operator= (const Widget& rhs)
{
	if(this == &rhs) return *this;//证同测试

	delete pb;
	pb = new Bitmap(*rhs.pb);
	return *this;
}
```
* **异常安全性**的做法：
```c++
Widget& Widget::operator= (const Widget& rhs)
{
	Bitmap* pOrig = pb;
	pb = new Bitmap(*rhs.pb);
	delete pOrig;
	return *this;
}

```
* pass by value的一个高效代码（但不清晰）
```c++
Widget& Widget::operator= (Widget rhs)
{
	swap(rhs);
	return *this;
}
```
# 条款12：copying复制对象勿忘其每一个成分
* **复制所有local**：新增变量时，往往会遗漏。
* **调用所有base classes内的适当的copying函数**。继承时，确保derived class实现base class 的函数。否则会导致base的成员无法复制。
* 
