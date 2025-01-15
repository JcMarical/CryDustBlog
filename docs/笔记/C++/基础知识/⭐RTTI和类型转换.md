- C 语言强转问题？
- 强制转换原因：编译时检查
- 检查失败：引用和指针的区别（空引用和异常）？
- RTTI：typeid，type_info 及其在虚表中的位置？dynamic_cast;
- static_cast:不提供什么检查？安全性如何？
- dynamic_cast?什么检查？什么是向下转换？返回值？如何实现，存储什么信息？继承都可以正确实现转换么？转成 void*？菱形继承的向上转换？
- const_cast:常量转换为非常（引用/值/指针）？
- reinterpret_cast:问题？

为什么 C++要进行特别的类型转换，因为方便编译器增加**编译时检查**，告诉我们什么转换是无效的，使得代码更可靠。
# RTTI(Runtime type identification)运行时类型检查
- type_info：结果储存类的信息。运行时使用类型信息就叫做“run-time type identification”, 即 RTTI。
- typeid()：返回一个指出对象的类型的值；
如果有虚函数;
```c++
Derived *p = new Derived();//输出derived
Base *pp = new Derived();//输出的还是derived(如果有虚函数)
Base *ppp = dynamic_cast<Base>(p);//打印出来的就是Base
std::string aa = typeid(*pp).name();
```
- 虚函数去除掉？
```c++
Base *pp = new Derived();//输出的是Base
std::string aa= typrid(*pp).name();

```
展示的就是 Base 函数（没有虚映射了）
- 因此，可以根据 typeid 来判断是否是虚函数
```c++
if(typeid(pp) == typeid(Derived))
{
        
}
```
- 向下转型：（安全判定，返回 NULL 指针）
```c++
Derived *pppp = pp;//会报错，显示有问题
Derived *pppp = dynamic_cast<Derived*>(pp);//这样就会返回一个强转失败的NULL指针。，比较安全
```
# 1.C 语言风格的隐式转换和强制转换
转换过程
```c++

int 
```

强制转换：
```c
int a = (int)value; 
```
# 2.static_cast<>静态类型转换
**任何编写程序时能够明确的类型转换**都可以使用 static_cast（static_cast 不能转换掉底层 const，volatile 和__unaligned 属性）。由于**不提供运行时的检查**，所以叫 static_cast，因此，需要在编写程序时确认转换的安全性。
**安全转换**方式：
- 用于基本数据类型之间的转换，例如把 int 转 char，int 转 enum 等，需要编写程序时来确认安全性；

```c++
double s = static_cast<int>(value) + 5.3;        
```

**不安全转换方式**，推荐 dynamic_cast<>
1.向下转换，
2.把 void 指针转换成目标类型的指针（这是极其不安全的）；
```
void *p = &d;
double *dp = static_cast<double*>(p);
```

# 3.dynamic_cast<>
## 向下转换
- 用于沿继承结构的强制转换，子类转基类指针(可以不用强转，能隐式转换)，基类转子类指针。
- 进行**运行时检查**，如果转换不成功，可能返回 NULL，其更像一个函数（值类型返回为 0）
- 因此常用于**验证**，如果是实体，可以转换为玩家。如果其是个**实体指针**，玩家不知道它是**敌人还是实体类**，那么转换到玩家就会报错。
- 如果使用 C 风格（Player*）告知编译器，则**不会编译出错**。然而，其本身可能是 Enemy，是无法转换到 Player 的，此时程序可能会**崩溃**。而使用 `dynamic<cast>` 便可以在转换不成功时返回 NULL。
- 如何做到的？：RTTI，使用 runtime type information 存储信息，会增加内存

```c++
class Base
{

}

class Derived : Base
{

}

class AnotherClass : Base
{

}

int main()
{
    Derived* derived = new Derived();
    Base* base = derived;//不会编译错误 
    AnotherClass* ac = dynamic_cast<AnotherClass*>(base);
    //返回NULL，因为无法正常转换
    Derived* de = dynamic_cast<AnotherClass*>(base);
    //成功
}
```
## void* 转换

一些情况下，我们需要将指针转换为 void*，然后再合适的时候重新将 void *转换为目标类型指针。
```cpp
class A { virtual void f(){} };
int main()
{
     A *pA = new A;
     void *pV = dynamic_cast<void *>(pA); 
}
```

## 菱形继承的上行转换
直觉来说是可以的，因为从子类向父类转化，无论如何都是安全的。但实际上，如果尝试这样的转换，**只能得到一个空指针**。因为 B 和 C 都继承了 A，并且都实现了虚函数 f()，导致在进行转换时，**无法选择一条转换路径**。

一种可行的方法是，自行指定一条转换路径：

```cpp
class A { virtual void f() {}; };
class B :public A { void f() {}; };
class C :public A { void f() {}; };
class D :public B, public C { void f() {}; };

void main()
{
    D *pD = new D;
    B *pB = dynamic_cast<B *>(pD);
    A *pA = dynamic_cast<A *>(pB);
}
```

# 4.const_cast<> 去掉常量的 const

## **const_cast**

const_cast 用于移除类型的**const、volatile 和__unaligned **属性。

常量指针被转换成非常量指针，并且仍然指向原来的对象；常量引用被转换成非常量引用，并且仍然引用原来的对象。

```cpp
const char *pc;
char *p = const_cast<char*>(pc);
```

# 5.  **reinterpret_cast** 非常激进的指针类型转换

非常激进的指针类型转换，在编译期完成，可以转换任何类型的指针，所以极不安全。非极端情况不要使用。

```cpp
int *ip;
char *pc = reinterpret_cast<char*>(ip);
```
