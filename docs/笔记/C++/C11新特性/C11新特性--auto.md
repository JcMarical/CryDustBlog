1.定义必须初始化
```c++
const int ci = i, &cr = ci;
auto b = ci;//int
auto c = cr;//int
auto d = &i;//const to poiner
auto e = &ci;//pointer const
```
