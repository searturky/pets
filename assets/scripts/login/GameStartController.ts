import { _decorator, Component, Node, AudioSource, tween, Vec3, UIOpacity, sys } from 'cc';
const { ccclass, property } = _decorator;

const AUDIO_MUTED_KEY = 'GAME_AUDIO_MUTED'; // 与 GlobalAudioToggle 保持一致

@ccclass('GameStartController')
export class GameStartController extends Component {

    @property(AudioSource)
    public bgmSource: AudioSource = null!; // 拖入你的 BGM 节点

    @property(Node)
    public startMenuNode: Node = null!; // 拖入上面的 Start_Menu 节点

    @property(Node)
    public audioButton: Node = null!; // 拖入上面的 Audio_Button 节点

    start() {
    }

    /**
     * 当用户点击“开始游戏”图时触发
     */
    public onStartGame() {
        // 核心：通过用户点击，合法解锁音频上下文
        if (this.bgmSource) {
            // 检查用户之前的静音设置
            const isMuted = sys.localStorage.getItem(AUDIO_MUTED_KEY) === 'true';
            this.bgmSource.volume = isMuted ? 0 : 1;
            this.bgmSource.play(); 
            console.log(isMuted ? "音频权限已解锁，BGM 静音播放中" : "音频权限已解锁，BGM 开始播放");
        }

        // 动效：让界面淡出并缩放消失（10万美元级的细节）
        const uiOpacity = this.startMenuNode.getComponent(UIOpacity);
        
        tween(this.startMenuNode)
            .to(0.3, { scale: new Vec3(1.2, 1.2, 1) }) // 稍微放大
            .call(() => {
                this.startMenuNode.active = false; // 彻底关闭界面
                this.audioButton.active = true; // 显示开始按钮
            })
            .start();
        
        // 同时执行透明度动画
        if (uiOpacity) {
            tween(uiOpacity)
                .to(0.3, { opacity: 0 }) // 渐隐
                .start();
        }
    }

}