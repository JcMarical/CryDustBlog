本文参考[Custom Render Pipeline --- 自定义渲染管线](https://catlikecoding.com/unity/tutorials/custom-srp/custom-render-pipeline/)，实现Unity自定义渲染管线
# 一.前置准备
## 创建管线资源
学习URP,在Custom RP/Runtime文件夹下创建CustomRenderPipelineAsset
```c++
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Rendering;
[CreateAssetMenu(menuName = "Rendering/Custom Render Pipeline")]
public class CustomRenderPipelineAsset : RenderPipelineAsset {}
```
RPAsset主要用途是为 Unity 提供一种方法来获取负责渲染的管道对象实例,资源本身只是一个句柄和一个存储设置的地方,我们还没有任何设置。

### 重写创建管线方法
```c++
    protected override RenderPipeline CreatePipeline () {
        return null;
    }
```

这样一个管线就创建成功了

## 创建管线
新建一个脚本CustomRenderPipeline继承自RenderPipeline
注意：
- 渲染上下文：本身抽象了一些渲染的方法，使用时直接调用即可
```c#
using UnityEngine;
using UnityEngine.Rendering;

public class CustomRenderPipeline : RenderPipeline 
{
    /// <summary>
    /// 渲染函数，SRP入口点
    /// </summary>
    /// <param name="context">渲染上下文</param>
    /// <param name="cameras">相机</param>
    protected override void Render(ScriptableRenderContext context, Camera[] cameras)
    { 
    
    }
}
```

此时我们再到CustomRenderPipelineAsset就可以返回我们自己的渲染管线了
```c#
public class CustomRenderPipelineAsset : RenderPipelineAsset
{
    protected override RenderPipeline CreatePipeline()
    {
        return new CustomRenderPipeline();
    }

}
```

## 设置管线到引擎
![[Pasted image 20250115164124.png]]
此时界面还是一片漆黑，相机和物体都看不见
![[Pasted image 20250115164217.png]]
# 二.渲染部分
##  相机渲染器
对于渲染器，我们一定要设置好上下文和相机：
- 上下文包含了我们各种渲染的方法抽象
- 上下文设置后，也一定需要将其提交

```c++
using UnityEngine;
using UnityEngine.Rendering;

public class CameraRenderer
{
    //渲染上下文
    ScriptableRenderContext context;
    //相机
    Camera camera;

    //渲染设置
    public void Render(ScriptableRenderContext context, Camera camera)
    {
        this.context = context;
        this.camera = camera;

        //绘制几何体
        DrawVisibleGeometry();
        Submit();
    }

    /// <summary>
    /// 绘制可视化几何
    /// </summary>
    void DrawVisibleGeometry()
    {
        //绘制天空盒
        context.DrawSkybox(camera);
    }

    //渲染提交
    void Submit()
    {
        context.Submit();
    }
}
```

脚本写好了，我们需要将其添加到渲染管线CustomRenderPipeline内
```c++
public class CustomRenderPipeline : RenderPipeline 
{
    //设置渲染相机渲染器
	CameraRenderer renderer = new CameraRenderer();

    protected override void Render(ScriptableRenderContext context, Camera[] cameras)
    { }

    /// <summary>
    /// 渲染函数，SRP入口点
    /// </summary>
    /// <param name="context">渲染上下文</param>
    /// <param name="cameras">相机</param>
    protected override void Render(ScriptableRenderContext context, List<Camera> cameras)
    {
        for (int i = 0; i < cameras.Count; i++)
        {
            renderer.Render(context, cameras[i]);
        }
    }
}
```
再看看我们渲染好的天空
![[Pasted image 20250115170538.png]]

此时天空盒不会随着相机动而变化，是因为我们还没有设置相机的视图-投影矩阵
```c++
    public void Render(ScriptableRenderContext context, Camera camera)
    {
        this.context = context;
        this.camera = camera;

        Setup();    //设置
        DrawVisibleGeometry();   //绘制几何
        Submit();   //提交
    }

    //设置View-Peojection矩阵
    void Setup()
    {
        context.SetupCameraProperties(camera);
    }

```

设置好后回到游戏场景就可以看到渲染器正常跟随场景相机变化了

## 命令缓冲CommandBuffers
一些任务可以通过上下文的专用方法发出，但是其他命令则必须要通过单独的命令缓冲区间发出。我们需要这样的缓冲区来绘制场景中的其他几何体
```c++
using UnityEngine;
using UnityEngine.Rendering;

public class CameraRenderer
{
    //渲染上下文
    ScriptableRenderContext context;
    //相机
    Camera camera;

    //---------------CommandBuffer-------------------
    const string bufferName = "Render Camera";
    CommandBuffer buffer = new CommandBuffer
    {
        name = bufferName
    };


    //渲染设置
    public void Render(ScriptableRenderContext context, Camera camera)
    {
        this.context = context;
        this.camera = camera;

        Setup();    //设置
        DrawVisibleGeometry();   //绘制几何
        Submit();   //提交 
    }

    //设置View-Peojection矩阵
    void Setup()
    {
        buffer.BeginSample(bufferName);     //分析器样本注入profiler便于分析
        ExecuteBuffer(); 
        context.SetupCameraProperties(camera);
    }


    /// 绘制可视化几何
    void DrawVisibleGeometry()
    {
        //绘制天空盒
        context.DrawSkybox(camera);
    }

    //渲染提交
    void Submit()
    {
        buffer.EndSample(bufferName);//关闭profiler样本
        ExecuteBuffer(); //处理Buffer
        context.Submit();
    }

    //执行CommandBuffer
    void ExecuteBuffer()
    {
        context.ExecuteCommandBuffer(buffer);//处理CommandBuffer
        buffer.Clear();
    }
}
```

## 清除渲染目标
每次绘制开始时我们需要先清除我们的渲染目标，这里主要指帧缓冲，当然也可以是渲染纹理
```c++
    //初始设置
    void Setup()
    {
        buffer.ClearRenderTarget(true, true, Color.clear);  //清除渲染目标（帧缓冲）
        buffer.BeginSample(bufferName);     //分析器样本注入profiler便于分析
        ExecuteBuffer(); 
        context.SetupCameraProperties(camera);//设置View-Peojection矩阵
    }
```
清理后的渲染管线显示
![[Pasted image 20250116151853.png]]

## 剔除Culling
渲染管线应用阶段我们还需要做的一件事就是剔除，删去那些摄像机不会照到的物体.
```c#

	 //剔除结果
    CullingResults cullingResults;


    //渲染设置
    public void Render(ScriptableRenderContext context, Camera camera)
    {
        this.context = context;
        this.camera = camera;

        if(!Cull())
        {
            return;
        }

        Setup();    //设置
        DrawVisibleGeometry();   //绘制几何
        Submit();   //提交 
    }

    //剔除
    bool Cull()
    {
        //ScriptableCullingParameters p;
        if (camera.TryGetCullingParameters(out ScriptableCullingParameters p))
        {
            cullingResults = context.Cull(ref p);
            return true;
        }
        return false;
    }
```

## 绘制几何
通过设置sorting、drawing（可见）和filtering（不可见）的Settings，通过上下文进行绘制几何。
- 其中drawing需要指定着色器标签和sort结果，用来渲染无光照的几何体。
- 而filtering需要指定允许哪些**渲染队列**进行渲染。
```c#

    //着色器标签ID（目前只提供无光照着色器）
    static ShaderTagId unlitShaderTagId = new ShaderTagId("SRPDefaultUnlit");


    /// 绘制可视化几何
    void DrawVisibleGeometry()
    {
        var sortingSettings = new SortingSettings(camera);
        var drawingSettings = new DrawingSettings(unlitShaderTagId, sortingSettings);
        var filteringSettings = new FilteringSettings(RenderQueueRange.all);

        context.DrawRenderers(
            cullingResults, ref drawingSettings, ref filteringSettings
        );

        context.DrawSkybox(camera);        //绘制天空盒
    }

```

此时毫无顺序可言
![[Pasted image 20250116154647.png]]
因此我们还要强制设置排序的criteria属性来使用特定的绘制顺序（从前到后）
```c++
  var sortingSettings = new SortingSettings(camera)
        {
            criteria = SortingCriteria.CommonOpaque
        };
```

## 绘制不透明和透明几何图形
- 首先，我们要分别绘制不透明和透明物体（因为不透明物体需要排序）
- 然后我们要先以绘制**非透明物体->天空盒->透明物体**的顺序进行绘制

# 三. 编辑器渲染

## 绘制旧版着色器
需要支持以下的着色器标记id
```c#
    static ShaderTagId[] legacyShaderTagIds = {
        new ShaderTagId("Always"),
        new ShaderTagId("ForwardBase"),
        new ShaderTagId("PrepassBase"),
        new ShaderTagId("Vertex"),
        new ShaderTagId("VertexLMRGBM"),
        new ShaderTagId("VertexLM")
    };
    //旧着色器id
    static ShaderTagId[] legacyShaderTagIds = {
        new ShaderTagId("Always"),
        new ShaderTagId("ForwardBase"),
        new ShaderTagId("PrepassBase"),
        new ShaderTagId("Vertex"),
        new ShaderTagId("VertexLMRGBM"),
        new ShaderTagId("VertexLM")
    };

    //错误材质
    static Material errorMaterial;
    //渲染设置
    public void Render(ScriptableRenderContext context, Camera camera)
    {
        this.context = context;
        this.camera = camera;

        if(!Cull())
        {
            return;
        }

        Setup();    //设置
        DrawVisibleGeometry();   //绘制几何
        DrawUnsupportedShaders(); //绘制旧版着色器与几何
        Submit();   //提交 
    }

    //绘制旧版着色器以及相关物体
    void DrawUnsupportedShaders()
    {
        if (errorMaterial == null)
        {
            errorMaterial =
                new Material(Shader.Find("Hidden/InternalErrorShader"));
        }//错误的材质显示（醋酸杨红）
        var drawingSettings = new DrawingSettings(legacyShaderTagIds[0], new SortingSettings(camera))
        {
            overrideMaterial = errorMaterial//设置错误材质
        };
        for (int i = 1; i < legacyShaderTagIds.Length; i++)
        {
            drawingSettings.SetShaderPassName(i, legacyShaderTagIds[i]);
        }
        var filteringSettings = FilteringSettings.defaultValue;
        context.DrawRenderers(
            cullingResults, ref drawingSettings, ref filteringSettings
        );
    }
```

## 分离编辑器Class
绘制无效对象对开发很有用，但不适用于已发布的应用程序。因此，让我们将 `CameraRenderer` 的所有仅限**编辑器**的代码放在一个单独的分部类文件中。
```c++
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Rendering;

partial class CameraRenderer
{
    partial void DrawUnsupportedShaders();
#if UNITY_EDITOR
    //旧着色器id
    static ShaderTagId[] legacyShaderTagIds = {
        new ShaderTagId("Always"),
        new ShaderTagId("ForwardBase"),
        new ShaderTagId("PrepassBase"),
        new ShaderTagId("Vertex"),
        new ShaderTagId("VertexLMRGBM"),
        new ShaderTagId("VertexLM")
    };

    //错误材质
    static Material errorMaterial;

    //绘制旧版着色器以及相关物体
    partial void DrawUnsupportedShaders()
    {
        if (errorMaterial == null)
        {
            errorMaterial =
                new Material(Shader.Find("Hidden/InternalErrorShader"));
        }//错误的材质显示（醋酸杨红）
        var drawingSettings = new DrawingSettings(legacyShaderTagIds[0], new SortingSettings(camera))
        {
            overrideMaterial = errorMaterial//设置错误材质
        };
        for (int i = 1; i < legacyShaderTagIds.Length; i++)
        {
            drawingSettings.SetShaderPassName(i, legacyShaderTagIds[i]);
        }
        var filteringSettings = FilteringSettings.defaultValue;
        context.DrawRenderers(
            cullingResults, ref drawingSettings, ref filteringSettings
        );
    }
#endif
}

```
## 绘制 Gizmos、UI
```c#
using System.Collections;
using System.Collections.Generic;
using UnityEditor;
using UnityEngine;
using UnityEngine.Rendering;

partial class CameraRenderer
{
    partial void DrawGizmos();
    partial void DrawUnsupportedShaders();
    partial void PrepareForSceneWindow();

#if UNITY_EDITOR
    //旧着色器id
    static ShaderTagId[] legacyShaderTagIds = {
        new ShaderTagId("Always"),
        new ShaderTagId("ForwardBase"),
        new ShaderTagId("PrepassBase"),
        new ShaderTagId("Vertex"),
        new ShaderTagId("VertexLMRGBM"),
        new ShaderTagId("VertexLM")
    };

    //错误材质
    static Material errorMaterial;

    //绘制Gizmos
    partial void DrawGizmos()
    {
        if (Handles.ShouldRenderGizmos())
        {
            context.DrawGizmos(camera, GizmoSubset.PreImageEffects);
            context.DrawGizmos(camera, GizmoSubset.PostImageEffects);
        }
    }


    //绘制旧版着色器以及相关物体
    partial void DrawUnsupportedShaders()
    {
        if (errorMaterial == null)
        {
            errorMaterial =
                new Material(Shader.Find("Hidden/InternalErrorShader"));
        }//错误的材质显示（醋酸杨红）
        var drawingSettings = new DrawingSettings(legacyShaderTagIds[0], new SortingSettings(camera))
        {
            overrideMaterial = errorMaterial//设置错误材质
        };
        for (int i = 1; i < legacyShaderTagIds.Length; i++)
        {
            drawingSettings.SetShaderPassName(i, legacyShaderTagIds[i]);
        }
        var filteringSettings = FilteringSettings.defaultValue;
        context.DrawRenderers(
            cullingResults, ref drawingSettings, ref filteringSettings
        );
    }





    //UI绘制
    partial void PrepareForSceneWindow()
    {
        if (camera.cameraType == CameraType.SceneView)
        {
            ScriptableRenderContext.EmitWorldGeometryForSceneView(camera);
        }
    }
#endif
}

```

# 四.多摄像机处理
主要分为准**备缓冲，处理更改缓冲区名称，摄像机层级处理，清除Flags**四个部分来处理。

