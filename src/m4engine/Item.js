
function Item(name,textures,loop,width,height,actions) {
	if(textures==undefined)textures=PIXI.Texture.EMPTY;
    M4Thing.call(this, textures);
    this.loop=loop;
    this.interactive=true;
    this.name=name;
    this.actions=actions;
    if(height)this.height=height;
    if(width)this.width=width;
    if(loop)this.gotoAndPlay(0);

}
Item.prototype = Object.create( M4Thing.prototype );
Item.prototype.constructor = Item;





/***** INTERFACE **********/
Item.prototype.click = function(mouseData){
	core.osd.showActionsPanel(mouseData.data.getLocalPosition(core.scene).x, mouseData.data.getLocalPosition(core.scene).y);
}
Item.prototype.mouseover = function(mouseData){
	coreVars.itemsUnder++;
	coreVars.item=this.name;
	core.osd.nameItem(this.name);
}
Item.prototype.mouseout = function(mouseData){
	coreVars.itemsUnder--;
	if(coreVars.itemsUnder==0){
		core.osd.cleanItem();
		coreVars.item="";
	}
	
}
/*************************/


