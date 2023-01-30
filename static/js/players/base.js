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

        //生命值
        this.hp = 100;
    }

    start() {}

    //人物移动
    update_move() {
        //这里需要特判，否则在 跳起落地时，就会落入地面，有割裂感
        //模拟重力加速度
        this.vy += this.gravity;

        //由于时间timedelta单位为毫秒，所以需要除以1000
        this.x += (this.vx * this.timedelta) / 1000; //s=v*t 计算移动距离
        this.y += (this.vy * this.timedelta) / 1000;

        //人物重叠，人物可以叠罗汉
        // let [a, b] = this.root.players;
        // let r1 = {
        //     x1: a.x,
        //     y2: a.y,
        //     x2: a.x + this.width,
        //     y2: a.y + this.height,
        // };
        // let r2 = {
        //     x1: b.x,
        //     y1: b.y,
        //     x2: b.x + b.width,
        //     y2: b.y + this.height,
        // };
        // if (this.is_collision(r1, r2)) {
        //     this.x -= (this.vx * this.timedelta) / 1000;
        //     this.y -= (this.vy * this.timedelta) / 1000;
        //     if (this.status === 3) {
        //         this.status = 0;
        //     }
        // }

        //人物互相推
        let [a, b] = this.root.players;
        if (a != this) {
            [a, b] = [b, a];
        }
        let r1 = {
            x1: a.x,
            y2: a.y,
            x2: a.x + this.width,
            y2: a.y + this.height,
        };
        let r2 = {
            x1: b.x,
            y1: b.y,
            x2: b.x + b.width,
            y2: b.y + this.height,
        };

        let players = this.root.players;
        let me = this;
        let you = players[1 - this.id];
        //这里需要特判对方的状态，如果对方已经死亡，就不能再对顶了
        if (this.is_collision(r1, r2) && you.status != 6) {
            //先按下的会顶着后按下的移动一段距离，而不是直接重叠
            b.x += (this.vx * this.timedelta) / 1000 / 2;
            b.y += (this.vy * this.timedelta) / 1000 / 2;
            a.x += (this.vx * this.timedelta) / 1000 / 2;
            a.y == (this.vy * this.timedelta) / 1000 / 2;
            if (this.status === 3) {
                this.status = 0;
            }
        }

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
        if (this.status === 0 || this.status === 1) {
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
                this.status = 1; //这里写为1也可以
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
        //如果死亡，就不再改变方向
        if (this.status === 6) {
            return;
        }
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

    //碰撞检测
    is_collision(r1, r2) {
        //碰撞检测：判断两个矩形是否有交集，即两个矩形的水平方向或竖直方向有交集
        //水平方向没有交集
        if (Math.max(r1.x1, r2.x1) > Math.min(r1.x2, r2.x2)) {
            return false;
        }

        if (Math.max(r1.y1, r2.y1) > Math.min(r1.y2, r2.y2)) {
            return false;
        }

        return true;
    }

    is_attack() {
        //已经是死亡状态，就不再改变状态了
        if (this.status === 6) {
            return;
        }
        //转为被攻击状态，从第0帧开始渲染
        this.status = 5;
        this.frame_current_cnt = 0;

        //生命值减少
        this.hp = Math.max(this.hp - 50, 0); //TODO 方便调试使用50，实际需要再次调整

        //let now_hp = this.hp - 50;
        if (this.hp <= 0) {
            this.status = 6;
            this.frame_current_cnt = 0;
            console.log(this.animations.get(this.status));
            this.vx = 0;
        }
    }

    update_attack() {
        //处于攻击状态 且 攻击动画处于拳头最远的那帧
        if (this.status === 4 && this.frame_current_cnt === 18) {
            //this.status = 0;
            let me = this;
            let you = this.root.players[1 - this.id];

            let r1, r2;
            if (this.direction > 0) {
                //正方向
                //绘制红色矩形
                r1 = {
                    x1: me.x + 120,
                    y1: me.y + 40,
                    x2: me.x + 120 + 100,
                    y2: me.y + 40 + 20,
                };
            } else {
                //对称方向
                r1 = {
                    x1: me.x + me.width - 120 - 100,
                    y1: me.y + 40,
                    x2: me.x + me.width - 120 - 100 + 100,
                    y2: me.y + 40 + 20,
                };
            }

            r2 = {
                x1: you.x,
                y1: you.y,
                x2: you.x + you.width,
                y2: you.y + you.height,
            };

            //碰撞检测函数
            if (this.is_collision(r1, r2)) {
                you.is_attack();
            }
        }
    }

    update() {
        //人物移动
        this.update_control();
        this.update_move();
        //更新人物方向
        this.update_direction();
        //更新人物攻击效果
        this.update_attack();

        //每次刷新人物
        this.render();
    }

    render() {
        //参考绘制一个矩形：https://developer.mozilla.org/zh-CN/docs/Web/API/Canvas_API/Tutorial/Drawing_shapes
        //将人物简化为矩形
        // this.ctx.fillStyle = this.color;
        // this.ctx.fillRect(this.x, this.y, this.width, this.height);
        //console.log(this.width);

        //标记人物简化的矩形，方便做碰撞检测
        // this.ctx.fillStyle = "blue";
        // this.ctx.fillRect(this.x, this.y, this.width, this.height);

        //人物攻击部位
        //正方向
        // if (this.direction > 0) {
        //     this.ctx.fillStyle = "red";
        //     this.ctx.fillRect(this.x + 120, this.y + 50, 100, 20);
        // } else {
        //     //对称方向
        //     this.ctx.fillStyle = "red";
        //     this.ctx.fillRect(
        //         this.x + this.width - 120 - 100,
        //         this.y + 50,
        //         100,
        //         20
        //     );
        // }

        //渲染人物
        let status = this.status;
        //console.log(status);
        if (this.status === 1 && this.direction * this.vx < 0) status = 2;
        let obj = this.animations.get(status);

        //前进方向与速度方向不同时，即为后退
        // 这里由于上面在状态中识别了 状态1和2，所以这里就不需要再特判了
        if (this.status === 1 && this.direction * this.vx < 0) {
            status = 2;
        }

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

        //攻击状态和被攻击 在渲染完后，需要终止，状态转换为静止
        if (status === 4 || status === 5 || status === 6) {
            //攻击状态 渲染到最后一帧了，如果这里不限制，就会再播放第一帧，导致闪一下
            if (
                parseInt(this.frame_current_cnt / obj.frame_rate) ===
                obj.frame_cnt - 1
            ) {
                if (status === 6) {
                    this.frame_current_cnt--;
                } else {
                    this.status = 0;
                    //this.frame_current_cnt = 0; //TODO
                    //console.log(this.status);
                }
            }
        }

        this.frame_current_cnt++;
    }
}
//这里可以将两个简化为 export class Player extends GameObject{ }
export { Player };
