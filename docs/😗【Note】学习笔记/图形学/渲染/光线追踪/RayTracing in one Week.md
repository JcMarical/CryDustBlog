# 1.项目介绍
添加纹理、体积（如雾）、矩形、实例、光源，并支持使用 BVH 的许多对象实现光线追踪。

# 2.运动模糊
## 设置时间
## 管理时间
## 添加移动球体
和原球体基本类似，主要是需要传入中心点，中心点又根据时间进行变化。
## 跟踪光线相交的时间
根据时间进行叠加渲染，变成运动模糊


## 4.Bounding Volume Hierarchies 边界卷层次结构

## 核心思想
```c++
if (ray hits bounding object)
    return whether ray hits bounded objects
else
    return false 
```


## Bounding Volumes边界卷的层次结构

![[Pasted image 20250210175706.png]]
```
if (hits purple)
    hit0 = hits blue enclosed objects
    hit1 = hits red enclosed objects
    if (hit0 or hit1)
        return true and info of closer hit
return false
```

## AABB框
计算，就是把x，y，z代入进去。
![[Pasted image 20250210180203.png]]


## 光线相交代码
定量填充间隔
```
    interval expand(double delta) const {
        auto padding = delta/2;
        return interval(min - padding, max + padding);
    }
```

## AABB代码
```c++
#ifndef AABB_H
#define AABB_H

// 声明前置依赖（假设 interval、point3、vec3、ray 等类型已定义）
class interval;  // 表示数值区间（包含 min 和 max）
class point3;    // 三维点（x, y, z）
class vec3;      // 三维向量
class ray;       // 射线（起点 origin，方向 direction）

// 轴对齐包围盒（Axis-Aligned Bounding Box, AABB）
class aabb {
public:
    interval x, y, z; // 三个轴向的区间范围

    // 默认构造函数：初始化为空包围盒（interval 默认构造为空）
    aabb() {}

    // 构造函数：直接指定三个轴向的区间
    aabb(const interval& x, const interval& y, const interval& z)
        : x(x), y(y), z(z) {}

    // 构造函数：通过两个对角点构造包围盒（自动计算最小/最大值）
    aabb(const point3& a, const point3& b) {
        // 对每个轴向，取两点坐标的最小值和最大值作为区间
        x = (a[0] <= b[0]) ? interval(a[0], b[0]) : interval(b[0], a[0]);
        y = (a[1] <= b[1]) ? interval(a[1], b[1]) : interval(b[1], a[1]);
        z = (a[2] <= b[2]) ? interval(a[2], b[2]) : interval(b[2], a[2]);
    }

    // 根据轴向索引返回对应的区间（0:x, 1:y, 2:z）
    const interval& axis_interval(int n) const {
        if (n == 1) return y;
        if (n == 2) return z;
        return x; // 默认处理 n=0 或其他值
    }

    // 判断射线 r 在时间区间 ray_t 内是否与包围盒相交（标准 AABB 碰撞检测算法）
    bool hit(const ray& r, interval ray_t) const {
        const point3& ray_orig = r.origin(); // 射线起点
        const vec3& ray_dir = r.direction(); // 射线方向

        // 对每个轴向（x, y, z）进行相交测试
        for (int axis = 0; axis < 3; axis++) {
            const interval& ax = axis_interval(axis); // 当前轴向的区间
            const double adinv = 1.0 / ray_dir[axis]; // 方向分量的倒数（避免重复除法）

            // 计算射线进入和离开当前轴向区间的时间 t0, t1
            auto t0 = (ax.min - ray_orig[axis]) * adinv;
            auto t1 = (ax.max - ray_orig[axis]) * adinv;

            // 若射线方向为负，则交换 t0 和 t1
            if (t0 < t1) {
                if (t0 > ray_t.min) ray_t.min = t0; // 更新相交时间起点
                if (t1 < ray_t.max) ray_t.max = t1; // 更新相交时间终点
            } else {
                if (t1 > ray_t.min) ray_t.min = t1;
                if (t0 < ray_t.max) ray_t.max = t0;
            }

            // 若当前时间区间无交集，则射线未击中包围盒
            if (ray_t.max <= ray_t.min)
                return false;
        }
        return true; // 所有轴向均有交集，射线击中包围盒
    }
};

#endif
```

## 为物体构建边界框Bouding boxes
球体：就是根据半径和中心点计算咯。三个轴的【c-r,c+r】

## 对象列表的边界框BoundingBox
实现方式：每次添加物体时，bbox修改为以原bbox和新物体的aabb框组成的新的aabb框

## BVH节点类
继承自碰撞集hittable
构成：
- 左碰撞集
- 右碰撞集
- Bouding box
方法：
- hit方法碰撞，先判断大的bbox有没有碰撞
- 没有则再调用左、右的hittable碰撞集中的hit方法，返回左或右的结果。

## BVH拆分
任何效率性的结构最困难的部分就是构建它。
BVH构建方式：
- 随机选一个轴(构建一个盒子比较函数给sort)
	- 优化：选最长轴
- 对基元进行排序
- 每个子树再放置一半

# 四.纹理
stb_image


# 五.Perlin Noise


# 六.定义四边形
- Q起点
- u、v横纵坐标
- aabb盒子
- 材质
而方法主要是
- 设置bbox盒，原点和Q+u+v构建aabb，Q+u和Q+v构建aabb，两者再一起构建的aabb就是包围盒了。

# 七.设置平面相交

## 计算点与平面公式
平面公式：
- Ax+By+Cz = D
计算D；
- n （A,B,C）· v(x,y,z) = D
转换一下就是
- n * (P + td) = D
最后求出t，即可算出光线相交的位置（交点）      

但是平面公式一般不会直接给你
- 所以法线n可以通过两个侧向量n=unit_vector(u×v)计算出来
- Q在平面上，所以可以D = n · Q算出来

## 计算点相对于四边形的位置（重心坐标）
设置P=Q+αu+βv

如果u，v是正交的，计算a，b很简单，直接投影正交就行了。

**平面坐标：**
- α=w⋅(p×v)
- β=w⋅(u×p)
- p=P−Q = αu+βv
- w=n/(n⋅(u×v))=n/(n⋅n) 其中w对于给定四边形是常数，所以可以缓存下来

推导过程：
u×p=u×(αu+βv)=u×αu+u×βv=α(u×u)+β(u×v)
v×p=v×(αu+βv)=v×αu+v×βv=α(v×u)+β(v×v)
简化为
v×p=α(v×u)
u×p=β(u×v)
同乘
n⋅(v×p)=n⋅α(v×u)
n⋅(u×p)=n⋅β(u×v)

**就可以将w这个常量单独提出来了**


**最后就是判断**
1. **0≤α≤1**
2. **0≤β≤1**


# 七.光照Lights
## 自发光材质emitted函数
只告诉是什么颜色，暂时不反射
## 添加背景色
使用纯黑背景，让唯一的光纤来自发射器
## 发射方式
其实是沿用了上述纹理的采样方法，现在将纹理的每一块都设置一个颜色，同时发射光线
**光线需要大于1**，采样的时候不会限制到1以内

## 康奈尔盒子
问题：
- **噪点嘈杂（光线小，随机光线不一定会照射到一些地方）**


# 八.实例

## 平移
## 旋转
显然只基金旋转并没有那么容易计算，所以旋转最好还是先在**对象空间**进行
先在**对象空间旋转后再平移**


## 九.Volumes体积

## 恒密度介质
光经过恒密度介质一般会有两种情况
![[Pasted image 20250210225821.png]]
- 体积内散射
- 穿过
散射概率probability=C⋅ΔL

**目前就先设置一个均匀的随机方向**