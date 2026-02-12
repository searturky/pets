// UIManager.ts
import { _decorator, Component, Node, director, Prefab, instantiate, resources, UITransform, Canvas, Widget, view } from 'cc';
import { TipModal, TipModalConfig } from './TipModal';

export class UIManager {
    private static _instance: UIManager = null;
    private uiRoot: Node = null;
    private tipModalPrefab: Prefab = null;
    private tipModalInstance: Node = null;
    
    static getInstance(): UIManager {
        if (!this._instance) {
            this._instance = new UIManager();
            this._instance.init();
        }
        return this._instance;
    }
    
    private init() {
        // 创建独立的常驻 UI 根节点
        this.uiRoot = new Node('UIRoot');
        
        // 1. 先添加 UITransform 组件（必须在 Canvas 之前）
        const uiTransform = this.uiRoot.addComponent(UITransform);
        
        // 2. 获取设计分辨率
        const designResolution = view.getDesignResolutionSize();
        
        // 3. 设置 UITransform 尺寸和锚点
        uiTransform.setContentSize(designResolution.width, designResolution.height);
        uiTransform.setAnchorPoint(0.5, 0.5); // 锚点在中心
        
        // 4. 设置节点位置（锚点在中心时，位置应该是设计分辨率的一半）
        this.uiRoot.setPosition(
            designResolution.width / 2,
            designResolution.height / 2,
            0
        );
        
        // 5. 添加 Canvas 组件
        const canvas = this.uiRoot.addComponent(Canvas);
        canvas.node.setSiblingIndex(999); // 确保在最上层渲染

        const widget = this.uiRoot.addComponent(Widget);
        widget.isAlignTop = true;
        widget.isAlignBottom = true;
        widget.isAlignLeft = true;
        widget.isAlignRight = true;
        widget.top = 0;
        widget.bottom = 0;
        widget.left = 0;
        widget.right = 0;
        
        // 6. 设置为常驻节点（关键！场景切换不销毁）
        director.addPersistRootNode(this.uiRoot);
        
        console.log('UIRoot 初始化完成', {
            designResolution: { width: designResolution.width, height: designResolution.height },
            contentSize: { width: uiTransform.contentSize.width, height: uiTransform.contentSize.height },
            anchorPoint: { x: uiTransform.anchorPoint.x, y: uiTransform.anchorPoint.y },
            position: { x: this.uiRoot.position.x, y: this.uiRoot.position.y, z: this.uiRoot.position.z },
            hasCanvas: !!canvas
        });
        
        // 加载预制体资源
        resources.load('prefabs/TipModal', Prefab, (err, prefab) => {
            if (err) {
                console.error('加载 TipModal 失败:', err);
                return;
            }
            this.tipModalPrefab = prefab;
            console.log('TipModal prefab 加载成功');
        });
    }
    
    showTip(config: TipModalConfig = {
        title: '',
        message: '',
        onClose: () => {},
        showCloseButton: true,
        clickMaskClose: false,
    }) {
        
        if (!this.tipModalPrefab) {
            console.error('tipModalPrefab 还未加载完成');
            return;
        }
        
        if (!this.tipModalInstance) {
            this.tipModalInstance = instantiate(this.tipModalPrefab);
            this.uiRoot.addChild(this.tipModalInstance);
        }
        
        const tipModal = this.tipModalInstance.getComponent(TipModal);
        this.tipModalInstance.active = true;
        tipModal.show(config);
    }

    hideTip() {
        if (this.tipModalInstance) {
            this.tipModalInstance.active = false;
        }
    }
}