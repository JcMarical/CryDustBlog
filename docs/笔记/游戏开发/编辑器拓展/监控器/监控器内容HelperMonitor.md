
# AllElementWidth元素管理类
+ 一个存List元素数据的字典
+ 一个AddValue
```c++
public static class AllElementWidth
    {
        public static Dictionary<int ,List<float>> AllElements = new Dictionary<int ,List<float>>();
        public static void AddValue(int key,List<float> value) 
        {
            if (!AllElements.ContainsKey(key))
            {
                AllElements.Add(key, value);
            }
            else
            {
                AllElements[key] = value;
            }
        }
    }
```

# HelperMonitorContext 监控器内容类
* 是否选择Actor
* 是否选择子id
* 是否是需要过滤的子Key
* 设置已选择的子KeyID
* 设置有最近的Log方法，传入委托
```c++

public class HelperMonitorContext
{
	public ActorContent selectedActor = null;
	
	public uint selectedSubKeyId = 0;

	public bool IsSubKeyToFilter { get; set; }

	public void SetSelectedSubKey(uint newSubKey)
	{
		selectedSubKeyId = newSubKey;
	}

	public bool HasRecentLog(uint subKeyId)
	{
		if (hasRecentLogFunc != null)
			return hasRecentLogFunc(subKeyId);
		return false;
	}

	private Func<uint, bool> hasRecentLogFunc;

	public void SetHasRecentLogFunc(Func<uint, bool> _func)
	{
		hasRecentLogFunc = _func;
	}
	
}	
```
