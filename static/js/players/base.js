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

        //每个状态的动作, 使用Map可以方便的存储多个动作
        this.animations = new Map();

        //当前记录的帧数
        this.frame_current_cnt = 0;
    }

    start() {}

    //人物移动
    update_move() {
        //这里需要特判，否则在 跳起落地时，就会落入地面，有割裂感
        if (this.status === 3) {
            //模拟重力加速度
            this.vy += this.gravity;
        }

        //由于时间timedelta单位为毫秒，所以需要除以1000
        this.x += (this.vx * this.timedelta) / 1000; //s=v*t 计算移动距离
        this.y += (this.vy * this.timedelta) / 1000;

        //游戏人物在掉落到地面就停止，否则会直接掉落到地图外
        if (this.y > 470) {
            this.y = 470;
            this.vy = 0;

            //掉落到地面，改变人物状态 从跳跃 到 静止
            if (this.status === 3) {
                this.status = 0;
            }
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
        if (this.id === 0) {
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
        if (this.status === 0 || this.status === 1 || this.status === 2) {
            //攻击状态
            if (space) {
                this.status = 4;
                this.vx = 0;
                //重新渲染
                this.frame_current_cnt = 0;
            }
            //跳跃两次是因为刷新的太快了，在下面使用frame_rate 来调整就可以了
            else if (w) {
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
                this.status = 3;
                //this.frame_current_cnt = 0;

                //帧回位，每次都从头开始播放帧动画
                this.frame_current_cnt = 0;
            } else if (d) {
                // 移动
                this.vx = this.speedx;
                this.status = 1;
            } else if (a) {
                //移动
                this.vx = -this.speedx;
                this.status = 2; //这里写为1也可以
            } else {
                //没有移动

                //非跳跃状态
                // if (this.status === 0) {
                //     //没有移动时一定要修改速度为0，否则会一直延续速度移动
                //     this.vx = 0;
                // }
                this.vx = 0;
                this.status = 0;
            }
        }
    }

    //调整人物方西
    update_direction() {
        let players = this.root.players;
        if (players[0] && players[1]) {
            let me = this;
            let you = players[1 - this.id]; //一个为0 一个为1，总和为1，所以直接减就可以得到另外一个了

            //判断朝向
            if (me.x < you.x) {
                me.direction = 1;
            } else {
                me.direction = -1;
            }
        }
    }

    update() {
        //人物移动
        this.update_control();
        this.update_move();
        //更新人物方向
        this.update_direction();

        //每次刷新人物
        this.render();
    }

    render() {
        //参考绘制一个矩形：https://developer.mozilla.org/zh-CN/docs/Web/API/Canvas_API/Tutorial/Drawing_shapes
        //将人物简化为矩形
        // this.ctx.fillStyle = this.color;
        // this.ctx.fillRect(this.x, this.y, this.width, this.height);
        //console.log(this.width);

        //渲染人物
        let status = this.status;
        //console.log(status);
        let obj = this.animations.get(status);

        //前进方向与速度方向不同时，即为后退
        // 这里由于上面在状态中识别了 状态1和2，所以这里就不需要再特判了
        // if (this.status === 1 && this.direction * this.vx < 0) {
        //     status = 2;
        // }

        // 成功获取到人物 且 人物已经被加载
        if (obj && obj.loaded) {
            //正方向
            if (this.direction > 0) {
                //通过frame_rate 来调整每秒刷新的图片数，这样就不会出现人物在跳跃时刷新人物，造成再次跳跃了
                let k =
                    parseInt(this.frame_current_cnt / obj.frame_rate) %
                    obj.frame_cnt;
                let image = obj.gif.frames[k].image;
                //console.log("image " + image);
                this.ctx.drawImage(
                    image,
                    this.x,
                    this.y + obj.offset_y, //由于动画高度不同，如果没有偏移量会导致人物在移动时与静止时不在同一水平线上
                    image.width * obj.scale, //通过scale 这个缩放比例实现人物的缩放
                    image.height * obj.scale
                );
            } else {
                //反方向

                //保存当前坐标系配置
                this.ctx.save();
                //x轴水平翻转
                this.ctx.scale(-1, 1);
                //平移
                this.ctx.translate(-this.root.game_map.$canvas.width(), 0);

                //通过frame_rate 来调整每秒刷新的图片数，这样就不会出现人物在跳跃时刷新人物，造成再次跳跃了
                let k =
                    parseInt(this.frame_current_cnt / obj.frame_rate) %
                    obj.frame_cnt;
                let image = obj.gif.frames[k].image;
                //console.log("image " + image);
                this.ctx.drawImage(
                    image,
                    this.root.game_map.$canvas.width() - this.x - this.width,
                    this.y + obj.offset_y, //由于动画高度不同，如果没有偏移量会导致人物在移动时与静止时不在同一水平线上
                    image.width * obj.scale, //通过scale 这个缩放比例实现人物的缩放
                    image.height * obj.scale
                );

                //恢复之前的坐标系配置
                this.ctx.restore();
            }
        }
        // console.log(status);
        //console.log("get " + this.animations.get(status));

        //攻击状态在渲染完后，需要终止，状态转换为静止
        if (status === 4) {
            //攻击状态 渲染到最后一帧了，如果这里不限制，就会再播放第一帧，导致闪一下
            if (
                parseInt(this.frame_current_cnt / obj.frame_rate) ===
                obj.frame_cnt - 1
            ) {
                this.status = 0;
                this.frame_current_cnt = 0;
                console.log(this.status);
            }
        }

        this.frame_current_cnt++;
    }
}
//这里可以将两个简化为 export class Player extends GameObject{ }
export { Player };
