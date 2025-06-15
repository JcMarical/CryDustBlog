# 一、class 和 struct 本身成员的默认访问级别不同

**这是最本质的区别**，结构体的成员和成员函数在默认情况下的访问级别是**公有的（public）**，类的成员和成员函数在默认情况下的访问级别是**私有的（private）**。

B 继承 A，若 A 没有指定权限，则 B 不能进行构造
![[Pasted image 20240405014408.png]]

#### 二、class 和 struct 继承类的默认访问级别不同

简单来说就是，
结构体常见的继承方式 `struct A｛ char a;｝; struct B: A{char b;};`，这里结构体 B 是 A 的公有继承，即基类中所有 public 成员在派生类中为 public 属性；结构体外的函数调用时可使用 B.a 进行访问。

但如果将上面一句代码中 struct 改成 class，那么**类 B 就是 A 的私有继承，即基类中的所有 public 成员在派生类中均为 private 属性**；类外的函数调用时无法通过 B.a 进行访问。这就是 class 与 struct 在继承中默认访问权限的区别，如果在类中**想将类 B 写成 A 的公有继承，需要改写为 `class B：public A`。**

![[Pasted image 20240322160542.png]]
