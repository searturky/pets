import { _decorator, Component, Node, Sprite, SpriteFrame, Button, EditBox, tween, Vec3, Prefab, Tween } from 'cc';
import { UIManager } from '../UIManager';
import { httpClient } from '../net/HttpClient';
import { ApiResponse } from '../net/ApiResponse';
import { UserManager, UserInfo } from '../core/UserManager';
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

    @property(EditBox)
    registerPasswordInput: EditBox = null!;

    @property(EditBox)
    registerPasswordConfirmInput: EditBox = null!;

    @property(EditBox)
    registerNicknameInput: EditBox = null!;

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
        const target = event?.target;
        this.playButtonClickEffect(target instanceof Node ? target : null);
    }

    async onRegisterBtnClick(event: Event | null) {
        console.log('onRegisterBtnClick');
        const target = event?.target;
        this.playButtonClickEffect(target instanceof Node ? target : null);
        if (this.validateRegister()) {
            try {
                const response = await httpClient.post<{ token: string; userInfo: UserInfo }>('/auth/register', {
                    username: this.registerUsernameInput.string,
                    password: this.registerPasswordInput.string,
                    nickname: this.registerNicknameInput.string,
                });
                console.log('response', response);
                if (response.code === 0 && response.data?.token) {
                    UserManager.getInstance().setAuth(response.data.token, response.data.userInfo);
                    httpClient.setAuthToken(response.data.token);
                }
                UIManager.getInstance().showTip('注册成功');
            } catch (error) {
                console.error('error', error);
                UIManager.getInstance().showTip('注册失败');
            }
        }
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

    validateUsername(username: string) {
        if (username.length < 6 || username.length > 20) {
            UIManager.getInstance().showTip("用户名长度为6-20位！");
            return false;
        }
        // 使用正则过滤：只保留数字、字母和下划线
        // \u4e00-\u9fa5 是常见中文字符范围，我们直接用反向逻辑
        let filteredText = username.replace(/[^\w]/g, ''); 

        if (username !== filteredText) {
            UIManager.getInstance().showTip("仅限输入字母、数字和下划线！");
            return false;
        }
        return true;
    }

    validatePassword(password: string, passwordConfirm: string) {
        if (password.length < 6 || password.length > 32 || passwordConfirm.length < 6 || passwordConfirm.length > 32) {
            UIManager.getInstance().showTip("密码长度为6-32位！");
            return false;
        }
        if (password !== passwordConfirm) {
            UIManager.getInstance().showTip("密码不一致！");
            return false;
        }
        return true;
    }

    validateNickname(nickname: string) {
        if (nickname.length < 2 || nickname.length > 20) {
            UIManager.getInstance().showTip("昵称长度为2-20位！");
            return false;
        }
        return true;
    }

    validateRegister() {
        const username = this.registerUsernameInput.string;
        const password = this.registerPasswordInput.string;
        const passwordConfirm = this.registerPasswordConfirmInput.string;
        const nickname = this.registerNicknameInput.string;

        if (
            !this.validateUsername(username) || 
            !this.validatePassword(password, passwordConfirm) || 
            !this.validateNickname(nickname)
        ) {
            return false;
        }
        return true;
    }

    private async playButtonClickEffect(target: Node | null) {
        if (!target) {
            return;
        }

        Tween.stopAllByTarget(target);
        const originalScale = target.scale.clone();
        tween(target)
            .to(0.06, { scale: new Vec3(originalScale.x * 0.95, originalScale.y * 0.95, originalScale.z) })
            .to(0.06, { scale: originalScale })
            .start();
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

