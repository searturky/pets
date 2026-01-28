import { _decorator, Component, Node, Sprite, SpriteFrame, Button, EditBox, tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('LoginPanel')
export class LoginPanel extends Component {
    @property(Node)
    loginContainer: Node = null!; // 登录表单容器（含账号、密码）

    @property(Node)
    registerContainer: Node = null!; // 注册表单容器（含账号、密码、确认、昵称）

    @property(Button)
    loginTabBtn: Button = null!; // 登录 Tab 按钮的 Sprite 组件

    @property(Button)
    registerTabBtn: Button = null!; // 注册 Tab 按钮的 Sprite 组件

    @property(SpriteFrame)
    tabActiveSprite: SpriteFrame = null!; // 激活状态的像素图片 (switch_tab_active)

    @property(SpriteFrame)
    tabInactiveSprite: SpriteFrame = null!; // 未激活状态的像素图片 (switch_tab_inactive)

    @property(EditBox)
    registerUsernameInput: EditBox = null!;

    start() {
        // 初始状态：默认显示登录
        this.switchTab(null, 'login');
    }

    // 点击事件的回调函数
    // 在编辑器里给 Login Tab 按钮添加 Click Event，CustomEventData 填 'login'
    // 给 Register Tab 按钮添加 Click Event，CustomEventData 填 'register'
    switchTab(event: Event | null, tabName: string) {
        console.log('switchTab', tabName);
        const loginSprite = this.loginTabBtn.getComponent(Sprite);
        const registerSprite = this.registerTabBtn.getComponent(Sprite);
        if (tabName === 'login') {
            // 显示/隐藏 容器
            this.loginContainer.active = true;
            this.registerContainer.active = false;

            loginSprite.spriteFrame = this.tabActiveSprite;
            registerSprite.spriteFrame = this.tabInactiveSprite;

        } else if (tabName === 'register') {
            this.loginContainer.active = false;
            this.registerContainer.active = true;

            loginSprite.spriteFrame = this.tabInactiveSprite;
            registerSprite.spriteFrame = this.tabActiveSprite;
        }
        
        // 像素风加成：切换时可以放一个清脆的“滴”音效
        // AudioSource.playOneShot(...);
    }

    onLoginBtnClick(event: Event | null) {
        console.log('onLoginBtnClick');
    }

    onRegisterBtnClick(event: Event | null) {
        console.log('onRegisterBtnClick');
    }

    /**
     * 当注册用户名文本发生改变时触发的回调
     */
    onRegisterUsernameTextChanged(text: string, editbox: EditBox) {
        // 使用正则过滤：只保留数字、字母和下划线
        // \u4e00-\u9fa5 是常见中文字符范围，我们直接用反向逻辑
        let filteredText = text.replace(/[^\w]/g, ''); 

        if (text !== filteredText) {
            // 强制更新：先失焦再设值再聚焦
            console.warn("仅限输入字母、数字和下划线！");
            
            // 方法1：强制刷新
            editbox.blur();
            editbox.string = filteredText;
            
            // 延迟重新聚焦
            this.scheduleOnce(() => {
                editbox.focus();
            }, 0);
            shakeNode(this.registerUsernameInput.node);
        }
    }

    
}

/**
 * 让指定节点执行抖动动画
 * @param target 抖动的目标节点（你的输入框）
 */
export function shakeNode(target: Node) {
    // 1. 记录原始位置，防止连续触发导致位置偏移
    const originalPos = target.position.clone();
    
    // 2. 定义抖动强度（像素）
    const strength = 10;
    // 3. 定义单次抖动时间
    const duration = 0.05;

    // 4. 链式调用 Tween：中 -> 左 -> 右 -> 左 -> 右 -> 中
    tween(target)
        .to(duration, { position: new Vec3(originalPos.x - strength, originalPos.y, 0) })
        .to(duration, { position: new Vec3(originalPos.x + strength, originalPos.y, 0) })
        .to(duration, { position: new Vec3(originalPos.x - strength * 0.7, originalPos.y, 0) }) // 强度衰减
        .to(duration, { position: new Vec3(originalPos.x + strength * 0.7, originalPos.y, 0) })
        .to(duration, { position: originalPos }) // 回到原点
        .start();
}

