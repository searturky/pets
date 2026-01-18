import { _decorator, Component, Sprite, SpriteFrame, AudioSource, sys, log } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GlobalAudioToggle')
export class GlobalAudioToggle extends Component {

    @property(SpriteFrame)
    public audioOnSprite: SpriteFrame = null!; // 全部开启时的图标

    @property(SpriteFrame)
    public audioOffSprite: SpriteFrame = null!; // 全部静音时的图标

    @property(AudioSource)
    public bgmSource: AudioSource = null!; // 背景音乐组件

    @property(AudioSource)
    public sfxSource: AudioSource = null!; // 音效组件（负责播放点击、爆炸等）

    private _isMuted: boolean = false;
    private readonly STORAGE_KEY = 'GAME_AUDIO_MUTED'; // 用于本地保存

    start() {
        // // 从本地存储读取设置，确保玩家下次打开游戏时状态一致
        const savedMute = sys.localStorage.getItem(this.STORAGE_KEY);
        this._isMuted = savedMute === 'true';

        this.applyAudioSettings();
    }

    /**
     * 按钮点击事件
     */
    public onToggleClick() {
        log("onToggleClick");
        this._isMuted = !this._isMuted;
        
        // 保存状态到本地
        sys.localStorage.setItem(this.STORAGE_KEY, this._isMuted.toString());

        this.applyAudioSettings();
    }

    private applyAudioSettings() {
        // 同时控制 BGM 和 SFX 的静音状态
        if (this.bgmSource) {
            this.bgmSource.volume = this._isMuted ? 0 : 1;
        }
        if (this.sfxSource) {
            this.sfxSource.volume = this._isMuted ? 0 : 1;
        }

        // 更新 UI 图标
        const sprite = this.getComponent(Sprite);
        if (sprite) {
            sprite.spriteFrame = this._isMuted ? this.audioOffSprite : this.audioOnSprite;
        }
        
        console.log(this._isMuted ? "全域静音" : "声音已开启");
    }
}