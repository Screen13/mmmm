
function Osd() {
    PIXI.Sprite.call(this);
    this.bottomDisplay= new Text('', coreVars.formatOsdLo);
    this.bottomDisplay.resolution=5;
    this.bottomDisplay.y=config.base.height-this.bottomDisplay.height+10;//-config.base.textPadding;


	this.actionsPanel= new Actions();
    this.actionsPanel.visible=false;

    this.inventoryPanel = new Inventory();
    this.notebookPanel = new Notebook();

    this.lines = new PIXI.Sprite();

    this.optionsPanel = new Options();
    this.cursor = new Cursor();

    this.addChild(this.inventoryPanel);
    this.addChild(this.notebookPanel);
    this.addChild(this.bottomDisplay);
    this.addChild(this.actionsPanel);
    this.addChild(this.lines);
    this.addChild(this.optionsPanel);
    

    this.enabled=true;
}
Osd.prototype = Object.create( PIXI.Sprite.prototype );
Osd.prototype.constructor = Osd;

Osd.prototype.hide = function(naction){
    /*order functions*/
    if(typeof naction === 'undefined'){
        naction=-1;
        core.lactions.stop();
    }
    this.naction=naction;
    /*order functions*/
    //this.visible=false;
    this.bottomDisplay.visible=false;
    this.actionsPanel.visible=false;
    this.inventoryPanel.visible=false;
    //this.lines.visible=false;
    this.cursor.visible=false;
    this.disable();
    if(this.naction!=-1){//hay un numero de accion asignado
        core.lactions.acabada=this.naction;
        this.naction=-1;
    }

}
Osd.prototype.show = function(naction){
    /*order functions*/
    if(typeof naction === 'undefined'){
        naction=-1;
        core.lactions.stop();
    }
    this.naction=naction;
    /*order functions*/

    //this.visible=true;
    this.bottomDisplay.visible=true;

    this.inventoryPanel.visible=true;
    //this.lines.visible=true;
    this.cursor.visible=true;
    this.enable();
    
    if(this.naction!=-1){//hay un numero de accion asignado
        core.lactions.acabada=this.naction;
        this.naction=-1;
    }
}
Osd.prototype.enable = function(){
    this.enabled=true;
}
Osd.prototype.disable = function(){
    this.enabled=false;
}

Osd.prototype.nameItem = function(texto){
    if(!coreVars.onDialog){
        if(typeof(texto)=='undefined')texto="-";
        
	   this.bottomDisplay.text=texto;
	   this.bottomDisplay.x=config.base.width/2-this.bottomDisplay.width/2;
    }else{
        this.bottomDisplay.text="";
    }
}
Osd.prototype.cleanItem = function(texto){
	this.bottomDisplay.text="";
}

Osd.prototype.showActionsPanel = function(px,py){
    this.actionsPanel.obj.text=coreVars.item;
    this.actionsPanel.obj.id=coreVars.itemid;
    
    //this.actionsPanel.x=px-Math.floor(100/2);
    //this.actionsPanel.y=py-Math.floor(100/2);
    this.actionsPanel.x=px-Math.floor(58/2);
    this.actionsPanel.y=py-Math.floor(58/2);
    if(this.actionsPanel.x+100>config.base.width)this.actionsPanel.x=config.base.width-100;
    if(this.actionsPanel.y+100>config.base.height)this.actionsPanel.y=config.base.height-100;
    if(this.actionsPanel.x-10<0)this.actionsPanel.x=10;
    if(this.actionsPanel.y-10<0)this.actionsPanel.y=10;

    this.actionsPanel.visible=true;

    
}
Osd.prototype.hideActionsPanel = function(){
    for (var i = 0; i < this.actionsPanel.verbs.length; i++) {
        this.actionsPanel.verbs[i].style=coreVars.formatOsd2Lo;
        this.actionsPanel.verbs[i].loff();
    };
    this.actionsPanel.visible=false;
}

Osd.prototype.showOptionsPanel = function(){
    this.optionsPanel.x=Math.floor((config.base.width/2)-this.optionsPanel.width/2);
    this.optionsPanel.y=Math.floor((config.base.height/2)-this.optionsPanel.height/2);
    this.disable();
    this.optionsPanel.show();
}
Osd.prototype.hideOptionsPanel = function(){
    this.enable();
    this.optionsPanel.hide();   
}
