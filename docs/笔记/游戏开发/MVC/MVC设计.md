![[Pasted image 20250103191200.png]]

# Model数据脚本
model层主要是为了处理数据，一般分为下面几个部分
- 数据内容
- 数据相关的操作
	- 初始化
	- 更新(比如升级)
	- 保存
- 通知外部更新数据：
	- 事件
	- 增添删除事件的方法
	- 执行事件
- 单例提供获取途径
```c++
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Events;

/// <summary>
/// 作为一个唯一的数据模型，一般情况，要不自己是个单例模式对象
/// 要不自己存储在一个单例模式对象中
/// </summary>
public class PlayerModel 
{
    // 数据内容
    private string playerName;

    //使用属性包裹，可以获取不可修改，更加安全
    public string PlayerName
    {
        get
        {
            return playerName;
        }
    }
    private int lev;

    //再设置个Lev，后续就省略了
    public int Lev
    {
        get
        {
            return lev;
        }
    }
    private int money;
    private int gem;
    private int power;

    private int hp;
    private int atk;
    private int def;
    private int crit;
    private int miss;
    private int luck;

    //通知外部更新的事件
    //通过它和外部建立联系，而不是直接获取外部的面板
    private event UnityAction<PlayerModel> updateEvent;


    //在外部第一次获取这个数据，如何获取
    private static PlayerModel data = null;

    public static PlayerModel Data
    {
        get
        {
            if(data == null)
            {
                data = new PlayerModel();
                data.Init();
            }
            return data;
        }
    }

    // 数据相关的操作
    // 初始化
    public void Init()
    {
        playerName = PlayerPrefs.GetString("PlayerName", "CryDust");
        lev = PlayerPrefs.GetInt("PlayerLev", 1);
        money = PlayerPrefs.GetInt("PlayerMoney", 9999);
        gem = PlayerPrefs.GetInt("PlayerGem", 8888);
        power = PlayerPrefs.GetInt("PlayerPower", 99);

        hp = PlayerPrefs.GetInt("PlayerHp", 100);
        atk = PlayerPrefs.GetInt("PlayerAtk", 20);
        def = PlayerPrefs.GetInt("PlayerDef", 10);
        crit = PlayerPrefs.GetInt("PlayerCrit", 20);
        miss = PlayerPrefs.GetInt("PlayerMiss", 10);
        luck = PlayerPrefs.GetInt("PlayerLuck", 40);
    }

    // 更新 升级
    public void LevUp()
    {
        lev += 1;

        hp += lev;
        atk += lev;
        def += lev;

        crit += lev;
        miss += lev;
        luck += lev;

        //可以选择：更新后是否保存
        SaveData();
    }


    // 保存
    public void SaveData()
    {
        PlayerPrefs.SetString("PlayerName", playerName);
        PlayerPrefs.SetInt("PlayerLev", lev);
        PlayerPrefs.SetInt("PlayerMoney", money);
        PlayerPrefs.SetInt("PlayerGem", gem);
        PlayerPrefs.SetInt("PlayerPower", power);

        PlayerPrefs.SetInt("PlayerHp", hp);
        PlayerPrefs.SetInt("PlayerAtk", atk);
        PlayerPrefs.SetInt("PlayerDef", def);
        PlayerPrefs.SetInt("PlayerCrit", crit);
        PlayerPrefs.SetInt("PlayerMiss", miss);
        PlayerPrefs.SetInt("PlayerLuck", luck);
    }

    //通知外部更新数据的方法
    public void AddEventListener(UnityAction<PlayerModel> function)
    {
        updateEvent += function;
    }

    public void RemoveEventListener(UnityAction<PlayerModel> function)
    {
        updateEvent -= function;
    }

    private void UpdateInfo()
    {
        //找到对应的 使用数据的脚本 去更新数据
        if(updateEvent != null)
        {
            updateEvent(this);
        }
    }
}

```


# View层界面脚本
view层主要就负责界面的交互，主要负责两件事。在Unity中我们要挂的也是这个脚本
1.找控件
2.提供面板更新的相关方法给外部
3.提供事件供外部绑定（由于UGUI自带事件绑定，脚本里就不单独写）
MainView
```c#
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class MainView : MonoBehaviour
{
    //1.找控件
    public Button btnRole;
    public Button btnSill;

    public Text txtName;
    public Text txtLev;
    public Text txtMoney;
    public Text txtGem;
    public Text txtPower;

    //2.提供面板更新的相关方法给外部

    public void UpdateInfo (PlayerModel data)
    {
        txtName.text = data.PlayerName;
        txtLev.text = "LV." + data.Lev;
        txtMoney.text = data.Money.ToString();
        txtGem.text = data.Gem.ToString();
        txtPower.text = data.Power.ToString();

    }

}

```

RoleView
```c++
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class RoleView : MonoBehaviour
{
    //1.找控件
    public Button btnClose;
    public Button btnLevUp;

    public Text txtLev;
    public Text txtHp;
    public Text txtAtk;
    public Text txtDef;
    public Text txtCrit;
    public Text txtMiss;
    public Text txtLuck;

    //2.提供面板更新的相关方法给外部

    public void UpdateInfo(PlayerModel data)
    {
        txtLev.text = "LV." + data.Lev;
        txtHp.text = data.HP.ToString();
        txtAtk.text = data.Atk.ToString();
        txtDef.text = data.Def.ToString();
        txtCrit.text = data.Crit.ToString();
        txtMiss.text = data.Miss.ToString();
        txtLuck.text = data.Luck.ToString();
        

    }
}


```


# Controller业务逻辑脚本
逻辑控制的脚本,主要负责，也需要挂载到界面上面
- 界面显示隐藏
- 界面事件监听
- 界面的更新
	- Start：获取view并更新数据
maincontroller
```c++
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class MainController : MonoBehaviour
{
    //能够在Controller中得到界面才行
    private MainView mainView;

    public static MainController controller = null;
    public static MainController Controller
    {
        get { return controller; }
    }

    //1.界面的显隐

    public static void ShowMe()
    {
        if(controller == null)
        {
            GameObject res = Resources.Load<GameObject>("UI/MainPanel");
            GameObject obj = Instantiate(res);

            //设置它的父对象 为Canvas
            obj.transform.SetParent(GameObject.Find("Canvas").transform, false);
            controller = obj.GetComponent<MainController>();
        }

        //如果是隐藏的形式hide，在这要显示
        controller.gameObject.SetActive(true);

    }

    public static void HideMe()
    {
        if (controller == null)
        {
            controller.gameObject.SetActive(false);
        }
    }

    private void Start()
    {
        //获取同样挂载到一个对象上的view 脚本
        mainView = this.GetComponent<MainView>();
        //第一次的 界面更新
        mainView.UpdateInfo(PlayerModel.Data);

        //界面 事件的监听 用来处理对应的业务逻辑，UGUI已经提供事件绑定机制
        mainView.btnRole.onClick.AddListener(ClickRoleBtn);


        //绑定Model数据监听(注意：有加就有减)
        PlayerModel.Data.AddEventListener(UpdateInfo);
    }

    private void OnDestroy()
    {
        //注销事件
        PlayerModel.Data.RemoveEventListener(UpdateInfo);

    }

    private void ClickRoleBtn()
    {
        Debug.Log("点击按钮显示角色面板");
        //通过Controller去显示 角色面板
        RoleController.ShowMe();
    }

    //2.界面 事件的监听 用来处理对应的业务逻辑
    //3.界面的更新
    private void UpdateInfo(PlayerModel data)
    {
        if (mainView != null)
        {
            mainView.UpdateInfo(data);
        }
    }
}

```

# RoleController
```c#
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class MainController : MonoBehaviour
{
    //能够在Controller中得到界面才行
    private MainView mainView;

    public static MainController controller = null;
    public static MainController Controller
    {
        get { return controller; }
    }

    //1.界面的显隐

    public static void ShowMe()
    {
        if(controller == null)
        {
            GameObject res = Resources.Load<GameObject>("UI/MainPanel");
            GameObject obj = Instantiate(res);

            //设置它的父对象 为Canvas
            obj.transform.SetParent(GameObject.Find("Canvas").transform, false);
            controller = obj.GetComponent<MainController>();
        }

        //如果是隐藏的形式hide，在这要显示
        controller.gameObject.SetActive(true);

    }

    public static void HideMe()
    {
        if (controller == null)
        {
            controller.gameObject.SetActive(false);
        }
    }

    private void Start()
    {
        //获取同样挂载到一个对象上的view 脚本
        mainView = this.GetComponent<MainView>();
        //第一次的 界面更新
        mainView.UpdateInfo(PlayerModel.Data);

        //界面 事件的监听 用来处理对应的业务逻辑，UGUI已经提供事件绑定机制
        mainView.btnRole.onClick.AddListener(ClickRoleBtn);


        //绑定Model数据监听(注意：有加就有减)
        PlayerModel.Data.AddEventListener(UpdateInfo);
    }

    private void OnDestroy()
    {
        //注销事件
        PlayerModel.Data.RemoveEventListener(UpdateInfo);

    }

    private void ClickRoleBtn()
    {
        Debug.Log("点击按钮显示角色面板");
        //通过Controller去显示 角色面板
        RoleController.ShowMe();
    }

    //2.界面 事件的监听 用来处理对应的业务逻辑
    //3.界面的更新
    private void UpdateInfo(PlayerModel data)
    {
        if (mainView != null)
        {
            mainView.UpdateInfo(data);
        }
    }
}

```