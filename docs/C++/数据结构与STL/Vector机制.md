**20.vector的扩容，哈希表扩容？**

vector的扩容通过一个连续的数组存放元素，如果集合已满，在新增数据的时候，就要分配一块更大的内存，将原来的数据复制过来，释放之前的内存，再插入新增的元素。根据编译器不同，这个扩大的倍数有所不同，以GCC为例，是两倍扩容。

哈希表的扩容和vector也很类似，在哈希表中负载因子=元素个数/散列表长度，当负载因子达到阈值，则需要进行扩容，扩容也是分配更大的散列表，然后进行rehash，最终再将新元素插入。

**21.vector里加入10万数据，游戏中有对象的指针指向这些数据，这可能有什么问题？**

这和上一个问题，vector的扩容息息相关，vector发生扩容时会分配更大的内存，将原内存数据拷贝过来，然后释放之前的内存，如果有指针指向此前的地址，释放之后，指针将不能正常访问到此前的数据。

**22. vector如何快速删除内部对象。（要求O(1)时间复杂度）**

将要删除的对象和尾部对象swap，然后直接pop_back即可。

**23.刚刚我们聊过vector的扩容，那vector怎么减容？pop_back之后，vector会自动减容嘛？如果不会减容，那我们怎么释放不必要的内存呢？C++是否提供了我们什么接口呢？**

vector并不会自动减容，pop_back后vector也不会减容。即使我们调用clear，也只是size清零，capacity并没有真正清零。

如果要回收不必要的内存：可以调用函数shrink_to_fit()，可以要求容器退回不需要的内存空间。其他方式，可以使用swap对vector内存进行清空，借助 swap() 方法将空容器交换给 x，从而达到清空 x 的目的。

# Vector的指针
**vector**，底层是一块具有连续内存的数组，vector的核心在于其长度自动可变。vector的数据结构主要由三个迭代器(指针)来完成：指向首元素的**start**，指向尾元素的**finish**和指向内存末端的**end_of_storage**。


### 3.3 vector如何手动释放内存

【参考资料】[https://www.cnblogs.com/summerRQ/articles/2407974.html](http://link.zhihu.com/?target=https%3A//www.cnblogs.com/summerRQ/articles/2407974.html)

比如有一个vector<int>nums， 比较hack的一种方式是nums = {}，这样既可以清空元素还会释放内存（从一个大佬身上学来的）；规范的做法是，vector<int>().swap(nums)或者nums.swap(vector<int> ())。