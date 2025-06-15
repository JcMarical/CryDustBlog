就只记录需要复习的题型了
# 链表
-  [合并两个有序链表](https://leetcode.cn/problems/merge-two-sorted-lists/description/ "https://leetcode.cn/problems/merge-two-sorted-lists/description/")：这种基础题目半天没做出来，纯是罪过。
- **合并K个有序链表**：没有用最优的方法去做，多个同时合并（）
- 环形链表II：推导思路没想起来
- 丑数II：完全没思路
- 两数相加：进阶方式怎么做？
# 方法总结

## 1.链表
题型：双指针、快慢指针、双指针合并链表、优先队列合并k个链表、反转链表（栈、递归、迭代）
- 时刻注意判断空链表
- 重构新的链表：最好还是增加一个头节点，减少工作量。
- 多多利用dummy虚拟头节点简化问题
- （多个有序，求第k大问题）：都是**合并k个链表问题**