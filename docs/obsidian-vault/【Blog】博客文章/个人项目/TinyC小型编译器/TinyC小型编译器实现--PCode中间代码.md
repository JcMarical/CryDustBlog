Pcode 是 TinyC 编译器的中间代码，参考 pascal 编译器的中间代码 pcode 、并结合逆波兰表达式（后缀表达式）的逻辑后，设计出的一种非常简单的、基于栈和符号表的虚拟代码。

# PCode虚拟机内容

Pcode 虚拟机是一个用来运行 Pcode 命令的、假想的机器，它包括：
- 一个代码区（code）
- 一个指令指针（eip）
- 一个栈（stack）
- 一个变量表（var_table)
- 一个函数表（func_table）
- 以及一个标签表（label_table）。

# 作用方式
Pcode 的所有命令都是对栈顶及附近的元素进行操作的，如 push/pop 命令分别将元素入栈和出栈，add 命令将栈顶的两个元素取出，相加后再放回栈顶。

比如
```c++
x = 1 + 2 * 3;
```

可以翻译成
```c+=
push 1
push 2
push 3
mul
add
pop x
```

类似于**逆波兰表达式**
```c++
1 2 3 * +
```

## 注释
Pcode 中以分号 ”;” 开始的为注释，以标识符加冒号的为标签（如 “Label:” ）。


# PCode 7种命令
- **var** 命令：声明变量，向下增长栈的空间
- push/pop：入栈及出栈命令
- **add / sub / mul / div / mod / cmpeq / cmpne / cmpgt / cmplt / cmpge / cmple / and / or / not / neg**：数据运算命令
- **print / readint**：输入以及输出命令
- **exit**：退出命令，并设置退出码
- **jmp / jz** 命令: 跳转命令
- **FUNC / ENDFUNC / arg / ret / $func_name** 命令：自定义函数命令