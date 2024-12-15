# 概念

| ![[Pasted image 20241106185915.png]] | <br><br><br>![[Pasted image 20241106190203.png]] |
| ------------------------------------ | ------------------------------------------------ |
| 圆形SDF图                               | 不规则SDF图                                          |

一个图像，能够描述每个像素距离 图形边缘距离
+ 图形边缘（已上图的圆框为例子）：SDF值为0，
	+ 圆外值为正，越往外值越大
	+ 园内值为负，越往内越小（不过因为0以下都为黑色，所以看起来是黑色）


# SDF的绘制


| ![[Pasted image 20241106193848.png]] | ![[Pasted image 20241106193358.png]] |
| ------------------------------------ | ------------------------------------ |
| UV                                   | SDF                                  |

uv一般默认是从左下角开始计算的，SDF则一般转换为笛卡尔坐标系,并根据分辨率进行适配

```c
fixed4 frag(v2f i) : SV_Target
{
	//remap uv
	float2 screenSize = _ScreenParams.xy;
	float2 uv = ((i.uv * 2.0 - 1.0) * screenSize.xy) / min(screenSize.x,screenSize.y);

	return float4(uv.x,uv.y,0.0,1.0);
}
```


简单的SDF不需要生成图像，可以用公式描述
+ 复杂图像SDF，可以用SDF结合
+ 更复杂的图像，可以动态生成或者预生成

## 圆的绘制
+ 
```c++
float sdCircle(float2 p,float r)
{
	return length(p) - r;
}
```

## 方形的绘制
```c++
float sdBox( in float2 p, in float2 b)
{
	float2 d = abs(p) - b;
	return length(max(d,0.0) + min(max(d.x,d.y),0.0));
		
}
```


# SDF 逻辑运算
使用step对SDF进行运算

```c
float v = step(sdf1,0.01);
```
等价于(但是shader最好不要用ifelse)
```c

if(sdf < 0.01)
	v = 1.0;
else
	v = 0.0;

```


## 三种运算


| ![[Pasted image 20241106201148.png]] | ![[Pasted image 20241106201355.png]] | ![[Pasted image 20241106201423.png]] |
| ------------------------------------ | ------------------------------------ | ------------------------------------ |
| MAX                                  | MIN                                  | Difference                           |

+ 交集Max：sdf = max(sdf1,sdf2)
+ 并集Min:sdf = min(sdf1,sdf2);
+ Difference = max(sdf,-sdf2);


# SDF渐变（形状补间）
设_Value是Range[0.0,1.0]的Float
```c
	fixed4 frag(v2f i) : SV_Target
	{
		//remap uv
		float2 screenSize = _ScreenParams.xy;
		float2 uv = (i.uv * 2.0 - 1.0) * screenSize.xy
	}
```

## 插值处理
```c
	float sdf = lerp(sdf1,sdf2,_Value);
	//等价于
	float sdf = sdf * (1-_Value) + (sdf2*_value)
	
```

这样就可以做到一种非常奇特的效果，即可以动态改变形状，使得其向SDF1（圆形）或者SDF2（方形）的图形靠近。
![[Pasted image 20241106204135.png]]

# 2D SDF应用场景
+ 字体生成SDF（如Unity的 TextMeshPro），给字形生成SDF距离场图
	+ 好处：常规字体无论如何设置采样率，都会导致锯齿问题。而通过SDF计算的字体则**不会有这种模糊的锯齿**
	  
![[Pasted image 20241106204850.png]]

* SDF描边
```c
float4 sdfEdge(float sdf)
{
	float f1 = step(sdf,0.0); // f1计算的是边界小于0的部分
	float f2 = step(_EdgeWidth,sdf);// f2计算的是边界小于sdf的部分，
	float f3 = step(0.0,sdf) * step(sdf,_EdgeWidth);// 大于0的sdf区域和sdf小于边缘的乘积
	
	return float4(1,0,0,1) * f1 //图形色
		+ float4(0,1,0,1) * f2  //轮廓外的颜色
		+ float4(0,0,1,1) * f3;  //轮廓的颜色
}
```
