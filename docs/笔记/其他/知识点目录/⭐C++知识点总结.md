随着知识点越来越多，记忆难免会混乱、遗忘，一个好的知识点总结能有效帮助回忆。

# 1.⭐⭐⭐多态
概念
## 静态绑定
- 重载定义？特点? 函数签名？模版泛型？
- （继承中）隐藏特点？隐藏后调用基类？
- 调用虚函数的静态绑定？
## 虚函数
- 继承构造出多态的两个条件？this的隐式多态？ 虚函数重写条件？两个例外（协变和析构）？
- 析构为什么需要虚函数？什么是指针的切割？
- 接口继承，实现重写?override和final的作用？
- 虚表指针vptr：数量，大小，产生时机，类型
- 虚表vtbl：和类对应的关系，数量，位置，存储内容（RTTI，函数指针），虚函数存放(重写和未重写？)？数组最后？
- 纯虚函数？抽象类？有啥不同？
- 虚继承内存排布？多继承重写的三个虚函数地址？未重写的虚函数的地址？菱形继承内存模型？
-  虚基表：虚基表指针，虚表内存模型改变，偏移量，多份
- 构造和析构中调用虚函数调用情况：存储角度、实用角度，调用后的情况
- 虚函数非动态绑定机制
- 虚函数能否内联：编译时（理论，实践），运行时（加final？）。
- 派生类为什么不能调用基类？


# 2.⭐⭐⭐ 智能指针
- 深拷贝、浅拷贝、野指针、悬空指针
- 四大智能指针以及作用原理
- 代码实现（尽量能讲STL源码）
- RAII设计思想
- shared_ptr循环引用解决：weak，鸵鸟策略，以及(啥来着突然忘了)..
- （进阶）unique_ptr实现，shared_ptr 实现
- （了解）智能指针发展历程
- （补充）其他库的智能指针，比如chrono库的计时指针...
- （补充）一个引擎如何将智能指针改成自己的指针：别名功能，符号重构

# 2.⭐⭐⭐ new/delete、malloc/free
- 什么时候delete this？成员函数delete this的后果？

# 2.⭐⭐⭐ STL数据结构
# 3.⭐⭐左值右值，移动构造


# 4.⭐⭐RTTI与类型转换

# 4.⭐⭐函数调用过程
# 5.⭐Lambda

# 6.⭐内联函数和宏
# 7.⭐内存分配

# 7.⭐内存对齐


# 8.⭐const

# 8.⭐指针和引用区别
- 返回值
- 传参

# 8.⭐内存泄漏的定位
# 9.auto和decltype

# 10.（进阶）STL Allocator 设计

# 11.（进阶）STL sort实现

# 12. emplace_back设计思想

# 13.友元函数，友元类



