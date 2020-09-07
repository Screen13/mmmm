function Scene(id, name, image, imagesBack, imagesFront, imagesSpeed, escape_target,escape_target_door, before, everyupdate) { //matt, cursor, osd????????????????????????????????????????????????
    escape_target_door=(typeof(escape_target_door)=='undefined')?0:escape_target_door;
    scene_self = this;

	PIXI.Container.call(this);

    this.id=id;
    this.layer=0;
    this.layers=[];
    this.layersSpeeds=imagesSpeed;


    if(imagesBack){
        for(var i=0; i<imagesBack.length;i++){
            this.layers.push(new PIXI.Sprite.fromFrame(imagesBack[i]));
            this.addChild(this.layers[i]);
        }
        this.layer=i;
    }

    if(image){
        this.layers.push(new PIXI.Sprite.fromFrame(image));
        //this.layers[this.layer].hitArea=PIXI.TransparencyHitArea.create(new PIXI.Sprite.fromFrame(image));
    }else{
        this.layers.push(new PIXI.Sprite());
    }
    //this.layers[this.layer].interactive=true; //si hago interactiva esta, no puedo poner objetos clicables debajo
    //this.layers[this.layer].click = this.doClick;
    this.addChild(this.layers[this.layer]);

    if(imagesFront){
        for(var i=0; i<imagesFront.length;i++){
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
        /*
        fadeOut(false,function(x){
            core.loadScene(getScene(x));
        }.bind(null,this.escape_target));
        */
        this.stopTalking();
        core.lactions.stop();
        fadeOut();
        setTimeout(function(x,y){
          core.loadScene(getScene(x),y);
        }.bind(null,this.escape_target,this.escape_target_door),2000);
    }else{
        if(core.osd.cursor.visible==true){
            core.osd.showOptionsPanel();
        }
    }
}

Scene.prototype.pause = function(){
        for(var i=0; i<this.items.length; i++){
            this.items[i].playing=false;
        }
        
}
Scene.prototype.run = function(){
        for(var i=0; i<core.scene.characters.length; i++){
            this.items[i].playing=true;
        }
        
}

Scene.prototype.doClick = function(mouseData){
    if(core.osd.notebookPanel.visible==true){
        core.osd.notebookPanel.hide();
    }else{
        if(core.osd.optionsPanel.visible==false){
            //if((core.osd.enabled==true)&&(core.osd.cursor.customIcon==false)){ //si tiene icon de pasar por puerta, no hacer nada. Se encarga m4thing
                if((core.osd.enabled==true)&&(coreVars.itemid=="")){ //si tiene icon de pasar por puerta, no hacer nada. Se encarga m4thing
            
                        //Ojo, no usar this dentro de un event handler
                        if(core.lactions.running&&!core.lactions.isLast()&&false){ //si hay acciones sin finalizar, pasamos a la siguiente
                            //core.lactions.next();
                        }else if(scene_self.someoneTalking()){ //si la ultima accion aun no ha finalizado, hay que finalizarla
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
                                var point1 = new PIXI.Point(core.character.x, core.character.y);
                                var point2 = new PIXI.Point(mouseData.data.getLocalPosition(scene_self.layers[scene_self.layer]).x,mouseData.data.getLocalPosition(scene_self.layers[scene_self.layer]).y);
                                var path = shortestPath(point1.x,point1.y,point2.x,point2.y,scene_self.areas);

                                if(path.encontrado==false){
                                  //busca el punto mas cercano DENTRO del area
                                  point2=lineaMasCercana(point2.x,point2.y,scene_self.areas);
                                  //scene_self.graphics.lineStyle(1, 0xFF0000);
                                  //scene_self.graphics.drawCircle(point2.x,point2.y,10);
                                }
                                if(core.character.y>-1000)core.character.walkTo(point2.x, point2.y);
                            }
                        }//si hay acciones en marcha
            }else{//osd desactivado
                if(core.osd.inventoryPanel.visible==true)core.osd.inventoryPanel.hide();
            }//osd desactivado
        }//if options
    }//if notebook
}

Scene.prototype.lon = function(){
    for (var i = this.items.length - 1; i >= 0; i--) {
        this.items[i].interactive=this.items[i].interactivefix;
    }
    for (var i = this.characters.length - 1; i >= 0; i--) {
        this.characters[i].interactive=true;//this.characters[i].interactivefix;
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
Scene.prototype.stopTalking = function(){
    for (var i = 0; i < this.characters.length; i++) {
        if(this.characters[i].talking)this.characters[i].stopSay();
    }
}

Scene.prototype.addItem = function(item,mcx,mcy,layer,naction){
    /*order functions*/
    if(typeof naction === 'undefined'){
        naction=-1;
        core.lactions.stop();
    }
    this.naction=naction;
    /*order functions*/

    //si se especifica "layer" (entre 3 y -3), el item se asigna a una de las capas de parallax.
    var layeri=0;
    if(mcx)item.x=mcx;
    if(mcy)item.y=mcy;
    if(layer)layeri=layer;
    //item.layer=this.layer+layeri;
    item.layer=layeri;
    this.items.push(item);
    this.layers[this.layer+layeri].addChild(item);

    if(this.naction!=-1){//hay un numero de accion asignado
        core.lactions.acabada=this.naction;
        this.naction=-1;
    }

}

Scene.prototype.removeItem = function(itemName,naction){
    /*order functions*/
    if(typeof naction === 'undefined'){
        naction=-1;
        core.lactions.stop();
    }
    this.naction=naction;
    /*order functions*/

    var item=getItem(itemName);
    if(coreVars.itemid==item.id)item.mouseout();/**** truqui ***/
    this.layers[this.layer+item.layer].removeChild(item);
    index = this.items.indexOf(item);
    this.items.splice(index, 1);
/* ????????????????????????????????????????????????????????????????????
    coreVars.itemsUnder=0; 
    if(coreVars.itemsUnder==0){
        core.osd.cleanItem();
        coreVars.item="";
    }
*/
    if(this.naction!=-1){//hay un numero de accion asignado
        core.lactions.acabada=this.naction;
        this.naction=-1;
    }
}



Scene.prototype.hideItem = function(itemName,naction){
    /*order functions*/
    if(typeof naction === 'undefined'){
        naction=-1;
        core.lactions.stop();
    }
    this.naction=naction;
    /*order functions*/
    var item=getItem(itemName);
    if(coreVars.itemid==item.id)item.mouseout();/**** truqui ***/
    item.visible=false;
    item.interactive=false;
    
    if(this.naction!=-1){//hay un numero de accion asignado
        core.lactions.acabada=this.naction;
        this.naction=-1;
    }
}

Scene.prototype.showItem = function(itemName,naction){
    /*order functions*/
    if(typeof naction === 'undefined'){
        naction=-1;
        core.lactions.stop();
    }
    this.naction=naction;
    /*order functions*/

    var item=getItem(itemName);
    if(coreVars.itemid==item.id)item.mouseout();/**** truqui ***/
    item.visible=true;
    item.interactive=true;
    item.actualFade=1;
    item.targetFade=1;
    item.alpha=1;
    
    if(this.naction!=-1){//hay un numero de accion asignado
        core.lactions.acabada=this.naction;
        this.naction=-1;
    }
}

Scene.prototype.moveItem = function(itemName,x,y,naction){
    /*order functions*/
    if(typeof naction === 'undefined'){
        naction=-1;
        core.lactions.stop();
    }
    this.naction=naction;
    /*order functions*/

    var item=getItem(itemName);
    item.setPosition(x,y);
    
    if(this.naction!=-1){//hay un numero de accion asignado
        core.lactions.acabada=this.naction;
        this.naction=-1;
    }
}

Scene.prototype.actualiza = function(camara){
    this.currentTime++;
    coreVars.sceneTime=this.currentTime;
    this.everyupdate();

    for(i=0; i<this.items.length; i++){
        this.items[i].updateFade();
        this.items[i].updatePos();
    }
    
    
    //this.layers[this.layer].children.sort(depthCompare); /**************************/

    //aqui iba el calculo de capas, ahora va en camera


    

}

function Enter(inix, iniy, endx, endy) {
    this.inix=inix;
    this.iniy=iniy;
    this.endx=endx;
    this.endy=endy;
}
Enter.prototype.constructor = Enter;

function Exit(x, y, width, height) {
    PIXI.Sprite.call(this);
    this.x=x;
    this.y=y;
    this.width=width;
    this.height=height;
}
Exit.prototype = Object.create( PIXI.Sprite.prototype );
Exit.prototype.constructor = Exit;
