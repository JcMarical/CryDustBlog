希望从表达式的类型推断出要定义的变量的类型，但是不想用该表达式的值初始化变量，由此诞生了 decltype。

# 返回操作数的操作类型。
```c++
    decltype(f()) sum =x;//sun的类型就是函数f的返回类型
```

## 变量的类型
```c++
    const int ci = 0,&cj = ci;
    decltype(ci) x = 0;
    decltype(cj) y = x;
    decltype(cj) z; //Error! z是一个引用(对应cj)，必须初始化
```

# decltype 和引用
如果加变量上一个括号，编译器就会把它当作一个 via 哦大师。
```c++
int i = 42,*p = &i,&r = i;
decltype(r+0) b;
decltype(*p) c;//Error! c是一个引用
decltype((i)) d;//Error! 
```
