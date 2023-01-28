import { GameMap } from "../js/game_map/base.js";
import { Player } from "../js/players/base.js";

class KOF {
  //构造函数
  constructor(id) {
    //ID 选择器
    this.$kof = $("#" + id);

    //创建地图
    this.game_map = new GameMap(this);

    //创建游戏角色
    this.players = [
      new Player(this, {
        id: 0,
        x: 200,
        y: 0,
        width: 120,
        height: 200,
        color: "blue",
      }),
      new Player(this, {
        id: 1,
        x: 900,
        y: 0,
        width: 120,
        height: 200,
        color: "red",
      }),
    ];
  }
}

export { KOF };
