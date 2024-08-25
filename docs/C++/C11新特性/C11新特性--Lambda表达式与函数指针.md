# 1.函数指针 Function pointeer
* 函数指针funtion可以指向一个函数的地址，通过funtion()来调用
* 函数指针的声明很奇怪，一般就使用auto来自动适配类型。
* 也可以使用typedef 来取别名(感觉也很奇怪)
* 作为参数使用，实现C#类似委托的效果，可以执行回调函数。
```c++
  	//-------取别名---------
	typedef void(*HelloWorldFunction)(/*这里是参数*/);
	HelloWorldFunction funtion = HelloWorld；
```
* 

```c++
void HelloWorld()
{
	std::cout<<"HelloWorld" << std::endl;
}

int main()
{
	//取得这个函数的指针
	//实际上是：
	//	auto function = &HelloWorld;
	//编译器提供了隐式转换
	auto function = HelloWorld;
	//然后我们就可以执行函数
	function();

	//-----本质-------
	void(*maric)();
	maric = HelloWorld;
	maric();
	//
	void(*ljc)() = HelloWorld;
	ljc();

	//-------取别名---------
	typedef void(*HelloWorldFunction)();
	HelloWorldFunction funtion = HelloWorld；
	std::cin.get();
}


```

## 制作一个ForEach
* 遍历时，执行某个方法
```c++
void PrintValue(int value)
{
	std::cout << "Value: "
}

void ForEach(const std::vector<int>& values, void(*func)(int))
{
	for(int value: values)
		func(value);
}

int main()
{
	std::vector<int> values = {1, 5, 4, 2, 3};
	ForEach(values,PrintValue);
	

	std::cin.get();
}
```

# 2. 使用lambada匿名函数
* lambada是我们的代码在过程中生成的，用完即弃的函数
* 格式
	* []lambda捕获，= &，a,&a,捕获需要函数指针使用`std::function`函数
	* ()参数
	* {}表达式
* lambda捕获后需要加上mutable才能修改值。
```c++

void ForEach(const std::vector<int>& values, void(*func)(int))
{
	for(int value: values)
		func(value);
}

int main()
{
	std::vector<int> values = {1, 5, 4, 2, 3};
	ForEach(values,[](int value){std::cout << "Value:" << value << std::endl; });

	auto lambda = [](int value){std::cout << "Value:" << value <<std::endl; });

	Foreach(values,lambda)

	std::cin.get();
}
```
## lambda Capture捕获
* [ = ]可以获取外部值传递，passed everything by value
* [ & ]可以获取外部引用传递，passed everything by reference
* [ a ]也可以单独获取一个参数的值传递，passed by value
* [ &a ]也可以单独获取一个参数的引用传递,passed by reference
* 传入捕获的lambda需要使用function方法 
```c++
  int a = 5;

auto lambda = [=](int value){ std::cout << "Value:" << a <<std::endl; };

//然而，这样捕获会导致Foreach出错
//Foreach(values, lambda); Eroor!!!
```
我们需要修改方法的参数
```c++
void ForEach(const std::vector<int>& values, const std::function<void(int)>& func)
{
	for(int value: values)
		func(value);
}

int main()
{
	std::vector<int> values = {1, 5, 4, 2, 3};

	auto lambda = [=](int value){std::cout << "Value:" << value <<std::endl; });

	Foreach(values,lambda)

	std::cin.get();
}


```

## 再见mutable
```c++
int main()
{
	std::vector<int> values = {1, 5, 4, 2, 3};
	auto lambda = [=](int value) mutable {std::cout << "Value:" << value <<std::endl; });
	Foreach(values,lambda)
	std::cin.get();
}
```
