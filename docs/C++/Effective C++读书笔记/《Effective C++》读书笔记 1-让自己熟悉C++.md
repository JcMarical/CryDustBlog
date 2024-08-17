## 条款01：视C++为一个语言联邦
守则随状况而变化。
次语言：
* C
* Object-Oriented C++
* TemplateC++
* STL
## 条款02：尽量以Const，enum，inline替换#define（编译器替代预处理器）

### define的坏处：
* 编译错误可能只会追溯到1.653，AESPECT_RATIO不会记录到符号表中。
* 缺乏访问级
* 要打很多括号->inline设计
```
#define AESPECT_RATIO 1.653
```
const：
```c++
const double  AspectRadio = 1.653;
const char* const authorName = "Scott Meyers"
const std::string authorName("Scott Meyers");
```


类的cosnt声明：
* 确保次常量至多只有一份，必须成为**static**
* 类中只是声明式子，有些编译器可能需要写一个定义式
```c++
//头文件
class GamePlayer{
private:
	static const int NumTurns = 5;//只是一个声明式子，而非定义式。
	int scores[NumTurns];
}

//实现文件
const int GamePlay::NumTurns;//定义式，不可以再设置初值
```
或
```c++
//头文件
class GamePlayer{
private:
	static const int NumTurns;//只是一个声明式子，而非定义式。
	int scores[NumTurns];
}

//实现文件
const int GamePlay::NumTurns=1.35;//定义式
```
enum hack：
* enum实质上就是ints
* 取地址不合法，更像define
* 和define一样绝对不会导致内存的分配（即被pointer和Reference指）
```c++
class GamePlayer{
private:
	enum{ NumTurns = 5};
	int scores[NumTurns];
	
}
```

## 条款03：尽可能使用const
* 星号左边，被指数为常量
* 星号右边，指针本身是常量
* **最具威力的用法**：函数声明
	* const/non-const成员函数声明（）
	* 防止暴力赋值...暴行...给乘积赋值
  ```c++
  (a * b) = c;
```

## 条款04：尽可能让对象被使用前初始化
* 某些条件下不会赋值0，而是随机数，这会导致错误
* 注意**初始化**和**赋值**的区别：
	* 初始化发生的更早，发生于default构造函数被自动调用之前
	* 通常使用**初值列**copy会高效一些、
	* 内置型对象如int，成本相同，但**尽量保持一致性**。
	* 且一些内置型**如const，References必须使用初值**，不能被赋值
* **初值列**按照**严格的成员声明次序**进行，注意**不是初值列次序**
### non-local static 对象的初始化
* 指global、namespace、class、file中的static
* non_local static使用其他的non_local static初始化，可能未定义
* extern声明的变量，如何确定初始化？
* 
* 方法：将non-local static的对象搬到自己的专属函数内，即**转化为local static**，返回一个reference指向它所含的对象，这便是这**单例模式**
	* **线程安全**：在多线程系统中带有不确定性。
	* 解决方法：单线程启动阶段调用所有与reference-returning函数，