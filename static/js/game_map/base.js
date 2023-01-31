import { GameObject } from "../game_object/base.js";
import { Controller } from "../controller/base.js";
class GameMap extends GameObject {
    constructor(root) {
        super();

        this.root = root;
        //使用canvas进行绘图
        // let $canvas = $('<canvas id="tutorial" width="1280px" height="720px" tabindex=0></canvas>');
        // //聚焦canvas对象
        // this.ctx = $canvas[0].getContext("2d");
        // this.root.$kof.append(this.$canvas);
        // this.$canvas.focus(); //聚焦

        //这里如果使用let，就相当于是新创建了一个canvas对象，是复制，而不是使用jQuery获取到之前页面中的那个了
        this.$canvas = $(
            '<canvas width="1280" height="720" tabindex=0></canvas>'
        );
        this.ctx = this.$canvas[0].getContext("2d");
        this.root.$kof.append(this.$canvas);
        //聚焦canvas对象
        this.$canvas.focus();

        //实例化控制层
        this.controller = new Controller(this.$canvas);

        // this.root.$kof.append(`<!-- 计时器与血条 -->
        // <div class="kof-head">
        //     <div class="kof-head-hp-0"></div>
        //     <div class="kof-head-timer"></div>
        //     <div class="kof-head-hp-1"></div>
        // </div>`);

        //单位为 毫秒
        this.time_left = 60000; //TODO
        //选择计时器
        this.$timer = this.root.$kof.find(".kof-head-timer");
    }

    start() {}

    //每次刷新
    update() {
        this.time_left -= this.timedelta;
        if (this.time_left < 0) {
            this.time_left = 0;

            //倒计时结束，但是双方都存活，就强制结束
            let [a, b] = this.root.players;

            if (a.status !== 6 && b.status !== 6) {
                a.status = b.status = 6;
                a.frame_current_cnt = b.frame_current_cnt = 0;
                a.vx = b.vx = 0;
            }
        }
        //将剩余时间渲染到倒计时框中
        this.$timer.text(parseInt(this.time_left / 1000)); //转化成秒

        //一般使用函数封装
        this.render();
    }

    render() {
        //每帧需要清空一次canvas，这样就显示的是移动的画面，而不是轨迹
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height); //清空地图, 参考：https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/clearRect
        //console.log(this.$canvas.width());    //这样的方式也可以获取到宽高
        //参考绘制一个矩形：https://developer.mozilla.org/zh-CN/docs/Web/API/Canvas_API/Tutorial/Drawing_shapes
        // this.ctx.fillStyle = "black";
        // this.ctx.fillRect(0, 0, this.$canvas.width(), this.$canvas.height());
        //console.log("testMap");
    }
}

export { GameMap };
