[Unity协程的原理与应用 - 知乎 (zhihu.com)](https://zhuanlan.zhihu.com/p/279383752)

+ 对于协程而言，同一时间只能执行一个协程，而线程则是并发的，可以同时有多个线程在运行
- 两者在内存的使用上是相同的，共享堆，不共享栈
对于两者最关键，最简单的区别是微观上线程是并行（对于多核CPU）的，而协程是串行的

## 作用
+ 轻量级线程
+ 分呈多帧的操作
# 协程运作原理
协程是通过迭代器来实现功能的，通过关键字`IEnumerator`来定义一个迭代方法，注意使用的是`IEnumerator`，而不是`IEnumerable`：
>两者之间的区别：
- `IEnumerator`：是一个实现迭代器功能的接口
- `IEnumerable`：是在`IEnumerator`基础上的一个封装接口，有一个`GetEnumerator()`方法返回`IEnumerator`

C#迭代器官方文档：[迭代器 - C# | Microsoft Learn](https://learn.microsoft.com/zh-cn/dotnet/csharp/iterators)


# 协程开启
+ 协程挂载：`MonoBehaviour.StartCoroutine()`方法可以开启一个协程，这个协程会挂在该`MonoBehaviour`下。
+ 生命周期：在`MonoBehaviour`生命周期的`Update`和`LateUpdate`之间，会检查这个`MonoBehaviour`下挂载的所有协程，并唤醒其中满足唤醒条件的协程。
+ 返回与再度开启：要想使用协程，只需要以`IEnumerator`为返回值，并且在函数体里面用`yield return`语句来暂停协程并提交一个唤醒条件。然后使用`StartCoroutine`来开启协程。

# 注意点
+ 协程是挂在MonoBehaviour上的，必须要通过一个MonoBehaviour才能开启协程。
+ MonoBehaviour**被Disable的时候协程会继续执行**，只有MonoBehaviour**被销毁的时候**协程才会被销毁。
+


# 底层原理

## 1. C#的迭代器函数
> 许多语言都有迭代器的概念，使用迭代器我们可以很轻松的遍历一个容器。 但是C#里面的迭代器要屌一点，它可以“[遍历函数](https://zhida.zhihu.com/search?content_id=150214862&content_type=Article&match_order=1&q=%E9%81%8D%E5%8E%86%E5%87%BD%E6%95%B0&zhida_source=entity)”。

C#中的迭代器方法其实就是一个协程，你可以使用`yield`来暂停，使用`MoveNext()`来继续执行。 当一个方法的返回值写成了`IEnumerator`类型，他就会自动被解析成[迭代器方法](https://zhida.zhihu.com/search?content_id=150214862&content_type=Article&match_order=3&q=%E8%BF%AD%E4%BB%A3%E5%99%A8%E6%96%B9%E6%B3%95&zhida_source=entity)_（后文直接称之为协程）_，你调用此方法的时候不会真的运行，而是会返回一个迭代器，需要用`MoveNext()`来真正的运行。


```c#
static void Main(string[] args)
{
    IEnumerator it = Test();//仅仅返回一个指向Test的迭代器，不会真的执行。
    Console.ReadKey();
    it.MoveNext();//执行Test直到遇到第一个yield
    System.Console.WriteLine(it.Current);//输出1
    Console.ReadKey();
    it.MoveNext();//执行Test直到遇到第二个yield
    System.Console.WriteLine(it.Current);//输出2
    Console.ReadKey();
    it.MoveNext();//执行Test直到遇到第三个yield
    System.Console.WriteLine(it.Current);//输出test3
    Console.ReadKey();
}
​
static IEnumerator Test()
{
    System.Console.WriteLine("第一次执行");
    yield return 1;
    System.Console.WriteLine("第二次执行");
    yield return 2;
    System.Console.WriteLine("第三次执行");
    yield return "test3";
}
```

+ 执行`Test()`不会运行函数体，会直接返回一个`IEnumerator`
- 调用`IEnumerator`的`MoveNext()`成员，会执行协程直到遇到第一个`yield return`或者执行完毕。
- 调用`IEnumerator`的`Current`成员，可以获得`yield return`后面接的返回值，该返回值可以是任何类型的对象。

## 注意点
+ `IEnumerator`中的`yield return`可以返回任意类型的对象，事实上它还有泛型版本`IEnumerator<T>`，泛型类型的迭代器中只能返回`T`类型的对象。Unity原生协程使用普通版本的`IEnumerator`，但是有些项目_（比如倩女幽魂）_自己造的协程轮子可能会使用泛型版本的`IEnumerator<T>`
+ 函数调用的本质是**压栈**，协程的唤醒也一样，调用`IEnumerator.MoveNext()`时会把协程方法体压入当前的函数调用栈中执行，运行到`yield return`后再弹栈。这点和有些语言中的协程不大一样，有些语言的协程会维护一个自己的函数调用栈，在唤醒的时候会把整个函数调用栈给替换，这类协程被称为**有栈协程**，而像C#中这样直接在当前函数调用栈中压入栈帧的协程我们称之为**无栈协程**。关于有栈协程和无栈协程的概念我们会在后文[四. 跳出Unity看协程](https://zhuanlan.zhihu.com/p/279383752/edit#%E5%9B%9B.%20%E8%B7%B3%E5%87%BAUnity%E7%9C%8B%E5%8D%8F%E7%A8%8B)中继续讨论
Unity中的协程是[无栈协程](https://zhida.zhihu.com/search?content_id=150214862&content_type=Article&match_order=3&q=%E6%97%A0%E6%A0%88%E5%8D%8F%E7%A8%8B&zhida_source=entity)，它不会维护整个函数调用栈，仅仅是保存一个栈帧。[Unity协程的原理与应用 - 知乎 (zhihu.com)](https://zhuanlan.zhihu.com/p/279383752)


