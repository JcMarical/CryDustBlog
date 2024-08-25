# 一、class和struct 本身成员的默认访问级别不同

**这是最本质的区别**，结构体的成员和成员函数在默认情况下的访问级别是**公有的（public）**，类的成员和成员函数在默认情况下的访问级别是**私有的（private）**。

B继承A，若A没有指定权限，则B不能进行构造
![[Pasted image 20240405014408.png]]

#### 二、class和struct 继承类的默认访问级别不同

简单来说就是，  
结构体常见的继承方式 `struct A｛ char a;｝; struct B:A{char b;};`，这里结构体B是A的公有继承，即基类中所有public成员在派生类中为public属性；结构体外的函数调用时可使用B.a 进行访问。

但如果将上面一句代码中struct改成class，那么**类B就是A的私有继承，即基类中的所有public成员在派生类中均为private属性**；类外的函数调用时无法通过B.a进行访问。这就是class与struct在继承中默认访问权限的区别，如果在类中**想将类B写成A的公有继承，需要改写为 `class B：public A`。**



![[Pasted image 20240322160542.png]]
