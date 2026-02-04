import { _decorator, Component, Node, Label, Button, BlockInputEvents, tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

export interface TipModalConfig {
    title?: string;
    message?: string;
    showCloseButton?: boolean;
    clickMaskClose?: boolean;
    onClose?: () => void;
}

@ccclass('TipModal')
export class TipModal extends Component {
    @property(Label)
    messageLabel: Label = null!;

    @property(Label)
    titleLabel: Label = null!;

    @property(Node)
    modalContainer: Node = null!;

    @property(Button)
    closeButton: Button = null!;

    @property(Boolean)
    clickMaskClose: boolean = false;

    @property(Boolean)
    showCloseButton: boolean = true;

    private _onClose: (() => void) | null = null;
    private _originalScale: Vec3 = new Vec3(1, 1, 1);

    onLoad() {
        // 保存 modalContainer 的原始 scale
        if (this.modalContainer) {
            this._originalScale = this.modalContainer.scale.clone();
        }

        // 确保遮罩层有 BlockInputEvents 组件，阻止点击穿透
        if (!this.node.getComponent(BlockInputEvents)) {
            this.node.addComponent(BlockInputEvents);
        }

        // 绑定关闭按钮
        if (this.closeButton) {
            this.closeButton.node.on(Button.EventType.CLICK, this.close, this);
        }

        // 点击遮罩层也能关闭（可选）
        if (this.clickMaskClose) {
            this.node.on(Node.EventType.TOUCH_END, this.onMaskClick, this);
        }
    }

    /**
     * 显示提示框
     * @param message 提示文本
     * @param callback 关闭后的回调
     */
    show(config: TipModalConfig = {
        title: '',
        message: '',
        showCloseButton: true,
        clickMaskClose: false,
        onClose: () => {},
    }) {
        this.messageLabel.string = config.message || '';
        this.titleLabel.string = config.title || '';
        this.closeButton.node.active = config.showCloseButton || true;
        this.clickMaskClose = config.clickMaskClose || false;
        this._onClose = config.onClose || null;

        // 像素风格弹出动画：从小到大，略带回弹
        this.modalContainer.setScale(0, 0, 1);
        tween(this.modalContainer)
            .to(0.2, { 
                scale: new Vec3(
                    this._originalScale.x * 1.1, 
                    this._originalScale.y * 1.1, 
                    1
                ) 
            }, { easing: 'backOut' })
            .to(0.1, { scale: this._originalScale })
            .start();
    }

    /**
     * 关闭提示框
     */
    close() {
        console.log('close');
        // 像素风格关闭动画：缩小消失
        tween(this.modalContainer)
            .to(0.15, { scale: new Vec3(0, 0, 1) }, { easing: 'backIn' })
            .call(() => {
                if (this._onClose) {
                    this._onClose();
                }
                this.node.active = false;
                // this.node.destroy();
            })
            .start();
    }

    /**
     * 点击遮罩层关闭（可选功能）
     */
    private onMaskClick(event: any) {
        // 只有点击遮罩层本身才关闭，点击模态框内部不关闭
        if (event.target === this.node && this.clickMaskClose) {
            this.close();
        }
    }

    onDestroy() {
        if (this.closeButton?.node) {
            this.closeButton.node?.off(Button.EventType.CLICK, this.close, this);
        }
        this.node.off(Node.EventType.TOUCH_END, this.onMaskClick, this);
    }
}