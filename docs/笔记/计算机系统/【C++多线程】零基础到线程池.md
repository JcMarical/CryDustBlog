> 纸上得来终觉浅，绝知此事要躬行

之前找游戏开发实习的时候，一直没有怎么问到多线程的细节，自己也没有做果多线程实战方面的练习，所以基本上只描述了一些概念和基础。结果后来玩到JobSystem的时候提了一嘴就开始被拷打了，这才明白了多线程还有非常多的细节值得去研究...

这篇文章的初心，就是为了让初学者通过**C++代码实战**去真正的了解多线程，毕竟实战才是检验真理的唯一标准。

# 一 线程调用
线程在初始化后就已经调用了，CPU跑得慢就没有输出，跑得快也会报错，因为主程序已经结束了。
```c++
#include<iostream>
#include<thread>
using namespace std;

void print()
{
	cout << "Hello,World!" << endl;
}

void main()
{
	std::thread testThread(print);

}

```

错误代码3，ESRCH，对应--没有此进程
![[Pasted image 20250214012105.png]]
## join()
作用就是确保线程运行结束了，再结束主程序
```c++
void main()
{
	std::thread testThread(print);
	testThread.join();
}
```

## thread函数传参
```c++
	std::thread testThread(print,"Hello,World!");
	testThread.join();

```

## detach()
主线程可以阻塞等待结束，但子线程会继续在后台运行。但是呢，你依然看不到输出，因为已经主线程会直接在等待子线程结束后直接结束，并不会运行！
```c++
void main()
{
	std::thread testThread(print,"Hello,World!");
	testThread.detach();

}
```

## joinable()
有些时候线程不能强制加入，需要先判断是否能调用。若需要调用，则需要先通过joinable判断，如果为true即可调用。
```c++
void main()
{
	std::thread testThread(print,"Hello,World!");
	if (testThread.joinable())
	{
		testThread.join();
	}
	return;
}

```

# 二 线程未定义错误
显然这是直接将右值传入到左值引用中，编译都无法通过。
```c++
void foo(int& x)
{
	x += 1;
}

int main()
{
	std::thread t(foo,1);
	t.join();
	return 0;
}
```

## std::ref
```c++
void main()
{
	int a = 1;
	thread t(foo, ref(a));
	t.join();

	cout << a << std::endl;
	return;

}

```

## 局部栈帧销毁导致变量释放
线程还没有结束，但是栈帧销毁导致a释放了，引用a的线程无法正确使用。引发错误
```c++
#include<iostream>
#include<thread>
using namespace std;

std::thread t;
void foo(int& x)
{
	x += 1;
}

void test() {
	int a = 1;
	t = std::thread(foo, std::ref(a));
}

void main()
{
	int a = 1;
	thread t(foo, ref(a));
	t.join();

	cout << a << std::endl;
	return;

}

```
## 解决方法：将变量作用域级别提高
```c++

std::thread t;
int a = 1;
void foo(int& x)
{
	x += 1;
}

void test() {

	t = std::thread(foo, std::ref(a));
}

```

# 三 互斥量解决多线程数据共享问题
## mutex
又称为互斥量


## 写数据时冲突
两个线程一起运行，分别+100000，结果应该是200000
```c++
int a = 0;
void func() {
	for (int i = 0; i < 100000; i++)
	{
		a += 1;
	}
}

int main()
{
	std::thread t1(func);
	std::thread t2(func);

	t1.join();
	t2.join();

	std::cout << a << std::endl;
	return 0;

}
```

## 最后的结果
![[Pasted image 20250214202045.png]]
造成的原因就是因为两个线程取到a的值的时候，另一个线程还没有将+法的结果返回。这样就会导致中途加法互斥，这种同时读数据然后修改的行为叫做**脏读**。

## mutex的锁lock(互斥锁)
互斥锁的目的：在线程执行这段逻辑的时候，加锁，并让其他线程阻塞。
```c++

int a = 0;
mutex mtx;
void func() {
	for (int i = 0; i < 100000; i++)
	{
		mtx.lock();
		a += 1;
		mtx.unlock();
	}
}

```

## 线程安全的意义
多线程跑出来的结果和单线程一样，就叫线程安全。

# 四 互斥量死锁
如下面代码锁死，func1占用了m1的锁，而func2占用了m2的锁，两者互相请求对方的锁，自身的资源又不释放，所以造成了死锁。
```c++

#include<iostream>
#include<thread>
#include<mutex>
#include<Windows.h>
using namespace std;

int a = 0;
mutex m1;
mutex m2;

void func_1()
{
	m1.lock();
	Sleep(10);
	m2.lock();

	m1.unlock();
	m2.unlock();
}

void func_2()
{
	m2.lock();
		Sleep(10);
	m1.lock();

	m1.unlock();
	m2.unlock();
}

int main()
{
	std::thread t1(func_1);
	std::thread t2(func_2);

	t1.join();
	t2.join();

	std::cout << a << std::endl;
	return 0;

}


```

## lock_guard 互斥量封装类
- 当**构造函数**调用时，该互斥量会被自动锁定
- 当**析构函数**调用时，该互斥量自动解锁
- lock_guard对象不能**复制或移动**，因此只能在局部作用域中使用
```c++

#include<iostream>
#include<thread>
#include<mutex>
#include<Windows.h>
using namespace std;

int shared_data = 0;

std::mutex mtx;

void func() {
	for (int i = 0; i < 100000; i++) {
		std::lock_guard<std::mutex> lg(mtx);
		shared_data++;
	}
}

int main() {
	std::thread t1(func);
	std::thread t2(func);

	t1.join();
	t2.join();

	std::cout << shared_data << std::endl;
	return 0; 
}
```

## unique_lock智能互斥量封装类
unique本身就有lock_guard的功能，可以直接当成lock_guard来使用。
unique_lock也提供了更多的方法来处理线程，需要将第二个参数设置为false，切换为手动控制锁：
- lock()，和正常mutex的lock一样，都是直接加锁。如果当前互斥量被其他线程占有，则当前线程阻塞知道加锁成功。
- try_lock()：尝试对互斥量进行加锁操作，如果当前互斥量已经被其他线程持有，则立刻返回false，否则返回true
- try_lock_for(chrono::duration):指定时间内执行lock的功能，超过设置的间隔时间，就回直接返回false。
- try_lock_untuk(chrono::time_point):直接指定时间点，而不是时间间隔。作用和try_lock_for类似、
- unlock()：解锁。

## call_once及其使用场景（单例模式）
call_once搭配once_flag一起使用,支持多线程情况下**某个函数只执行一次**。

### 饿汉式
通过静态变量直接创建（而且c++11后没调用前不会分配内存）
```c++
class Log {
public:
	Log() {};
	Log(const Log& log) = delete;
	Log& operator=(const Log& log) = delete;

	static Log& GetInstance() {
		static Log instance;
		return instance;
	}

};
```

###  懒汉式
最开始为空，用到的时候再创建。
很多时候用双检锁的情况就能提高线程安全性，但是还是没有call_once确保只执行一次完美，因为两者可能都判断为空之后进入函数逻辑，并产生**脏读**的情况。
```c++
#include<iostream>
#include<thread>
#include<mutex>
#include<Windows.h>
using namespace std;
class Log {
public:
	Log() {};
	Log(const Log& log) = delete;
	Log& operator=(const Log& log) = delete;

	static Log& GetInstance() {
		static Log* instance = nullptr;
		std::call_once(once, []() {instance = new Log(); });
		return *instance;
	}


private:
	static once_flag once;

};
```

## condition_variable 条件变量
食用方案：
- 创建一个std::condition_variable对象
- 创建一个std::mutex 对象，用来保护共享资源的访问
- 在需要等待条件变量的地方
	- 使用unique_lock锁定互斥锁
	- 并条用condition_variable对象的wait相关的函数等待条件变量
- 在其他线程中需要通知等待的线程是，调用std::condition_variable的notify相关函数


### 核心：wait()和notify()
- wait()函数作用：wait函数，可以让线程陷入阻塞状态，等待其他线程通知
- notify_one:通知一个阻塞的队列，让他停止阻塞
- notify_all:顺序执行剩下的线程。

## 生产者，消费者模型
注意sleep不要在unique_lock的作用域内，不然等待时间不会释放锁的
```c++

#include<iostream>
#include<thread>
#include<mutex>
#include <condition_variable>
#include<Windows.h>
#include<queue>
using namespace std;

std::queue<int> g_queue;
std::condition_variable g_cv;
std::mutex mtx;
void Producer() {
	for (int i = 0; i < 10; i++) {
		std::this_thread::sleep_for(std::chrono::microseconds(1000));
		std::unique_lock<std::mutex> lock(mtx);
		g_queue.push(i);

		//通知消费者来取任务了
		g_cv.notify_one();
		std::cout << "Producer :" << i << std::endl;

	}

}

void Consumer() {
	while (1)
	{
		std::unique_lock<std::mutex> lock(mtx);
		bool isempty = g_queue.empty();
		g_cv.wait(lock, []() {
			return !g_queue.empty();
			});
		int value = g_queue.front();
		g_queue.pop();
		std::cout << "Consumer" << value << std::endl;
	}
}

int main()
{
	std::thread t1(Producer);
	std::thread t2(Consumer);

	t1.join();
	t2.join();

}
```


# 五 线程池实现
用到了相当多的c++11技术，值得仔细思索一下。
```c++

#include<iostream>
#include<thread>
#include<mutex>
#include <condition_variable>
#include<Windows.h>
#include<queue>
#include<vector>
#include<functional>
using namespace std;

class ThreadPool {
public:
	ThreadPool(int numThreads) :stop(false) {
		for (int i = 0; i < numThreads; i++) {
			threads.emplace_back([this] {
				while (1) {
					//上锁！
					std::unique_lock<std::mutex> lock(mtx);
					//等待
					//任务没有全部完成，不能停
					condition.wait(lock, [this] {
						return !tasks.empty() || stop;
						});

					if (stop&& tasks.empty()) {
						return;
					}

					std::function<void()> task(std::move(tasks.front()));

					tasks.pop();
					lock.unlock();
					//到这里解锁


					task();
				}

				});
		}

	}

	~ThreadPool() {
		{
			//先把人物结束了，{}限制了lock的作用域
			std::unique_lock<std::mutex> lock(mtx);
			stop = true;
		}
		//通知所有线程工作，把线程全部取完
		condition.notify_all();
		for (auto& t : threads) {
			t.join();
		}
	}

	//普通函数里面加两个引用，是右值引用
	//在函数模版里面加两个引用，那就是万能引用
	template<class F,class ... Args>
	void enqueue(F &&f, Args&&... args) {
		//function的作用就是个函数指针
		// bind传入函数+参数，把函数和参数绑在一起，这样无论多少个参数，都不需要再传参
		//既然上面参数用的通用引用，那下面传出参数也要使用通用引用。
		//完美转发：左值变左值，右值变右值，都可以转换。
		std::function<void()> task = std::bind(std::forward<F>(f), std::forward<Args>(args)...);

		{
			std::unique_lock<std::mutex> lock(mtx);
			//左值转换成右值传进去(队列，没有back)
			//push太慢，有复制过程，而emplace能直接调用有参构造
			tasks.emplace(std::move(task));
		}

		//有任务加进来了，通知执行
		condition.notify_one();
	};


private:
	std::vector<std::thread> threads;
	std::queue<std::function<void()>> tasks;	//任务队列

	std::mutex mtx;
	std::condition_variable condition;

	bool stop;


};



int main() {
	ThreadPool pool(4);

	for (int i = 0; i < 10; i++) {
		pool.enqueue([i] {
			std::cout << "task : " << i << "is running" << std::endl;
			std::this_thread::sleep_for(std::chrono::seconds(1));
			std::cout << "task : " << i << "is done" << std::endl;
			});
	}

	return 0;
}


```

# 六 异步并发
## async和future
async:用于异步执行一个函数，并返回一个std::future对象，表示异步操作结果。

使用async可以方便地进行异步编程，避免手动创建线程和管理线程的麻烦
```c++
#include<iostream>
#include<future>

using namespace std;

int func() {
	int i = 0;
	for (i = 0; i < 1000; i++)
	{
		i++;
	}
	return i;
}

int main() {
	/*普通调用方式
	func();
	func();
	*/

	/* 线程的方式
	std::thread t1(func);
	std::thread t2(func);
	*/

	//当他传到future_result的过程中，func已经在运行了。
	std::future<int> future_result = std::async(std::launch::async, func);
	cout << func() << endl;
	//如果异步func代码没运行完
	cout << future_result.get() << endl;

	return 0;
}
```

当使用async执行func时，相当于开启了一个关于func的线程.
**但它不会影响到主线程func的运行**
需要等到func执行结果结束，我们才能通过get函数获得最终返回值。

## packaged_task和get_future
packaged_task只是可以将函数包裹成一个线程，并不会直接运行，future也会保持成空。
而一旦将其作为参数放到thread中，就可以通过get获取线程的结果。
- 注意，移动构造必须使用move才行
```c++
#include<iostream>
#include<future>

using namespace std;

int func() {
	int i = 0;
	for (i = 0; i < 1000; i++)
	{
		i++;
	}
	return i;
}

int main() {
	
	std::packaged_task<int()> task(func);
	std::future<int> future_result = task.get_future();

	//不move会报错，packaged_task是一个可移动对象，需要转为右值 
	std:thread t1(std::move(task));


	cout << func() << endl;
	t1.join();
	//如果异步func代码没运行完
	cout << future_result.get() << endl;

	return 0;
}
```


## promise
用于在一个线程中设置一个值，并在另一个线程中去得这个值。
（**线程间通信**）promise**通常和future与async一起使用，实现异步编程**。
- 使用时也要注意promise不能被拷贝
```c++
#include<iostream>
#include<future>
using namespace std;
int func(std::promise<int> &f) {

	f.set_value(1000);

}

int main() {
	std::promise<int> f;
	auto future_result = f.get_future();

	std::thread t1(func, std::ref(f));

	t1.join();

	cout << future_result.get() << endl;
	return 0;
}
```

# 七 原子操作
## atomic
把互斥锁那章的内容拿过来， 使用原子变量。
平均耗时会比加互斥锁快
```c++
#include<iostream>
#include<future>
#include <thread>
#include <mutex>
using namespace std;


std::mutex mtx;

std::atomic<int> shared_data = 0;
void func() {
	for (int i = 0; i < 100000; ++i)
	{
		shared_data++;
	}
}

int main()
{
	//转换一下时间到微秒
	auto last = std::chrono::duration_cast<std::chrono::microseconds>(
		std::chrono::system_clock::now().time_since_epoch()
	).count();
	
	thread t1(func);
	thread t2(func);

	t1.join();
	t2.join();

	std::cout << "shared_data = " << shared_data << std::endl;

	//转换一下时间到微秒
	auto cur = std::chrono::duration_cast<std::chrono::microseconds>(
		std::chrono::system_clock::now().time_since_epoch()
	).count();

	std::cout << cur - last << endl;

	return 0;
}
```

## atomic的方法
这些方法都是确保有**原子性的**
- load：取、输出这个值
- store（val）：复制到这个值上，和=作用相等