// 控制画面刷新，每秒刷新60次

//全局变量，记录对象要刷新的所有数据
let GAME_OBJECTS = [];

class GameObject {
  constructor() {
    GAME_OBJECTS.push(this);

    //存储当前帧距离上一针的时间间隔
    this.timedelta = 0;
    //当前对象是否执行过
    this.has_call_start = false;
  }

  //初始时执行一次
  start() {}

  //每帧执行进行刷新
  update() {}

  //删除当前对象
  destroy() {
    for (let i in GAME_OBJECTS) {
      if (GAME_OBJECTS[i] === this) {
        //删除
        GAME_OBJECTS.splice(i, 1);
        break;
      }
    }
  }
}

//上一帧执行的时间
let last_timestamp;

//当前帧执行的函数
let GAME_OBJECTS_FRAME = (timestamp) => {
  for (let obj of GAME_OBJECTS) {
    //如果没有执行过 开始函数，就执行
    if (!obj.has_call_start) {
      obj.start();
      obj.has_call_start = true;
    } else {
      //执行过，就直接刷新
      obj.timedelta = timestamp - last_timestamp; //更新时间戳
      obj.update();
    }
  }

  //更新上一次的执行时间戳
  last_timestamp = timestamp;

  requestAnimationFrame(GAME_OBJECTS_FRAME);
};

requestAnimationFrame(GAME_OBJECTS_FRAME);

export { GameObject };
