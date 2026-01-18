import { _decorator, Component, Node, tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('LogoAnimation')
export class LogoAnimation extends Component {

    start() {
        this.playFloatingAnimation();
    }

    playFloatingAnimation() {
        // 让 Logo 产生上下漂浮的视觉效果
        tween(this.node)
            .by(2, { position: new Vec3(0, 20, 0) }, { easing: 'sineInOut' }) // 2秒内向上移动20像素
            .by(2, { position: new Vec3(0, -20, 0) }, { easing: 'sineInOut' }) // 2秒内向下回到原位
            .union()   // 将上下动作打包
            .repeatForever() // 无限循环
            .start();
    }
}