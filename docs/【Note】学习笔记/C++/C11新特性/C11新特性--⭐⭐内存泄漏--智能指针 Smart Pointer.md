当你使用 new 时，你不用调用 delete

栈上声明，堆上分配

 [智能指针的 C++实现 - 知乎 (zhihu.com)](https://zhuanlan.zhihu.com/p/64543967)
# 对象（栈作用域）生存期

- 栈：一种数据结构
```c++
class Entity
{
public:
    Entity()
    {
        std::cout << "Create Entity!" << std::endl;
    }
    ~Entity()
    {
        std::cout << "Destoryed Entity!" << std::endl;
    }

}
```

## 调用
```
int main()
{
    {
        Entity e;
    }

    std::cin.get();
}
```
## 输出结果
```
Created Entity!!!
//点击空格后
Destroyed Entity!!!
```
## 调用
```c++
int main()
{
    {
        Entity e;
    }

    std::cin.get();
}
```

```
int main()
{
    {
        Entity* e = new Entity();
    }
    
    std::cin.get();
}
```

## 输出结果
```
Created Entity!!!
//点击空格后
//无，也就是一直没有被销毁

当然当进程结束时，会被全部销毁。但是在运行过程中，则会一直占用内存
```

# SmartPointer
本质上是一个类
```c++
class ScopedPtr(Entity* ptr): m_Ptr(ptr)
{
private:
    Entity* m_Ptr;
public:
    ScopedPtr(Entity* ptr) : m_Ptr(ptr)
    {
    
    
    }
    ~ScopedPtr()
    {
        delete  m_Ptr;
    }
}

int main()
{
    {
        ScopedPtr e = new Entity()
        Entity* e = new Entity();
        
    }

}
```

# unique_ptr

- unique_ptr 是作用域指针(scope pointer)
- 不能被复制
- 不能直接拷贝构造，源码中函数和操作符已经被直接删除了。因为一个指针死后，那么它们都会死，底层内存被释放。
- 尽量使用这个指针。
## 转移所有权
- 只能使用 std:: move 转移所有权
```c++
#include <iostream>
#include <string>
#include <memory>

class Entity
{
public:
    Entity()
    {
        std::cout << "Create Entity!" << std::endl;
    }
    ~Entity()
    {
        std::cout << "Destoryed Entity!" << std::endl;
    }

    void Print(){}
        
}

int main()
{
    {
        //std::unqique<Entity> entity = new Entity();
        
        std::unqique<Entity> entity(new Entity());

        //处于异常安全的考虑，可以使用这种构造方式
        std::unqique<Entity> entity = std::make_unique<Entity>();

        //构造后，用法后普通指针一模一样
        entity->Print()
    }
    
    std::cin.get();
}

```
输出结果
```
Created Entity!!!
Destroyed Entity!!!
```
作用域结束后，该对象被自动销毁。

##  野指针的产生原因，解决方法

# Shared Pointer
# Make_Shared< T >(args)(返回一个智能指针)

## Shared_Ptr< T >p (q)
## p.unique();

## p.use_count();慢，用于调试

**特点：引用计数**
- 特别的内存：控制块.但其他内存管理多少也会分配内存。

```c++
int main()
{
    {

        std::shared_ptr<Entity> e0;
        {
            //处于异常安全的考虑，可以使用这种构造方式
            std::Shared_ptr<Entity> entity = std::make_shared<Entity>();

            //可以拷贝
            std::shared_ptr<Entity> e0 = sharedEntity;

            //可以编译，但这么用效率太低，new创建内存后，还要控制块重新分配一次内存。一些公司为了不要new，甚至会把new运算符删除掉。 
            std::share_ptr<Entity> entity(new Entity());
    
            //构造后，用法后普通指针一模一样
            entity->Print()
        }

    }
    std::cin.get();
}
```

```c++

int main()
{
    {

        std::shared_ptr<Entity> e0;
        {
            //第一个回车后并没有显示destoryd，虽然这个指针已经死去。
            std::Shared_ptr<Entity> entity = std::make_shared<Entity>();

            std::weak_ptr<Entity> weakEntity = sharedEntity();
            //可以拷贝
            e0 = sharedEntity;
        }
        //第二回车后，e0死去，这样所有的指针都死去，便释放内存

    }
    std::cin.get();
}

```

第一个回车后并没有 destoryd，

## 问题

- 如果 a 指向 b，b 指向 a。就会造成类似死锁的问题

## weak_ptr
- 弱指针，指向一个 share_ptr 管理的对象。
- 不会修改引用计数，只是用来观察
- 用 lock 可以转换为智能指针。

```c++

int main()
{
    {

        std::shared_ptr<Entity> e0;
        {
            //第一个回车后并没有显示destoryd，虽然这个指针已经死去。
            std::Shared_ptr<Entity> sharedEntity = std::make_shared<Entity>();

            std::weak_ptr<Entity> weakEntity = sharedEntity;
            //可以拷贝
            e0 = sharedEntity;
        }
        //第二回车后，e0死去，这样所有的指针都死去，便释放内存

    }
    std::cin.get();
}
```

# 一些其他问题
![[Pasted image 20240320145533.png]]
