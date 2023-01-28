import { GameObject } from "../game_object/base.js";

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

    //速度
    this.vx = 0;
    this.vy = 0;

    this.speedx = 400; //初始水平速度
    this.speedy = 1000; //初始竖直跳跃速度

    this.ctx = this.root.game_map.ctx;
  }

  start() {}

  update() {
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
