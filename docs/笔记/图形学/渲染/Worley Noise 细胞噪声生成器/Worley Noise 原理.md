其实非常简单
# 分割网格
不可平铺：把一个纹理分成(n+2)x(n+2)块（图片内只有nxn），每块中间放入一个随机点。
可平铺：(稍微复杂)需要通过网格坐标取纹理大小的余来进行循环计算。

# 遍历像素寻找最近距离
遍历图片的像素点，计算出和周围9个点的距离，找到离p点最近的点的距离。


# 输出噪声值
最近距离除以一个网格中的像素值即为噪声值