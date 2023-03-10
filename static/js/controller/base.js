//读取键盘输入
class Controller {
    constructor($canvas) {
        this.$canvas = $canvas;
        // 取消事件的默认动作，这样方向键就不会发生页面滚动了
        // $(document).keydown(function (event) {
        //     // TODO 但是页面显示不全，F12这类的快捷键全部失效
        //     event.preventDefault();
        // });
        //js原生提供的键盘获取方式无法满足条件，所以这里需要自己魔改
        this.pressed_keys = new Set();
        this.start();
    }

    start() {
        let outer = this;

        //按下 按键
        this.$canvas.keydown(function (e) {
            //e.key获取键盘输入，然后添加到点击事件中
            outer.pressed_keys.add(e.key);
            console.log(e.key);
        });
        //抬起按键
        this.$canvas.keyup(function (e) {
            outer.pressed_keys.delete(e.key);
        });
    }
}

export { Controller };
