# 1. 数据类型所占内存大小
整理重点：
- char 都是 1
- short 都是 2
- int 4.
- long int/long：4，  8
- 指针 32 位 4，64 位 8
比较需要注意的几个点：
- 求数组大小时，如果**数组**作为**参数传递时，退化为指针**，所以 sizeof(arr)大小为该系统下指针的大小
- 求 s**truct 或者 class** 的大小时候，除了基本的数据类型大小，特别要考虑的是**字节对齐问题**，如果是 C++的还涉及**虚函数的虚表问题**，需要加上**虚表指针的大小**。
- 对于 C 字符串，需要牢记 C/C++中一个**汉字占两个字节(Linux 下 3 个字节)*
- `*char 类型++` ，地址**移动一个字节**，而 `*int++`，地址**移动 4(8)个字节**
```

|                         |     |     |                                                              |
| ----------------------- | --- | --- | ------------------------------------------------------------ |
| 数据类型                    | 32位 | 64位 | 取值范围（32位）                                                    |
| char                    | 1   | 1   | -128~127                                                     |
| unsigned char(当byte使用)  | 1   | 1   | 0~255                                                        |
| short int /short        | 2   | 2   | –32,768~32,767                                               |
| unsigned  short         | 2   | 2   | 0~65,535                                                     |
| int                     | 4   | 4   | -2,147,483,648~2,147,483,647                                 |
| unsigned int            | 4   | 4   | 0~4,294,967,295                                              |
| long int /long          | 4   | 8   | –2,147,483,648~2,147,483,647                                 |
| unsigned long           | 4   | 8   | 0~4,294,967,295                                              |
| long long int/long long | 8   | 8   | -9,223,372,036,854,775,808<br><br>~9,223,372,036,854,775,807 |
| 指针                      | 4   | 8   |                                                              |
| float                   | 4   | 4   | 3.4E +/- 38 (7 digits)                                       |
| double                  | 8   | 8   | 1.7E +/- 308 (15 digits)                                     |

# 2.内存对齐

## 有效对其值，pragama pack(n);
每个特定平台上的编译器都有自己的默认“对齐系数”（也叫对齐模数）。gcc中默认#pragma pack(4)，可以通过预编译命令#pragma pack(n)，n = 1,2,4,8,16来改变这一系数。

**有效对其值**：是给定值#pragma pack(n)和结构体中最长数据类型长度中较小的那个。有效对齐值也叫**对齐单位**。

(1) 结构体第一个成员的**偏移量（offset）为0，以后每个成员相对于结构体首地址的 offset 都是**该成员大小与有效对齐值中较小那个**的整数倍，如有需要编译器会在成员之间加上填充字节。

(3) **结构体的总大小**为 有效对齐值 的**整数倍**，如有需要编译器会在最末一个成员之后加上填充字节。
## C 的 _Alignof 和 C++ 的 alignof 可以获得类型的对齐。

## 类
* 空类 = 1；
```c++
class C
{

}
```
2，类的虚函数=4(因为指针指向虚函数表)，不管多少都是 4
3，类的普通数据成员按结构体对齐
4 类的静态成员不算入内
5 类的普通函数=0
6 普通继承=父类数据成员大小+子类数据成员大小
7 类的虚继承=父类数据成员大小+子类数据成员大小+4
##  **联合体**
联合体两点要求
(1)必须能容纳最大成员内存
(2)是成员内存最大类型的整数倍

```cpp
union s
{
    int a;//最大成员类型 4
    char b[11];//最大成员内存 12
    short c;
};//总=12
int main()
{
    s s1;
    cout << sizeof(s1);
}
```

## 枚举体 Enum
因为枚举体存放的就是 int 类型=4

```cpp
enum s
{
    a = 1,
    b = 324237472342,
    c=-111111111111111111,
    d=10000000000000000000
};
```

# 跨平台问题
解决跨平台内存对齐可能不统一的问题：**将可能将来被补齐的地方，在设计结构体时就进行填补**

下面这段代码在不同的平台上所占空间可能不同，数据传递或者解析就会按照不同内存大小进行处理，存在问题：

```cpp
struct P {
    char a;
    int b;
};
```

一些平台解析完会认为他占用 8 字节的空间，而一些可能不进行内存对齐的平台，会将数据按照 5 字节的大小进行解析，为了解决这个问题，我们可以将结构体定义成如下：

```cpp
struct P {
    char a;
    char c[3]; //do not use
    int b;
};
```
