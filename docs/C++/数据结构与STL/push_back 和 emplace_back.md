### 2.4 STL容器的push_back和emplace_back的区别？

【参考资料】《C++ Primer》P308、[C++11使用emplace_back代替push_back_华秋实的专栏-CSDN博客](http://link.zhihu.com/?target=https%3A//blog.csdn.net/yockie/article/details/52674366)

答：emplace/emplace_back函数使用传递来的参数直接在容器管理的内存空间中构造元素（只调用了构造函数）；push_back会创建一个局部临时对象，并将其压入容器中（可能调用拷贝构造函数或移动构造函数）