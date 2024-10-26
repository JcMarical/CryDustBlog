![](res/Pasted%20image%2020241022162957.png)



# Input Reader
存为SO，作为输入的可控制资产进行管理
+ 输入开关
+ 快速切换输入配置
+ 提供输入事件回调
```C#
[CreateAssetMenu(menuName = "InputReader")]
public class InputReader : ScriptableObject，GameImput.IGameplayActions, GameInput.IUIActions
{
	private GameInput _gameInput;
	
	private void OnEnable()
	{
		if(_gameInput = null)
		{
			_gameInput = new GameInput();

			_gameInput.Gameplay.SetCallbacks(this);
			_gameInput.UI.SetCallbacks(this);

			SetGameplay();
		}
	}


	//提供不同输入的快速切换
	public void SetGameplay()
	{
		_gameInput.Gameplay.Enable();
		_gameInput.UI.Disable();
	}

	public void SetUI()
	{
		_gameInput.Gameplay.Disable();
		_gameInput.UI.Enable();
	}

	public event Action<Vector2> MoveEvent;

	public event Action<> JumpEvent;
	public event Action<> JumpCancelledEvent;

	public event Action PauseEvent;


	//输入接口的实现,并调用被注册的有关函数
	public void OnMove(InputAction.CalllbackContext context)
	{
		
		MoveEvent?.Invoke(context.ReadValue<Vector2>());
		Debuf.Log($"Phase:{context.phase}",Value:{context.ReadValue<Vector2>()});
	}

	//同一输入的不同阶段区分
	public void OnJump(InputAction.CallbackContext context)
	{
		if(context.phase == InputActionPhase.Performed)
		{
			JumpEvent?.Invoke();
		}
		if(context.phase == InputActionPhase.Canceled)
		{
			JumpCancelledEvent?.Invoke();
		}
	}

}
```


# PlayerController 脚本实现
角色快速使用:直接将方法注册到事件
```c#
public class PlayerController : MonoBehaviour
{
	[SerializeField] private InputReader input;

	private void start()
	{
		input.MoveEvent += HandleMove;
		input.JumpEvent += HandleJump;
		input.JumpCancelledEvent += HandleCancelledJump;
	}
}
```