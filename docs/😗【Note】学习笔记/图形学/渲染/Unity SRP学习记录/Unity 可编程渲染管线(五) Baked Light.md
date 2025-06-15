
先放上节课一张寒酸的图
![[Pasted image 20250217002644.png]]

## GI Shader
- 漫反射，获取的是lightmap光照贴图


# LightMap设置
## UV显示
这里不应该将小球也烘焙进去
![[Pasted image 20250217000738.png]]


# 烘焙光源
这效果比直射光好太多了
![[Pasted image 20250217002545.png]]

## 取消环境光照
天空盒带来的环境光相当的亮，可以先取消了。效果也还可以
![[Pasted image 20250217004230.png]]
调下光和阴影
![[Pasted image 20250217015355.png]]
# 光照探针
之前错误烘焙了动态物体
动态物体不应该烘焙光照贴图，而是应该使用**光照探针**
![[Pasted image 20250217004444.png]]

代码根据LIGHTMAP_ON，GI考虑最终通过光照贴图还是光照探针采样，光照探针也必须通过物体表面进行采样。


## 加入光照探针后，纯阴影下的动态物体也可以有全局光照了
![[Pasted image 20250217020544.png]]


## 光照探针代理体积 LPPVs
光照探针确实只适用于相当小的对象，对于大型对象，假设场景中添加了两个拉伸的立方体。因为它们的位置位于黑暗区域内，所以立方体均匀地暗，即使这显然与照明不匹配。
![[Pasted image 20250217021405.png]]
这是一个组件，此外也需要在meshRenderer中设置使用Proxy Volumes。

LPPV本身体积数据还需要存储在**3D纹理**中

最终结果：
![[Pasted image 20250217024242.png]]


# Meta Pass
简介漫反射光会从曲面反射，但是目前Unity将我们的表面都视为白色。我们还没有使用特殊的meta Pass来确定烘焙时的反射光，因此Unity使用默认通道，最终为白色。现在我们要把颜色加上去

## Meta Light Mode
需要向着色器添加新通道（要求剔除始终处于关闭状态）
```c++
        Pass {
            Tags {
                "LightMode" = "Meta"
            }
            Cull Off
            HLSLPROGRAM
            #pragma target 3.5
            #pragma vertex MetaPassVertex
            #pragma fragment MetaPassFragment
            #include "MetaPass.hlsl"
            ENDHLSL

        }
```

并为MetaPass书写新的顶点和片元渲染
需要知道：
- 表面漫反射率（BRDF，Surface，Shadows，Light）
- 之下需要设置颜色、金属度、平滑度

当meta的片元返回值设为0的时候，颜色为纯黑，再次烘焙光照不会返回任何间接光。
![[Pasted image 20250217154944.png]]
LightMap输出也是黑色的
![[Pasted image 20250217155353.png]]

## 加入漫反射率
之前网把mixed关了，现在只渲bake的

![[Pasted image 20250217173303.png]]
再加上brdf，不过更暗了。
![[Pasted image 20250217173749.png]]
**注意金属度别给太高，不然就更暗了**

再加入环境光照
![[Pasted image 20250217174946.png]]

## 最后打开Mixed，烘焙所有漫反射和实时光照
![[Pasted image 20250217180709.png]]

# 自发光
## 自发光设置
![[Pasted image 20250217183735.png]]

## 烘焙自发光
自发光需要通过单独的通道进行烘焙
- shader的metapass获取自发光
- GUI里需要对材质设置烘焙。

带光源
![[Pasted image 20250217192213.png]]


## 烘焙透明度

显然，半透明材质的烘焙结果并没有什么效果
![[Pasted image 20250217200313.png]]


## 硬编码属性设置
硬编码需求三个
- 主纹理_MainTex
- 颜色_Color
- 以及Cutoff
前两个硬编码必须自己设置
```c++
        //烘焙透明度，Unity这两个属性是硬编码的需求，所以隐藏了

        [HideInInspector] _MainTex("Texture for Lightmap", 2D) = "white" {}

        [HideInInspector] _Color("Color for Lightmap", Color) = (0.5, 0.5, 0.5, 1.0)
```
但为了不修改，我们将其隐藏了
在GUI里面设置一下，修改颜色后把属性拷贝过去就行
## 烘焙结果
阴影已经变成淡淡的一层
![[Pasted image 20250217205820.png]]
## alpha Clipping
![[Pasted image 20250217214653.png]]

# Light Probes自动生成

由于该实例在运行模式下生成，因此无法烘焙，必须使用光照探针
![[Pasted image 20250217215624.png]]

## 首先，在绘制的时候把光照探针选项加上
```c++
//批绘制
Graphics.DrawMeshInstanced(mesh, 0, material, matrices, 1023, block,
            ShadowCastingMode.On, true, 0, null, LightProbeUsage.CustomProvided);//MeshRenderer的相关设置
```
光照探针计算
```c++
	//手动插值光照探针
	var positions = new Vector3[1023];
	for (int i = 0; i < matrices.Length; i++)
	{
		positions[i] = matrices[i].GetColumn(3);//将第四列提出来
	}
	var lightProbes = new SphericalHarmonicsL2[1023];
	LightProbes.CalculateInterpolatedLightAndOcclusionProbes(
		positions, lightProbes, null
	);//光照探针计算
	block.CopySHCoefficientArraysFrom(lightProbes);//将光照探针复制到块中

```
这样就会稍微亮一些
![[Pasted image 20250217221456.png]]
## LPPV
因为实例都在一个狭小空间里，这样我们就不需要计算和存储插值光照探针。并且也不需要每帧都更新光照探针数据，只要在体积内即可
![[Pasted image 20250217222244.png]]