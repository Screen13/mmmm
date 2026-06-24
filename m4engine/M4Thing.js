/**
* Clase base de todos los objetos animados del motor (items, personajes,
* botones...). Extiende el MovieClip de PIXI con animaciones por nombre,
* secuencias arbitrarias de frames, fades y el protocolo de la cola de acciones.
*/
function M4Thing(textures) {
    if(typeof textures==='undefined')textures=PIXI.Texture.EMPTY;

    this.listatexturas=[];

    for(var i=0;i<textures.length;i++){
        this.listatexturas.push(new PIXI.Texture.fromFrame(textures[i]));
    }
    if(this.listatexturas.length==0)this.listatexturas.push(PIXI.Texture.EMPTY); //si no hay, meto una vacia
    PIXI.extras.MovieClip.call(this, this.listatexturas);
    this.from = 0;
    this.to = this.textures.length;
    this.animation = -1;
    this.loop = false;
    this.indicesec = 0;
    this.animations = [];
    this.secuencia=-1;
    this.callback=null;
    this.cursorImage=null;
    this.goto=null;
    this.animationSpeed = 0.1;
    this.actualFade=1;
    this.targetFade=1;
    this.currentTime=0;
    this.naction=-1;
}
M4Thing.prototype = Object.create( PIXI.extras.MovieClip.prototype );
M4Thing.prototype.constructor = M4Thing;

/**
* Marca como acabada la accion de la cola asociada a este objeto (si la hay).
* Lo usan los callbacks de fin de animacion/movimiento/dialogo.
*/
M4Thing.prototype.finishLAction = function(){
    if(this.naction!=-1){
        core.lactions.acabada=this.naction;
        this.naction=-1;
    }
}


/***** INTERFACE **********/

M4Thing.prototype.click = function(mouseData){

/* gran parte de esta funcion esta repetida en Scene.js*/

    if(core.osd.enabled==true){

                //Ojo, no usar this dentro de un event handler
                if(core.scene.someoneTalking()){ //si la ultima accion aun no ha finalizado, hay que finalizarla
                    core.scene.stopTalking();
                    //De esto se encarga Scene.js
                }else{ //si no hay acciones en marcha
                    if(coreVars.onDialog){
                        //no hacer nada
                    }else{

                        if(core.osd.cursor.itemAtObj==null){
                            if(this.goto==null){

                                if(typeof(this.click_action)=="function"){
                                    this.click_action();

                                }else{

                                    core.osd.showActionsPanel(mouseData.data.getLocalPosition(core.scene).x, mouseData.data.getLocalPosition(core.scene).y);

                                }
                            }else{
                                if(this.gotoEnter>=1000){

                                    core.osd.actionsPanel.doAction("gotoDoorInmediate", this.id);

                                }else{
                                    core.osd.actionsPanel.doAction("gotoDoor", this.id);

                                }
                            }
                        }else{

                            core.osd.actionsPanel.doAction("useAt", this.id);
                        }
                    }
                }//si hay acciones en marcha
    }//osd desactivado
}
M4Thing.prototype.mouseover = function(mouseData){
        coreVars.item=this.name;
        coreVars.itemid=this.id;
        core.osd.nameItem(this.name);
        core.osd.cursor.lon(this.cursorImage);

}
M4Thing.prototype.mouseout = function(mouseData){
        if(!coreVars.overVerb){
        if(coreVars.itemid==this.id){
            core.osd.cleanItem();
            coreVars.item="";
            coreVars.itemid=0;
            core.osd.cursor.loff();
        }
        }
}
/*************************/

M4Thing.prototype.hide = function(){
    this.visible=false;
    this.actualFade=0;
    this.targetFade=0;
    this.alpha=0;
}
M4Thing.prototype.show = function(){
    this.visible=true;
    this.actualFade=1;
    this.targetFade=1;
    this.alpha=1;
}

M4Thing.prototype.setPosition = function(x,y){
    this.x=x;
    this.y=y;
}

M4Thing.prototype.addAnimation = function(name,frames) {
    frames.push(frames[frames.length-1]);//truco sucio. el ultimo frame se reproduce solo durante unas decimas de segundo???????
    this.animations.push(new Array(name,frames));
}

M4Thing.prototype.getSec = function(name){
    var i=-1;
    var nombre=null;
    while((nombre!=name)&&(i<this.animations.length)){
        i++;
        nombre=this.animations[i][0]; //si no se encuentra, probablemente se esta llamando a un anaimacion no existente
    }
    return i;
}

M4Thing.prototype.gotoAndPlayFromTo = function(from, to, loop, callback) {
    this.from = from;
    this.to = to;
    this.currentTime = from;
    this.loop=loop;
    if(typeof callback=='function')this.onComplete=callback;
    this.play();
}
M4Thing.prototype.gotoAndPlayAnimation = function(name, loop, callback) {
    var i= this.getSec(name);
    if(i!=-1){
        this.gotoAndPlaySequence(this.animations[i][1],loop,callback);
    }
}
M4Thing.prototype.gotoAndPlaySequence = function(secuencia, loop, callback) {
    this.lasttime=-1;
    this.secuencia=secuencia;
    this.loop=loop;
    if(typeof callback=='function')this.onComplete=callback;
    this.indicesec=0;
    this.currentTime = 0;
    this.gotoAndPlay(this.secuencia[0]);
}


M4Thing.prototype.fadeOut = function (){
    this.targetFade=0;
}
M4Thing.prototype.fadeIn = function (){
    this.targetFade=1;
}
M4Thing.prototype.updateFade = function(){
    if(this.targetFade!=this.actualFade){
        this.visible=true;
        if(this.targetFade>this.actualFade){
            this.actualFade=this.actualFade+0.1;
            if(Math.abs(this.actualFade-this.targetFade)<0.12)this.actualFade=this.targetFade;

        }else{
            this.actualFade=this.actualFade-0.1;
            if(Math.abs(this.actualFade-this.targetFade)<0.12)this.actualFade=this.targetFade;
        }
        this.alpha=this.actualFade;
        if(this.actualFade==0)this.hide();
        if(this.actualFade==1)this.show();
    }//si son distintos...
}

M4Thing.prototype.update = function (deltaTime){

  if(this.playing){

    if(this.secuencia!=-1){

                var floor = Math.ceil(this.currentTime); //por que habia un ceil aqui?

                if(floor!=this.lasttime){
                    this.lasttime=floor;
                    this.texture = this.textures[this.secuencia[this.indicesec]];

                    this.indicesec++;

                    if(this.indicesec>=this.secuencia.length){
                        if(this.loop==true){
                            this.lasttime=-1;
                            this.indicesec=0;
                            this.currentTime = 0;
                        }else{
                            this.secuencia=-1;
                            this.stop();
                            if (typeof this.onComplete=='function'){
                                this.onComplete();
                            }
                        }
                    }

                }

    }else{


                if(this.currentTime>this.to+1)this.currentTime=this.from+1; //no se por que +1, pero el ventilador va mejor
                if(this.currentTime<this.from)this.currentTime=this.from+1;

                var floor = Math.floor(this.currentTime);
                if (floor < 0)
                {

                    if (this.loop)
                    {

                        this.texture = this.textures[((this.textures.length - 1) + floor) % this.textures.length];
                    }
                    else
                    {

                        this.gotoAndStop(0);

                        if (typeof this.onComplete=='function')
                        {
                            this.onComplete();
                        }
                    }
                }
                else if (this.loop || floor < this.textures.length)
                {

                    this.texture = this.textures[floor % this.textures.length];
                }
                else if (floor >= this.textures.length)
                {
                    this.gotoAndStop(this.textures.length - 1);

                    if (typeof this.onComplete=='function')
                    {
                        this.onComplete();
                    }
                }
    }//if sequence
    this.currentTime += this.animationSpeed * deltaTime;
    }//if playing
}
