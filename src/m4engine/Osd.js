
function Osd() {
    PIXI.Sprite.call(this);
    this.bottomDisplay= new PIXI.Text('', coreVars.formatOsdLo);
    this.bottomDisplay.resolution=5;
    this.bottomDisplay.y=config.height-this.bottomDisplay.height-config.textPadding;


	this.actionsPanel= new Actions();
    this.actionsPanel.visible=false;

    this.inventoryPanel = new Inventory();
    this.inventoryPanel.visible=true; /********************************************************************************/


    this.addChild(this.inventoryPanel);
    this.addChild(this.bottomDisplay);
    this.addChild(this.actionsPanel);
}
Osd.prototype = Object.create( PIXI.Sprite.prototype );
Osd.prototype.constructor = Osd;


Osd.prototype.nameItem = function(texto){
	this.bottomDisplay.text=texto;
	this.bottomDisplay.x=config.width/2-this.bottomDisplay.width/2;
}
Osd.prototype.cleanItem = function(texto){
	this.bottomDisplay.text="";
}

Osd.prototype.showActionsPanel = function(px,py){
    this.actionsPanel.obj.text=coreVars.item;
    
    this.actionsPanel.x=px-Math.floor(100/2);
    this.actionsPanel.y=py-Math.floor(100/2);
    if(this.actionsPanel.x+100>config.width)this.actionsPanel.x=config.width-100;
    if(this.actionsPanel.y+100>config.height)this.actionsPanel.y=config.height-100;

    this.actionsPanel.visible=true;

    
}
Osd.prototype.hideActionsPanel = function(){
    for (var i = 0; i < this.actionsPanel.verbs.length; i++) {
        this.actionsPanel.verbs[i].style=coreVars.formatOsdLo;
    };
    this.actionsPanel.visible=false;
}







