>  like a promise，but can be broken --Cherno
# 前言
在学习C++的时候看过不少教程，但很难有把一个知识点完全讲透的。比如Cherno的C++会告诉你怎么去用How，而侯捷的C++会告诉你Why，但并没有完全把某个知识点讲干净。因此，该专栏用于记录和分享笔者在学习C++过程中遇到并在网上整理集合的知识点，并讲清楚How与Why，希望这些能对大家带来帮助。如有疑问和遗漏，也欢迎大家进行修正与补充。

# 常量
一般默认const是**必须赋值**的，使用const直接修饰变量，以下两种定义形式在本质上是一样的。此时，该变量变为了常量，在定义了之后**无法对值进行修改**。
```c++
const int MAX_IMAGE = 90;
int const  MAX_IMAGE = 90;
```
## extend全局常量声明
将const改为外部连接,作用于扩大至全局,编译时**会分配内存**,此时可以**不初始化**,而只是**声明**,编译器认为在程序其他地方进行了定义，该常量可以从其他地方获取

```c++
  extend const int ValueName = value;
```
## 强制转换
Const类型转化为非Const类型的方法可以采用const_cast 进行强制转换。
```c++
const_cast <type_id>  (expression);
```
## 指针修改常量

C++可以通过强大的指针进行修改，下面的代码就是通过指针去修改常量的值。
```c++
const in MAX_IMAGE = 90;

int* a = new int;
a = (int*)&MAX_IMAGE; //可能会崩溃，但是实际上可以工作
*a = 2;

cout << *a <<" " << MAX_IMAGE;
```
最后输出的结果为
```c++
2 99
```
可以看到，常量的值被修改了。可为什么输出MAX_IMAGE的时候还是99？

看到网上的一个回答：

> 编译器在这里耍了一个小聪明，在**编译**的时候自动把const类型的变量替换成了字面数值了。所以输出那行实际上被改写成了
```text
std::cout << *a << " " << 90 << std::endl;
```
因此，输出的还是99,但实际上常量的值已经被修改为2了


## reference to const 对常量的引用
```c++
const int ci =1024;
const int &1 =ci;

int i = 42;
const int &r1 = i;//可以绑定，但是不可以通过R1修改i的值
const int &r2 = 42;
const int &r3 = r1*2;
int &r4 = r1* 2;//Error!

```
下面这个是可行的：
```c++
double dval = 3.14;
const int &ri = dval;
```

对与非常量的引用，编译器实际上做了这样的处理：
```c++
const int temp = dval;
const int & ri = temp;
```

# 常量与指针
>const的位置不同，修饰的东西也不同，我们需要牢记并区分常量的各种位置及其用法。与指针相关的常量一般会有下面的三种用法。

```c++
const int* a = new int;
int* const a = new int;
const int* const a = new int;
```
## 常量指针（指向常量的指针） const to pointer
> 不能改变指针指向的内容
```c++
const in MAX_IMAGE = 90;
const int* a = new int;


// *a =2; 
//这里会报错，不允许改变*a的值，即指针指向的内容

//但是可以改变a的内容。
a = (int*)&MAX_AGE; 

```
## 指针常量 pointer const
> CPP primer把这个叫做指针常量
```c++
const in MAX_IMAGE = 90;
int* const a = new int;//

*a =2;//可以改变指针的值

//a = (int*)&MAX_AGE; 
//这里会报错，不允许改变a的值,即指针指向的方向
//a = nullptr 
//同样，报错

```
## 合并使用(指向常量的常量指针)
```c++
const int MAX_AGE = 90;
const int* const a = new int;

//这样下面都会报错
//*a = 2;
//a = (int*)&MAX_AGE;
//a = nullptr;
```

# 常量与函数设计
## 常量成员函数 const member functions

在成员函数后加const，意味着该方法不会对**成员变量**造成影响
```c++
class Entity
{
private:
	int m_X，m_Y;
public:
	int  GetX() const
	{
		return m_X;//该方法并没有对成员变量产生修改
	}

	//因为修改了成员变量，该方法不能使用const
		void SetX(int x) /*const*/
	{
		m_X = x;
	}

}

```

## 成员变量为指针
> 这里体现了三种const位置的使用
```c++
class Entity
{
private:
	int* m_X，*m_Y;
public:
	//这意味着：
	//我们返回了一个指针不能变，指向地址不能变的值，且该成员函数不会被修改
	const int* const GetX() const
	{
		return m_X;//该方法并没有对成员变量产生修改
	}

}
```

---
接下来我们根据第一个Entity类进行函数设计
## 指针设计 Const Pointer
对于参数传进来的是指针的函数
* 先来看看普通的函数
```c++
void PrintEntity(Entity* e)
{
	*e = Entity();//可以修改指针指向的值
	e = nullptr;//可以修改指针本身的地址
	std::cout << e->GetX() << std::endl;
}
```

* **常量指针**：我们可以修改它指向的**方向**,即指针**本身的地址**。但不能修改指针指向的值
```c++
void PrintEntity(const Entity* e)
{
	//*e = Entity();不可以修改指针指向的值
	e = nullptr;
	std::cout << e->GetX() << std::endl;
}

``` 
* **指针常量**：可以改值不能改地址

```c++
void PrintEntity(const Entity* e)
{
	*e = Entity();
	//e = nullptr;不可以修改指针地址
	std::cout << e->GetX() << std::endl;
}
```
## 常量引用 Const Reference
 对于函数传进来的常量引用参数来说
这个e是常量，**不能将它重新赋值**。
不过这里没有指针本身和指针指向内容的区别了，因为**引用即内容**，所以也不用考虑指针的问题。
```c++
void PrintEntity(const Entity& e)
{
	//e = Entity(); 不能修改引用
	std::cout << e.GetX() << std::endl;
}
```

# 常量与面向对象设计
> 我们使用方法的时候一般是不修改类的，类的设计者应该在设计之初就设计好正确的类来交给其他人使用，而不是遇到错误再去修改。

假设我们把Entity类的const去掉,我们的引用就无法获取到GetX()。因为我们已经不能保证这个GetX会不会使Entity类修改了。如果类成员变量被修改，就意味着违反了const的设计原则。
```c++
class Entity
{
private:
	int m_X，m_Y;
public:
	int GetX() 
	{
		return m_X;//该方法并没有对成员变量产生修改
	}

	//因为修改了成员变量，该方法不能使用const
		void SetX(int x) /*const*/
	{
		m_X = x;
	}

}

void PrintEntity(const Entity& e)
{
	//e = Entity();
	std::cout << e.GetX() << std::endl;//Error!!!程序报错！！
}

```

所以有时候我们会看到这种形式的函数。
>这种情况下，就会分不同类型进行调用了。
```c++
class Entity
{
	private:
		int m_X，m_Y;
	public:
		int GetX() const
		{
			return m_X;//该方法并没有对成员变量产生修改
		}

		//当然，这段完全可以不加
		int GetX()
		{
			return m_X;
		}
	
		//因为修改了成员变量，该方法不能使用const
		void SetX(int x) /*const*/
		{
			m_X = x;
		}
	
	}


	void PrintEntity(const Entity& e)
	{
		//e = Entity();
		std::cout << e.GetX() << std::endl;
	}
```
类的设计者如果一开始没有设计const，则需要补上一个const的成员函数。但是实际上，只要我们一开始设计的时候就使用了const，便不会发生这种问题。

因为无论是常量引用，还是非常量引用，常量指针还是非常量指针，都可以**调用常量成员函数**！！！

侯捷老师在面向对象的设计上也讲过这一点，这里放个图供大家记忆：
![[Pasted image 20240318195858.png]]
# C11-constexpr 和 常量表达式
* **定义：值不会改变并且在编译过程中就能得到计算结果的表达式**
```c++
const int max_files = 20;
const int limit = max_files + 1;

const int sz = get_size();//不是常量表达式
```
## C11 constexper 使用
```c++
constexpr int mf = 20;
constexpr int limit = mf+1;
constexpr int sz = size();//当且仅当size是一个constexpr函数时，才是一条正确的声明语句。
```
## 指针和constexpr
声明constexpr时用到的类型为**字面值类型**。因此一个constexpr指针的初始值必须是：
* nullptr或0；
* 或一个存储于某个固定地址的对象。
此外，限定符constexpr**仅对指针有效**，与指针所指**对象无关**
```c++
	const int *p = nullptr;  //p是一个指向整型变量的指针(常量指针)
	constexpr int *q = nullptr; //q是一个指向整数的指针常量（C++ Primer说的是常量指针，定义不太一样）

```
# mutable使用
> 为什么开头说const只是一种promise（承诺），但是又可以break（打破）呢？

这就不得不提到这个比较让人感觉到无语的关键字`multiple`,他的**优先级**会高于const，当我们声明mutable的变量后，**该变量是可以在const函数中改变的**！！！

> OMG,那为啥要整const函数啊啊啊？

笔者猜测的是由于后续修改的时候，又不得不在某个函数修改一些变量，所以整了个这个关键字。

好了，话不多说，上代码：
```c++
class Entity
{
private:
	int m_X，m_Y;
	mutable int var;
public:
	int GetX() const
	{
		var = 2;//此时，可以改变var值
		return m_X;//该方法并没有对成员变量产生修改
	} 

	//因为修改了成员变量，该方法不能使用const
	void SetX(int x) /*const*/
	{
		m_X = x;
	}

}


	void PrintEntity(const Entity& e)
	{
		//e = Entity();
		std::cout << e.GetX() << std::endl;//Error!!!因为我们
	}
```

# const使用原则
* 大胆使用const，只要你能搞清楚为什么要用，那么能用则用。设计类时，任何不会修改数据成员的函数都应该声明为const 类型
* **参数**中使用const应该使用**引用或指针**，而不是一般的对象实例
*  const在成员函数中的三种用法（参数、返回值、函数）要很好的使用，但不要不要轻易的将函数的返回值类型定为const（除了重载操作符外一般不要将返回值类型定为对某个对象的const引用）


# Reference
* [关于C++ const 的全面总结_const c++-CSDN博客](https://blog.csdn.net/eric_jo/article/details/4138548)
* [【34】【Cherno C++】【中字】C++中的CONST_哔哩哔哩_bilibili](https://www.bilibili.com/video/BV1qy4y1e7ds/?spm_id_from=333.788&vd_source=6244aa070a169733971e833c530f4296)
* [高清 1080P C++面向对象高级编程（侯捷） P33 19 1 关于Dynamic Binding (youtube.com)](https://www.youtube.com/watch?v=WWbYbcIhtUI&list=PL-X74YXt4LVZ137kKM5dNfCIC4tsScerb&index=32)