关键词：**小顶堆，O(Nlogk)**

# 核心算法

建立一个小顶堆，然后遍历「出现次数数组」：

- 如果堆的元素个数小于 k，就可以直接插入堆中。
- 如果堆的元素个数等于 k，则检查堆顶与当前出现次数的大小。如果堆顶更大，说明至少有 k 个数字的出现次数比当前值大，故舍弃当前值；否则，就弹出堆顶，并将当前值插入堆中。