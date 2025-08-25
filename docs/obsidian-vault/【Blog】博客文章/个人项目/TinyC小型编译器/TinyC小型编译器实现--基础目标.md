参考：
[http://web.stanford.edu/class/archive/cs/cs143/cs143.1128/](http://web.stanford.edu/class/archive/cs/cs143/cs143.1128/)
- [第06章 编译器基本流程 — 自己动手写编译器](https://pandolia.net/tinyc/ch6_compiler_overview.html)
# 目标

tiny.c
```c
#include "for_gcc_build.hh" // only for gcc, TinyC will ignore it.

int main() {
    int i;
    i = 0;
    while (i < 10) {
        i = i + 1;
        if (i == 3 || i == 5) {
            continue;
        }
        if (i == 8) {
            break;
        }
        print("%d! = %d", i, factor(i));
    }
    return 0;
}

int factor(int n) {
    if (n < 2) {
        return 1;
    }
    return n * factor(n - 1);
}
```

for_gcc_build.hh
这个主要是用来支持gcc正常编译的，我们自己的编译器会忽略掉这个头文件。
```c
#include <stdio.h>
#include <string.h>
#include <stdarg.h>

void print(char *format, ...) {
    va_list args;
    va_start(args, format);
    vprintf(format, args);
    va_end(args);
    puts("");
}

int readint(char *prompt) {
    int i;
    printf(prompt);
    scanf("%d", &i);
    return i;
}

#define auto
#define short
#define long
#define float
#define double
#define char
#define struct
#define union
#define enum
#define typedef
#define const
#define unsigned
#define signed
#define extern
#define register
#define static
#define volatile
#define switch
#define case
#define for
#define do
#define goto
#define default
#define sizeof
```