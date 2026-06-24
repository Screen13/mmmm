function Scene(id, name, image, imagesBack, imagesFront, imagesSpeed, escape_target,escape_target_door, before, everyupdate) {
    escape_target_door=(typeof(escape_target_door)=='undefined')?0:escape_target_door;
    scene_self = this;

	PIXI.Container.call(this);

    this.id=id;
    this.layer=0;
    this.layers=[];
    this.layersSpeeds=imagesSpeed;
    this.escapando=false;

    var i=0;
    if(imagesBack){
        for(i=0; i<imagesBack.length;i++){
            this.layers.push(new PIXI.Sprite.fromFrame(imagesBack[i]));
            this.addChild(this.layers[i]);
        }
        this.layer=i;
    }

    if(image){
        this.layers.push(new PIXI.Sprite.fromFrame(image));
    }else{
        this.layers.push(new PIXI.Sprite());
    }
    this.addChild(this.layers[this.layer]);

    if(imagesFront){
        for(i=0; i<imagesFront.length;i++){
            this.layers.push(new PIXI.Sprite.fromFrame(imagesFront[i]));
            this.addChild(this.layers[this.layers.length-1]);
        }
    }
    this.layers[0].interactive=true;
    this.layers[0].click = this.doClick;

    this.dialogs=[];
    this.items=[];
    this.characters=[];
    this.areas=[];
    this.enters=[];
    this.exits=[];
    this.escape_target=escape_target; //nombre de una escena a la que ir si se pulsa ESC. Si no está definido, se mostrará el menú de opciones. Si es false, no se puede escapar.
    this.escape_target_door=escape_target_door;
    this.noOptionsMenu=false; //si es true, ESC no abre el menu de opciones en esta escena
    this.naction=-1;
    this.currentTime=0;

    this.before=before;
    this.everyupdate=everyupdate;

    core.osd.show();

    if(coreVars.drawdebug){
        this.graphics=new PIXI.Graphics();
        this.debugtxt=new Text("",coreVars.formatOsdLo);
        this.debugtxt.x=0;this.debugtxt.y=0;
        this.addChild(this.graphics);
        this.addChild(this.debugtxt);
    }

}
Scene.prototype = Object.create( PIXI.Container.prototype );
Scene.prototype.constructor = Scene;


Scene.prototype.escapa = function(){

    if(this.escape_target){
        if(this.escapando==false){
            this.escapando=true;
            this.stopTalking(true); //el true es de inmediato
            core.lactions.stop();
            fadeOut();
            setTimeout(function(x,y){
              core.loadScene(getScene(x),y);
            }.bind(null,this.escape_target,this.escape_target_door),2000);
        }
    }else{
        if(core.osd.cursor.visible==true){
            core.osd.showOptionsPanel();
        }
    }
}

Scene.prototype.pause = function(){
        for(var i=0; i<this.characters.length; i++){
            this.characters[i].playing=false;
        }
        for(var i=0; i<this.items.length; i++){
            this.items[i].playing=false;
        }
}
Scene.prototype.run = function(){
        for(var i=0; i<this.characters.length; i++){
            this.characters[i].playing=true;
        }
        for(var i=0; i<this.items.length; i++){
            this.items[i].playing=true;
        }
}

Scene.prototype.doClick = function(mouseData){
    if(core.osd.notebookPanel.visible==true){
        core.osd.notebookPanel.hide();
    }else{
        if(core.osd.optionsPanel.visible==false){
                if((core.osd.enabled==true)&&(coreVars.itemid=="")){ //si tiene icon de pasar por puerta, no hacer nada. Se encarga m4thing

                        //Ojo, no usar this dentro de un event handler
                        if(scene_self.someoneTalking()){ //si la ultima accion aun no ha finalizado, hay que finalizarla

                            scene_self.stopTalking();
                        }else{ //si no hay acciones en marcha
                            if(coreVars.onDialog){

                                //no hacer nada
                            }else if(core.osd.inventoryPanel.container.visible==true){
                                core.osd.inventoryPanel.hide();
                                core.osd.hideActionsPanel();
                            }else if(core.osd.actionsPanel.visible==true){
                                if(coreVars.itemid==0)core.osd.hideActionsPanel();
                            }else if((core.osd.cursor.itemAtObj!=null)){
                                if(coreVars.itemid==0)core.osd.cursor.removeItem();
                            }else{
                                var point2 = new PIXI.Point(mouseData.data.getLocalPosition(scene_self.layers[scene_self.layer]).x,mouseData.data.getLocalPosition(scene_self.layers[scene_self.layer]).y);
                                var path = shortestPath(core.character.x,core.character.y,point2.x,point2.y,scene_self.areas);

                                if(path.encontrado==false){
                                  //busca el punto mas cercano DENTRO del area
                                  point2=lineaMasCercana(point2.x,point2.y,scene_self.areas);
                                }
                                if(core.character.y>-1000){
                                    core.character.walkTo(point2.x, point2.y);
                                }
                            }
                        }//si hay acciones en marcha
            }else{//osd desactivado
                if(core.osd.inventoryPanel.visible==true)core.osd.inventoryPanel.hide();
                if(scene_self.someoneTalking()){ //pasar el dialogo aunque el osd esté desactivado??

                    scene_self.stopTalking();

                }

            }//osd desactivado
        }//if options
    }//if notebook
}

Scene.prototype.lon = function(){
    for (var i = this.items.length - 1; i >= 0; i--) {
        this.items[i].interactive=this.items[i].interactivefix;
    }
    for (var i = this.characters.length - 1; i >= 0; i--) {
        this.characters[i].interactive=true;
    }
}
Scene.prototype.loff = function(){
    for (var i = this.items.length - 1; i >= 0; i--) {
        this.items[i].interactive=false;
    }
    for (var i = this.characters.length - 1; i >= 0; i--) {
        this.characters[i].interactive=false;
    }
}

Scene.prototype.addArea = function(area) {
    this.areas.push(area);
}
Scene.prototype.addEnter = function(enter) {
    this.enters.push(enter);
}
Scene.prototype.addExit = function(exit,mcx,mcy,layer) {

    //si se especifica "layer" (entre 3 y -3), el item se asigna a una de las capas de parallax.
    var layeri=0;
    if(mcx)exit.x=mcx;
    if(mcy)exit.y=mcy;
    if(layer)layeri=layer;
    exit.layer=this.layer+layeri;
    this.exits.push(exit);
    this.layers[this.layer+layeri].addChild(exit);
}

Scene.prototype.addCharacter = function(personaje,mcx,mcy,layer) {
    var layeri=0;
    if(mcx)personaje.x=mcx;
    if(mcy)personaje.y=mcy;
    if(layer)layeri=layer;

    this.layers[this.layer+layeri].addChild(personaje);
    this.characters.push(personaje);
    personaje.gotoAndPlayAnimation("stop",true);
}

Scene.prototype.someoneTalking = function(){
    var talking=false;
    for (var i = 0; i < this.characters.length; i++) {
        if(this.characters[i].talking)talking=true;
    }
    return talking;
}
Scene.prototype.stopTalking = function(inmediato = false){
    for (var i = 0; i < this.characters.length; i++) {
        if(
            this.characters[i].talking &&
            coreVars.sceneTime>50
        ){
            if(inmediato || coreVars.sceneTime-config.base.minTimeBeforeClick>this.characters[i].startTimeTalking){ //ticks de seguridad para no pasar el dialogo cuando acaba de aparecer
                this.characters[i].stopSay();
            }
        }
    }
}

Scene.prototype.addItem = function(item,mcx,mcy,layer,naction){
    naction=lactionBegin(naction);

    //si se especifica "layer" (entre 3 y -3), el item se asigna a una de las capas de parallax.
    var layeri=0;
    if(mcx)item.x=mcx;
    if(mcy)item.y=mcy;
    if(layer)layeri=layer;
    item.layer=layeri;
    this.items.push(item);
    this.layers[this.layer+layeri].addChild(item);

    lactionEnd(naction);
}

Scene.prototype.removeItem = function(itemName,naction){
    naction=lactionBegin(naction);

    var item=getItem(itemName);
    if(coreVars.itemid==item.id)item.mouseout();/**** truqui ***/
    this.layers[this.layer+item.layer].removeChild(item);
    var index = this.items.indexOf(item);
    this.items.splice(index, 1);

    lactionEnd(naction);
}



Scene.prototype.hideItem = function(itemName,naction){
    naction=lactionBegin(naction);

    var item=getItem(itemName);
    if(coreVars.itemid==item.id)item.mouseout();/**** truqui ***/
    item.visible=false;
    item.interactive=false;

    lactionEnd(naction);
}

Scene.prototype.showItem = function(itemName,naction){
    naction=lactionBegin(naction);

    var item=getItem(itemName);
    if(coreVars.itemid==item.id)item.mouseout();/**** truqui ***/
    item.visible=true;
    item.interactive=true;
    item.actualFade=1;
    item.targetFade=1;
    item.alpha=1;

    lactionEnd(naction);
}
Scene.prototype.showItemNoInteractive = function(itemName,naction){
    naction=lactionBegin(naction);

    var item=getItem(itemName);
    if(coreVars.itemid==item.id)item.mouseout();/**** truqui ***/
    item.visible=true;
    item.interactive=false;
    item.actualFade=1;
    item.targetFade=1;
    item.alpha=1;

    lactionEnd(naction);
}

Scene.prototype.moveItem = function(itemName,x,y,naction){
    naction=lactionBegin(naction);

    var item=getItem(itemName);
    item.setPosition(x,y);

    lactionEnd(naction);
}

Scene.prototype.actualiza = function(camara){
    this.currentTime++;
    coreVars.sceneTime=this.currentTime;
    this.everyupdate();

    for(var i=0; i<this.items.length; i++){
        this.items[i].updateFade();
        this.items[i].updatePos();
    }
}

function Enter(inix, iniy, endx, endy) {
    this.inix=inix;
    this.iniy=iniy;
    this.endx=endx;
    this.endy=endy;
}
Enter.prototype.constructor = Enter;
