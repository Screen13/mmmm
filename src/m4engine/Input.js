function Input(width, height) {
    Input_self=this;
    PIXI.Container.call(this);
    this.interactive=true;
    this.hitArea = new PIXI.Rectangle(0, 0, width, height);
    

    this.mousemove = this.doMove;
    this.click = this.doClick;
}
Input.prototype = Object.create( PIXI.Container.prototype );
Input.prototype.constructor = Input;


Input.prototype.doMove = function(mouseData){
    core.osd.cursor.x=mouseData.data.getLocalPosition(this).x;
    core.osd.cursor.y=mouseData.data.getLocalPosition(this).y;
}

Input.prototype.doClick = function(mouseData){
    core.scene.doClick(core.osd.cursor.x,core.osd.cursor.y);
}
