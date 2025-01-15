# ShaderForge使用 
编译后的代码
![[Pasted image 20241002173235.png]]

# 写一个Lambert的Shader

## 一 基本框架
```c
Shader "Built-in/Lambert"{
	Properties{
		
	}
	SubShader{
		Tags{
			"RenderType" = "Opaque"
		}
		Pass{
			Name "FORWARD"
			Tags{
				"LightMode" = "Forward"
			}
		CGPROGRAM
		#pragma vertex vert
		#pragma fragment frag
		#include "UnityCG.cginc"
		#pragma multi_compile_fwdbase_fullshadows
		#pragma target 3.0
		struct VertexInput{
			float4 vertex:POSITION;
		};
		struct VertexOutput{
			float4 pos:SV_POSITION;
		}
		VertexOutput vert (VertexInput v)
		{
			VertexOutput o = (VertexOutput)0;
			o.pos = UnityObjectToClipPos(v.vertex);
			return o;
		}

		float4 frag(VertexOutput i): COLOR{
			return float4(1.0,2.0,0.1,1.0);
		}
		ENDCG


		}
	
	
	}
	FallBack "Diffuse"
}
```

## 法线信息空间切换
+ 物体坐标到世界空间坐标的切换
```c
struct VertexInput{
	float4 pos : POSITION;
	float4 normal : NORMAL
}

struct VertexOutput{
		float4 pos:SV_POSITION;
		float4 normal : TEXCOORD0； //由模型发现信息换算来的世界空间法线信息
	}
	
VertexOutput vert (VertexInput v)
{
	VertexOutput o = (VertexOutput)0;
	o.pos = UnityObjectToClipPos(v.vertex);
	o.nDiwWS = UnityObjectToWorldNormal(v.normal) //交换法线信息，并将其塞给输出结构
	return o;
}

float4 frag(VertexOutput i): COLOR{
	float3 nDir = i.nDirWD; //获取nDir
	float3 lDir = _WorldSpaceLightPos0.xyz; //获取iDir，世界光照方向
	float nDotl = dot(i.nDirWS,lDir);
	fliat lambert = max(0.0,nDotl);
	return float4(lambert,lambert,lambert,1.0);
}

ENDCG

```

# 常用参数节点
+ Texture
+ Vector
+ Color
+ Slider
+ Switch

## 伪造光
+ 自己设置一个Vector，用来当作世界坐标的光线。这样可以行初一个伪造的光效果