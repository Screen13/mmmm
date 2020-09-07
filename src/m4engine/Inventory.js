function Inventory() {
    inventory_self=this;
    PIXI.Sprite.call(this);
    this.naction;
    this.items = [];
    //this.status = [];//0 = no lo tienes, 1 = lo tienes, 2 = lo tienes, pero lo llevas en el cursor
    //this.order = []//orden de adquisicion. estos tres arrays deberian ser un solo objeto, pero bueno...
    this.container = new PIXI.Sprite(new PIXI.Texture.fromFrame("inventario.png"));
    this.button = new M4Thing(["inventario_ico.png","inventario_ico_on.png"]);
    this.button.addAnimation("blink",[1,1,0,0,1,1,0,0,1,1,0,0,1,1,0]);
    this.button.name="";
    this.container.interactive=true;
    this.button.interactive=true;
    this.container.visible=false;
    this.timer=0;



    for (var i = 0; i < config.inventory.length; i++) {
        this.addItem(new Item(config.inventory[i].id,config.inventory[i].name,config.inventory[i].images,config.inventory[i].textcontent, config.inventory[i].textformat, config.inventory[i].loop,config.inventory[i].width,config.inventory[i].height,config.inventory[i].interactive,null,null, null, config.inventory[i].actions),0,-1);
    }
    this.x=0;
    this.y=0;
    this.addChild(this.container);
    this.addChild(this.button);
    this.button.click=this.doClick;
    this.container.click=this.containerClick;
    this.container.mouseout=function(){
        //SALIR DEL INVENTARIO SIN HACER CLICK (experimental)
        if(core.osd.actionsPanel.visible==false)core.osd.inventoryPanel.hide();
    }


    this.container.x=(config.base.width/2)-(this.container.width/2);
    this.container.y=config.base.height-this.container.height;
    this.button.x=config.base.width-this.button.width-3;
    this.button.y=config.base.height-this.button.height-3;

}
Inventory.prototype = Object.create( PIXI.Sprite.prototype );
Inventory.prototype.constructor = Inventory;


Inventory.prototype.addItem = function(item, status, order){
    //Inserta un "posible" item en el inventario, pero no lo tienes hasta que su status este a true;
    //Si los añadiese en in(), el orden seria el de encontrado?
    this.items.push(item);
    this.items[this.items.length-1].status=status;
    //this.items[this.items.length-1].status=1; //**************** INVENTARIO SIEMPRE LLENO ******************//


    if(gameVars.invent.includes(item.id) )this.items[this.items.length-1].status=1;

    

    this.items[this.items.length-1].order=order;
    this.container.addChild(item);
}

Inventory.prototype.in = function(itemName,naction){
        /*order functions*/
        if(typeof naction === 'undefined'){
            naction=-1;
            core.lactions.stop();
        }
        this.naction=naction;
        /*order functions*/
        var lastorder=-1;
        for (var i = 0; i < config.inventory.length; i++) {
            if(this.items[i].order>lastorder)lastorder=this.items[i].order;
        }
        for (var i = 0; i < config.inventory.length; i++) {
            if(this.items[i].id==itemName){
                this.items[i].status=1;
                this.items[i].order=lastorder+1;
            }
        }
        this.items.sort(function(a,b) {return (a.order > b.order) ? 1 : ((b.order > a.order) ? -1 : 0);} );
        this.updateItems();
        


        if(this.naction!=-1){//hay un numero de accion asignado
                core.lactions.acabada=this.naction;
                this.naction=-1;
        }
        this.button.gotoAndPlayAnimation("blink",false);
        createjs.Sound.play("snd_mete",{loop:0});

}
Inventory.prototype.out = function(itemName,naction){
        /*order functions*/
        if(typeof naction === 'undefined'){
            naction=-1;
            core.lactions.stop();
        }
        this.naction=naction;
        /*order functions*/

        if((core.osd.cursor.itemAtObj!=null)&&(core.osd.cursor.itemAtObj.id == itemName)){
            core.osd.cursor.removeItem();
        }

        for (var i = 0; i < config.inventory.length; i++) {
            if(this.items[i].id==itemName){
                this.items[i].status=0;
            }

        }
        this.updateItems();

        if(this.naction!=-1){//hay un numero de accion asignado
                core.lactions.acabada=this.naction;
                this.naction=-1;
        }
}
Inventory.prototype.pick = function(itemName){
    //pasa al cursor
        for (var i = 0; i < config.inventory.length; i++) {
            if(this.items[i].id==itemName)this.items[i].status=2;
        }
        this.updateItems();
}
Inventory.prototype.let = function(itemName){
    //devuelve desde el cursor
        for (var i = 0; i < config.inventory.length; i++) {
            if(this.items[i].id==itemName)this.items[i].status=1;
        }
        this.updateItems();
}
Inventory.prototype.show = function(){
    core.lactions.stop();
    core.character.stop();
    core.scene.loff();
	this.updateItems();
    this.container.visible=true;
    this.button.visible=false;
    core.osd.notebookPanel.hide();
}
Inventory.prototype.hide = function(){
    this.container.visible=false;
    this.button.visible=true;
    core.scene.lon();
}
Inventory.prototype.has = function(itemName){
    var tiene=false;
    for (var i = 0; i < config.inventory.length; i++) {
        if(this.items[i].id==itemName)tiene=true;
    }
    return tiene;
}
Inventory.prototype.updateItems = function(){
    var x=25;
    var y=43;
    for (var i = 0; i < config.inventory.length; i++) {
        if(this.items[i].status!=0){
            if(this.items[i].status==1){
                this.items[i].visible=true;
            }else{
                this.items[i].visible=false;
                //if(coreVars.item==this.items[i].name)this.items[i].mouseout();/**** truqui ***/
            }
            this.items[i].x=x;
            this.items[i].y=y;
            x=x+52;
            if(x>300){
                x=25;
                y=y+54;
            }
        }else{
            this.items[i].visible=false;
            if(coreVars.itemid==this.items[i].id)this.items[i].mouseout();/**** truqui ***/
        }//status
    }
}

Inventory.prototype.doClick = function(mouseData){
    if(core.osd.enabled==true){
        if(!coreVars.onDialog)inventory_self.show();
        //if(core.osd.actionsPanel.visible==true)if(coreVars.itemsUnder==0)core.osd.hideActionsPanel();
        if(core.osd.actionsPanel.visible==true)if(coreVars.itemid==0)core.osd.hideActionsPanel();
    }
}
Inventory.prototype.containerClick = function(mouseData){
    if(core.osd.enabled==true){


        if(scene_self.someoneTalking()){ //si la ultima accion aun no ha finalizado, hay que finalizarla
            scene_self.stopTalking();
        }else
        if(core.osd.cursor.itemAtObj){
            inventory_self.let(core.osd.cursor.itemAtObj.id);
            core.osd.cursor.removeItem();
        }else{
            if(core.osd.actionsPanel.visible==true){
                //if(coreVars.itemsUnder==0)core.osd.hideActionsPanel();
                if(coreVars.itemid==0)core.osd.hideActionsPanel();
            }
        }


    }//if osd enable
}
