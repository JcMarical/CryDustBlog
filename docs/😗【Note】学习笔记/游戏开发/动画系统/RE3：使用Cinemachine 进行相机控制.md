# RE3：使用Cinemachine 进行相机控制
这个我太会了

# 一些需要注意的点
* World Up Override：“上方”，相机y轴如果和世界坐标夹角大于90，会重设相机位置。如果不太希望这种调整，则要设置一下
* Default Blend：切换相机的过渡

## Virtual Camera
* Bingding Mode：
	* Lock To Target On Assign：锁定在身后位置
	* 剩下的用到时再说


## 飞机控制
没写代码...略


## 人物控制器
也是简单过了一下


# State-Driven Camera
状态机的方案，方便切换相机。