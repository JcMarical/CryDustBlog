我们知道可编程的[渲染管线](https://zhida.zhihu.com/search?content_id=171079434&content_type=Article&match_order=1&q=%E6%B8%B2%E6%9F%93%E7%AE%A1%E7%BA%BF&zhida_source=entity)（SRP）是通用渲染管线（URP）和高清渲染管线（HDRP）的基础。而 Unity 可编程的渲染管道（SRP）的核心功能之一就是可以编写自己的 Feature 并将其添加到渲染中，而无需从头开始构建整个[渲染系统](https://zhida.zhihu.com/search?content_id=171079434&content_type=Article&match_order=1&q=%E6%B8%B2%E6%9F%93%E7%B3%BB%E7%BB%9F&zhida_source=entity)。

URP 已经为我们提供了很多的后处理效果，但是我们如果想得到更多的效果的话，这里就要去扩展 URP 的 Volume。这就要用到 URP 提供的 RendererFeature 的功能，我们可以通过这个自行添加一个 pass 管理我们的自定义 Volume。

在 Project 窗口点击 Create>Rendering>Universal Render Pipeline>Render Feature，这样我们就可以在 Assets 中找到这个 CustomRenderPassFeature 脚本。

# 结构解析

“CustomRenderPassFeature”负责把这个 Render Pass 加到 Renderer 里面。Render Feature 可以在渲染管线的**某个时间点增加一个 Pass 或者多个 Pass。**

可以看到我们的 Scriptable Renderer Feature 由两个类 CustomRenderPassFeature 与 CustomRenderPass 组成，CustomRenderPassFeature 类继承自 ScriptableRendererFeature，CustomRenderPass 类继承自 ScriptableRenderPass。

# ScriptableRenderPass
## Create，
>用来初始化这个Feature的资源，
```c++
   /// <summary>
    /// 用来初始化这个资源
    /// </summary>
    public override void Create()
    {
        volumeLightingPass = new VolumeLightingPass(settings.Event);
    }
```

负责实际的渲染工作，重要的是要有 **RenderPassEvent**，它里面有 Pass 执行的时间点，用来控制每个 Pass 的执行顺序
```c++
    public enum RenderPassEvent
    {

        BeforeRendering = 0,
        BeforeRenderingShadows = 50,
        AfterRenderingShadows = 100,
        BeforeRenderingPrePasses = 150,

        [EditorBrowsable(EditorBrowsableState.Never)]
        [Obsolete("Obsolete, to match the capital from 'Prepass' to 'PrePass' (UnityUpgradable) -> BeforeRenderingPrePasses")]
        BeforeRenderingPrepasses = 151,
        AfterRenderingPrePasses = 200,
        BeforeRenderingGbuffer = 210,
        AfterRenderingGbuffer = 220,
        BeforeRenderingDeferredLights = 230,
        AfterRenderingDeferredLights = 240,
        BeforeRenderingOpaques = 250,
        AfterRenderingOpaques = 300,
        BeforeRenderingSkybox = 350,
        AfterRenderingSkybox = 400,
        BeforeRenderingTransparents = 450,
        AfterRenderingTransparents = 500,
        BeforeRenderingPostProcessing = 550,
        AfterRenderingPostProcessing = 600,
        AfterRendering = 1000,
    }
```
## AddRenderPasses
AddRenderPasses() 在 Renderer 中插入一个或多个 ScriptableRenderPass，对这个 Renderer 每个摄像机都设置一次。
```c++
    public override void AddRenderPasses(ScriptableRenderer renderer, ref RenderingData renderingData)
    {
        volumeLightingPass.Setup(renderer.cameraColorTarget);
        renderer.EnqueuePass(volumeLightingPass);
    }
```

## Configure() 
在执行渲染过程之前，Renderer 将调用此方法。如果需要配置[渲染目标](https://zhida.zhihu.com/search?content_id=171079434&content_type=Article&match_order=1&q=%E6%B8%B2%E6%9F%93%E7%9B%AE%E6%A0%87&zhida_source=entity)及其清除状态，并创建临时渲染目标纹理，那就要重写这个方法。如果渲染过程未重写这个方法，则该渲染过程将渲染到激活状态下 Camera 的渲染目标。


## Execute() 
是这个类的核心方法，定义我们的执行规则；包含渲染逻辑，设置渲染状态，绘制渲染器或绘制[程序网格](https://zhida.zhihu.com/search?content_id=171079434&content_type=Article&match_order=1&q=%E7%A8%8B%E5%BA%8F%E7%BD%91%E6%A0%BC&zhida_source=entity)，调度计算等等。

```c#
        public override void Execute(ScriptableRenderContext context, ref RenderingData renderingData)
        {
            if (!renderingData.cameraData.postProcessEnabled) return;
            var stac = VolumeManager.instance.stack;
            volumeLighting = stac.GetComponent <VolumeLighting> ();
            if (volumeLighting == null)
            {
                Debug.LogError("VolumLighting为空 ");
                return;
            }
            if (!volumeLighting.IsActive())

            {

                return;
            }
            var cmd = CommandBufferPool.Get(k_RenderTag);
            Render(cmd, ref renderingData);
            context.ExecuteCommandBuffer(cmd);
            CommandBufferPool.Release(cmd);
        }
```