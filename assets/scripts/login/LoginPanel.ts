import { _decorator, Component, Node, Sprite, SpriteFrame, Button } from 'cc';
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
}

