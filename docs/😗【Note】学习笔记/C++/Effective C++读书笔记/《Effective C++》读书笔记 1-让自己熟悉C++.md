## 条款 01：视 C++为一个语言联邦
守则随状况而变化。
次语言：
- C
- Object-Oriented C++
- TemplateC++
- STL
## 条款 02：尽量以 Const，enum，inline 替换#define（编译器替代预处理器）

### define 的坏处：
- 编译错误可能只会追溯到 1.653，AESPECT_RATIO 不会记录到符号表中。
- 缺乏访问级
- 要打很多括号->inline 设计
```
#define AESPECT_RATIO 1.653
```
const：
```c++
const double  AspectRadio = 1.653;
const char* const authorName = "Scott Meyers"
const std::string authorName("Scott Meyers");
```

类的 cosnt 声明：
- 确保次常量至多只有一份，必须成为**static**
- 类中只是声明式子，有些编译器可能需要写一个定义式
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
- enum 实质上就是 ints
- 取地址不合法，更像 define
- 和 define 一样绝对不会导致内存的分配（即被 pointer 和 Reference 指）
```c++
class GamePlayer{
private:
    enum{ NumTurns = 5};
    int scores[NumTurns];
    
}
```

## 条款 03：尽可能使用 const
- 星号左边，被指数为常量
- 星号右边，指针本身是常量
- **最具威力的用法**：函数声明
    - const/non-const 成员函数声明（）
    - 防止暴力赋值...暴行...给乘积赋值
  ```c++
  (a * b) = c;
```

## 条款 04：尽可能让对象被使用前初始化
- 某些条件下不会赋值 0，而是随机数，这会导致错误
- 注意**初始化**和**赋值**的区别：
    - 初始化发生的更早，发生于 default 构造函数被自动调用之前
    - 通常使用**初值列**copy 会高效一些、
    - 内置型对象如 int，成本相同，但**尽量保持一致性**。
    - 且一些内置型**如 const，References 必须使用初值**，不能被赋值
- **初值列**按照**严格的成员声明次序**进行，注意**不是初值列次序**
### non-local static 对象的初始化
- 指 global、namespace、class、file 中的 static
- non_local static 使用其他的 non_local static 初始化，可能未定义
- extern 声明的变量，如何确定初始化？
*
- 方法：将 non-local static 的对象搬到自己的专属函数内，即**转化为 local static**，返回一个 reference 指向它所含的对象，这便是这**单例模式**
    - **线程安全**：在多线程系统中带有不确定性。
    - 解决方法：单线程启动阶段调用所有与 reference-returning 函数，
