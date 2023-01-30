import { Player } from "./base.js";
import { GIF } from "../utils/gif.js";

class Kyo extends Player {
    constructor(root, info) {
        super(root, info);

        this.init_animations();
    }

    init_animations() {
        let outer = this;
        let offsets = [0, -22, -22, -140, 0, 0, 0];
        //7个 动作, 这里的i与status是绑定的，依靠animations来查询状态，然后进行贴图
        for (let i = 0; i < 7; i++) {
            let gif = GIF();
            // gif.load(`../../images/players/kyo/${i}.gif`);
            gif.load(`/static/images/players/kyo/${i}.gif`);

            //放入每个状态的动作Map中
            this.animations.set(i, {
                gif: gif,
                frame_cnt: 0, //总帧数
                frame_rate: 5, //每秒刷新的帧数, 这里的数据自己调试，即每5帧刷新下一个动作
                offset_y: offsets[i], //偏移量
                loaded: false, //是否被加载
                scale: 2, //缩放
            });

            //console.log("put" + this.animations.get(i));

            gif.onload = function () {
                let obj = outer.animations.get(i);

                //总帧数
                obj.frame_cnt = gif.frames.length;
                //加载人物贴图完成
                obj.loaded = true;

                //单独调整 跳跃时刷新的速率
                if (i === 3) {
                    obj.frame_rate = 4;
                }
            };
        }
    }
}

export { Kyo };
