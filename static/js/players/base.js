import { GameObject } from "../game_object/base.js";
import { Controller } from "../controller/base.js";

class Player extends GameObject {
    constructor(root, info) {
        super();

        this.root = root;
        //区分角色
        this.id = info.id;
        this.x = info.x;
        this.y = info.y;
        this.width = info.width;
        this.height = info.height;
        this.color = info.color; //先用颜色表示

        //人物前进的方向
        this.direction = 1; //正方向为1，负方向为0

        //速度
        this.vx = 0;
        this.vy = 0;

        //这里就控制每次水平和竖直移动的大小
        this.speedx = 400; //初始水平速度
        //向上跳跃，为 负方向
        this.speedy = -1000; //初始竖直跳跃速度

        //模拟 人物初始下落的重力
        this.gravity = 50;

        this.ctx = this.root.game_map.ctx;
        //按下按键
        this.pressed_keys = this.root.game_map.controller.pressed_keys;

        // 人物状态简单分为：0 idle； 1 前进； 2 后退； 3 跳跃； 4 攻击； 5被打； 6死亡
        this.status = 3; //初始时掉落到地面，为跳跃状态
    }

    start() {}

    //人物移动
    update_move() {
        //模拟重力加速度
        this.vy += this.gravity;

        //由于时间timedelta单位为毫秒，所以需要除以1000
        this.x += (this.vx * this.timedelta) / 1000; //s=v*t 计算移动距离
        this.y += (this.vy * this.timedelta) / 1000;

        //游戏人物在掉落到地面就停止，否则会直接掉落到地图外
        if (this.y > 470) {
            this.y = 470;
            this.vy = 0;

            //掉落到地面，改变人物状态 从跳跃 到 静止
            this.status = 0;
        }

        //对水平方向移动的限制, 这里允许超出地图10px
        if (this.x < -10) {
            this.x = 0;
        } else if (
            this.x + this.width >
            this.root.game_map.$canvas.width() + 10
        ) {
            this.x = this.root.game_map.$canvas.width() + 10 - this.width;
        }
    }

    //人物控制函数
    update_control() {
        let w, a, d, space; //这里没有实现s键的下蹲
        if (this.id == 0) {
            //玩家1
            w = this.pressed_keys.has("w");
            a = this.pressed_keys.has("a");
            d = this.pressed_keys.has("d");
            space = this.pressed_keys.has(" ");
        } else {
            //玩家2
            w = this.pressed_keys.has("ArrowUp");
            a = this.pressed_keys.has("ArrowLeft");
            d = this.pressed_keys.has("ArrowRight");
            space = this.pressed_keys.has("Enter");
        }

        //静止或移动时，可以跳跃
        if (this.status === 0 || this.status === 1) {
            if (w) {
                //向移动方向跳跃
                if (d) {
                    //正方向跳跃
                    this.vx = this.speedx;
                } else if (a) {
                    //反方向跳跃
                    this.vx = -this.speedx;
                } else {
                    this.vx = 0;
                }
                //竖直方向上速度不变
                this.vy = this.speedy;

                //状态改变
                this.status = 2;
            } else if (d) {
                // 移动
                this.vx = this.speedx;
                this.status = 1;
            } else if (a) {
                //移动
                this.vx = -this.speedx;
                this.status = 1;
            } else {
                //没有移动

                //非跳跃状态
                if (this.status === 0) {
                    //没有移动时一定要修改速度为0，否则会一直延续速度移动
                    this.vx = 0;
                }

                this.status = 0;
            }
        }
    }

    update() {
        //人物移动
        this.update_control();
        this.update_move();

        //每次刷新人物
        this.render();
    }

    render() {
        //参考绘制一个矩形：https://developer.mozilla.org/zh-CN/docs/Web/API/Canvas_API/Tutorial/Drawing_shapes
        //将人物简化为矩形
        this.ctx.fillStyle = this.color;
        this.ctx.fillRect(this.x, this.y, this.width, this.height);
        //console.log(this.width);
    }
}
//这里可以将两个简化为 export class Player extends GameObject{ }
export { Player };
