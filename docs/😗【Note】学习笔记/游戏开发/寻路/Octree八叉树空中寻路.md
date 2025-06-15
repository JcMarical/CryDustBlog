# 一、建立基础数据结构与包围盒

+ Octree 八叉树
	+ 根节点
	+ AABB包围盒
+ OctreeNode 八叉树节点
+ OctreeObject 八叉树物体

```c#
using UnityEngine;

namespace Octrees
{
    public class Octree
    {
        public OctreeNode root;

        // AABB盒
        public Bounds bounds;


        public Octree(GameObject[] worldObjects,float minNodeSize)
        {
            CalculateBounds(worldObjects);

        }
        void CalculateBounds(GameObject[] worldObjects)
        {
            foreach (GameObject obj in worldObjects)
            {
                //将碰撞器添加到边界中
                bounds.Encapsulate(obj.GetComponent<Collider>().bounds);
            }
            //得到一个正方体包围盒，取到最大
            Vector3 size = Vector3.one * Mathf.Max(bounds.size.x, bounds.size.y, bounds.size.z) * 0.5f;
            bounds.SetMinMax(bounds.center - size, bounds.center + size);

        }

    }
    public class OctreeNode
    {

    }

    public class OctreeObject
    {

    }


}
```
检测场景中的物体，自动生成包围盒：
![[Pasted image 20241105154007.png]]

# 二、OctreeNode
```c++
using System.Collections.Generic;
using UnityEngine;

namespace Octrees
{
    public class OctreeNode
    {
        public List<OctreeObject> objects = new();

        static int nextID;
        public readonly int id;

        //分为八叉
        public Bounds bounds;
        Bounds[] childBounds = new Bounds[8];
        public OctreeNode[] children;

        //是否为叶子结点
        public bool IsLeaf => children == null;

        float minNodeSize;

        public OctreeNode(Bounds bounds, float minNodeSize)
        {
            //自增id实现id创建的不重复
            id = nextID++;

            this.bounds = bounds;
            this.minNodeSize = minNodeSize;
            Vector3 newSize = bounds.size * 0.5f; // 一半大小
            Vector3 centerOffset = bounds.size * 0.25f; //中心位置：1/4大小
            Vector3 parentCenter = bounds.center;

			//根据id分配子中心位置
            for(int i = 0; i < 8; i++)
            {
                Vector3 childCenter = parentCenter;
                childCenter.x += centerOffset.x * ((i & 1) == 0? -1 : 1); //
                childCenter.x += centerOffset.x * ((i & 2) == 0? -1 : 1); //
                childCenter.x += centerOffset.x * ((i & 4) == 0? -1 : 1); //

                childBounds[i] = new Bounds(childCenter, newSize);


            }
        }

        public void DrawNode()
        {
            Gizmos.color = Color.green;
            foreach(Bounds childBound in childBounds)
            {
                Gizmos.DrawWireCube(childBound.center, childBound.size * 0.95f);
            }
        }

    }


}
```