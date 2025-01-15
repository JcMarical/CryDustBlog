# 我们先看Bloom脚本
```javascript
using System;

namespace UnityEngine.Rendering.Universal
{
    [Serializable, VolumeComponentMenu(&quot;Post-processing/Bloom&quot;)]
    public sealed class Bloom : VolumeComponent, IPostProcessComponent
    {
        [Tooltip(&quot;Filters out pixels under this level of brightness. Value is in gamma-space.&quot;)]
        public MinFloatParameter threshold = new MinFloatParameter(0.9f, 0f);

        [Tooltip(&quot;Strength of the bloom filter.&quot;)]
        public MinFloatParameter intensity = new MinFloatParameter(0f, 0f);

        [Tooltip(&quot;Changes the extent of veiling effects.&quot;)]
        public ClampedFloatParameter scatter = new ClampedFloatParameter(0.7f, 0f, 1f);

        [Tooltip(&quot;Clamps pixels to control the bloom amount.&quot;)]
        public MinFloatParameter clamp = new MinFloatParameter(65472f, 0f);

        [Tooltip(&quot;Global tint of the bloom filter.&quot;)]
        public ColorParameter tint = new ColorParameter(Color.white, false, false, true);

        [Tooltip(&quot;Use bicubic sampling instead of bilinear sampling for the upsampling passes. This is slightly more expensive but helps getting smoother visuals.&quot;)]
        public BoolParameter highQualityFiltering = new BoolParameter(false);

        [Tooltip(&quot;The number of final iterations to skip in the effect processing sequence.&quot;)]
        public ClampedIntParameter skipIterations = new ClampedIntParameter(1, 0, 16);

        [Tooltip(&quot;Dirtiness texture to add smudges or dust to the bloom effect.&quot;)]
        public TextureParameter dirtTexture = new TextureParameter(null);

        [Tooltip(&quot;Amount of dirtiness.&quot;)]
        public MinFloatParameter dirtIntensity = new MinFloatParameter(0f, 0f);

        public bool IsActive() =&gt; intensity.value &gt; 0f;

        public bool IsTileCompatible() =&gt; false;
    }
}
```

## Bloom脚本继承了2个类，**VolumeComponent** 和 **IPostProcessComponent**，
过会儿我们自定义脚本也仿照Bloom脚本来写后处理脚本。
所以第一部分就是确保自定义的后处理组件能显示在Volume的Add Override菜单中即可，只需继承类并且添加特性即可，VolumeComponent本质上是一个ScriptableObject。

我们来看第二部分，可变成渲染Pass脚本，这个**PostProcessPass**就是URP内置后处理的核心，它继承了**ScriptableRenderPass**，方便在URP管线下扩展额外的Pass通道。



# ScriptableRendererFeature

必须实现Create，必须实现AddRendererPass
