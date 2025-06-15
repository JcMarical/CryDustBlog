# 1.继承自Ptr_base
![[Pasted image 20250222091857.png]]
干嘛的？
## ptr_base两个成员：
- Ptr：指向实际管理的对象
- Rep：指向控制块（包含引用计数、分配器等元数据）。
还有些友元类，可以供自己同类型的对象，子shared_Ptr对象，原子结构....直接调用私有变量。

![[Pasted image 20250222092356.png]]
## 删除拷贝构造与赋值构造

![[Pasted image 20250222093404.png]]

## 对象的删除（纯虚函数）
![[Pasted image 20250222094125.png]]
意识就是说智能指针的删除还得让子类自己来实现

## use_count引用计数
这个_Rep究竟怎么计数的？

![[Pasted image 20250222092758.png]]
先找到这个类型：法线里面有两个原子类型的计数器。也就是说自带一个强引用和弱引用
- `_Uses` = 1
- `_Weaks` = 1
![[Pasted image 20250222092942.png]]

![[Pasted image 20250222093430.png]]

![[Pasted image 20250222093450.png]]

- `_Incref_nz()`：非零时安全递增引用计数（原子读取，CAS）
- `_Incref()`:增加强引用计数
- `Incwref()`:增加弱引用计数
- `_Decref`：减少强引用计数，强引用为0，还要减少弱引用，还要destroy
- `_Decwref`:减少弱引用，弱引用为0，deletethis删除控制块自身
- `use_count`：一个静态转换。
- `_Get_deleter`：或得删除器的一个虚函数




# 2.Shared_Ptr部分
## 基类取别名
![[Pasted image 20250223103739.png]]
## 构造
- 使用默认构造
- 然后是一系列带参数的构造
	- 空指针
	- 裸指针：
		- 数组类型：加个数组删除器
		- 非数组：用新的类型管理指针，创建引用块控制块
	- 带删除器的构造：删除器需可移动构造
	- 带删除器和分配器的构造：分配器用于分配控制块资源
	- 别名构造函数：与别名共享控制块，但指向不同变量
		- 作用：如指向派生类的基类成员，但不影响原始引用计数
	- 别名移动构造函数：
	- 拷贝构造函数： 增加引用计数，共享同一控制块
	- 移动构造函数：转移资源所有权，原shared_ptr变为空
	- 从weak_ptr构造：
		- 先判断weak_ptr是否过期，构造一个共享资源的share_ptr
		- 过期了则抛出bad_weak_ptr
	- auto_ptr构造：
		- 直接获取、转换、释放
		- 注意auto_ptr已经被弃用了，这个构造函数仅为兼容性保留
	- 从uniqur_ptr进行构造：
		- 先获取unique_ptr的指针
		- 再获取unique_ptr的删除器
			- 要确保删除器类型兼容shared_ptr
		- 将unique_ptr转换过来
		- 释放unqire_ptr的指针
- 析构函数
	- 调用的是基类的减少引用Decref的方法。
	- 减少引用，计数归零则释放资源

## 内部方法
### swap()：

智能指针先禁用了标准库std特化的swap，使用的是concepts库range的swap
- ADL检查概念：先判断对象是类或枚举，避免对基本类型触发ADL
	-->
- 定制点对象：
	- 使用ADL找到的Swap，即用户为自定义类定义了swap
	- 通用移动交换：**经典三次移动交换**
		- 移动构造临时对象tmp
		- 移动赋值x = y
		- 移动赋值y = tmp
	- 数组交换
	- 
## reset
- unique():如果use_count = 1就返回
## 友元方法
- make_shared
- allocate_shared

## 指针转换
这些本质上都是`cast<_Ty*>`的处理，然后再重新进行一次构造
- static_pointer_cast:支持静态类型转换（如基类和派生类）
- const_pointer_cast:移除或添加const限定符
- reinterpret_pointer_cast：强制转换，二进制层面的指针转换（如void*）
仅在RTTI启用时有用
- dynamic_pointer_cast:支持运行时类型检查
	- `cast<_Ty*>`的处理
	- 转换成功返回shared_Ptr，失败则返回nullptr

## 重载运算符
get
- `*`
- `()`
- `[]`
## 赋值
![[Pasted image 20250223113619.png]]
- 拷贝赋值：纯粹的swap
- 模板化拷贝赋值(支持类型转换)：与普通拷贝赋值相同，但支持非法类型转换
	- 能使Ty2* 可安全转换为 Ty*（例如派生类到基类）
	- enable_if:限制模版实例化，避免非法类型转换
- 移动赋值：转移资源所有权，原指针变为空
	- move将左值转换为右值引用对象后，调用移动构造，构造临时右值引用对象，（将right的资源转移过来，原right置空）
	- 交换，原资源由临时对象析构时释放
- 模板化移动赋值
- auto_ptr的赋值：
	- 移动语义，构造一遍
	- 交换
- unique_ptr的赋值
	- 捕获删除器，并将其存储到控制块中
	- 移动
	- 交换


