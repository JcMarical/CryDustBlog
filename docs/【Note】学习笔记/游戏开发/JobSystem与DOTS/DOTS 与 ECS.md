# 计组前置知识



# Archetypes原型
组件类型的一个组合
# Memory Chunks内存块
ECS以“块”分配内存，每个块均由一个ArchetypeChunk对象表示。块始终包含单个原型的多个实体。

内存块已满时，ECS会为使用相同原型创建的任何新实体分配新的内存块。如果添加或删除组件，然后更改了实体原型，则ECS会将该实体的组件移动到其他块中。

# Entity queries（实体查询）
- All-全部 ：原型必须包含“全部”类别中的所有组件类型。
- Any-任意 ：原型必须包含“任意”类别中的至少一种组件类型。
- None-无 ：原型在“无”类别中不得包含任何组件类型。

# Jobs


## System organization（系统组织）

## ECS authoring（ECS创作）