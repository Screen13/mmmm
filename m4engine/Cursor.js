function Cursor(textures) {
    this.textures = ["osd_cursor_1.png","osd_cursor_2.png"]; ///esto que venga en el parametro, no?
    this.pointer = new PIXI.Sprite();
    this.itemAt = new PIXI.Sprite();
    this.itemAtObj = null;
    PIXI.Container.call(this);
    this.naction;
    this.pointer.texture = new PIXI.Texture.fromFrame(this.textures[0]);
    this.itemAt.texture = PIXI.Texture.EMPTY;
    this.addChild(this.itemAt);
    this.addChild(this.pointer);

}
Cursor.prototype = Object.create( PIXI.Container.prototype );
Cursor.prototype.constructor = Cursor;

Cursor.prototype.lon = function(cursorImage){
    cursorImage=(typeof(cursorImage)=='undefined')?null:cursorImage;
    if((cursorImage==null)){
        cursorImage=this.textures[1];
        this.customIcon=false;
    }else{
        this.customIcon=true;
    }
    this.pointer.texture = new PIXI.Texture.fromFrame(cursorImage);
}
Cursor.prototype.loff = function(){
    this.pointer.texture = new PIXI.Texture.fromFrame(this.textures[0]);
    this.customIcon=false;

}

Cursor.prototype.addItem = function(item){
    this.itemAt.texture = item.texture;
    this.itemAtObj=item;
    core.osd.inventoryPanel.pick(item.id);
}
Cursor.prototype.removeItem = function(naction){
    this.itemAt.texture = PIXI.Texture.EMPTY;
    if(this.itemAtObj)core.osd.inventoryPanel.let(this.itemAtObj.id);
    this.itemAtObj=null;
 }
