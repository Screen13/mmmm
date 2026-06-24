/**
* Personaje (protagonista o NPC).
*
* Ademas de los campos basicos, la definicion del personaje (en config.characters
* o en los characters de una escena) admite estos opcionales, que Core.loadCharacter
* traslada aqui:
*
*   "speedH"/"speedV":   velocidad de paso propia (por defecto, la de config.base).
*   "footsteps":         {frames:[f1,f2], sounds:[id1,id2]} sonidos de pasos propios
*                        (por defecto, config.base.footsteps si existe).
*   "animationSounds":   {nombreAnimacion: idSonido} sonido al lanzar una animacion.
*   "attachments":       [{id, images, x, y, visible}] sprites pegados al personaje
*                        (accesibles como personaje.attachments[id] y personaje[id]).
*   onUpdate(ch):        hook llamado cada frame (para logica visual del juego).
*   beforeSay(ch,text,naction): hook llamado al empezar a hablar.
*/
function Character(id, name, textures, textColor, interactive, actions) {
    M4Thing.call(this, textures);
    this.anchor = new PIXI.Point(0.5,1);

    this.id=id;
    this.name=name;
    this.walking=false;
    this.talking=false;
    this.target=new PIXI.Point(0,0);
    this.textColor=textColor;
    this.actions=actions;
    this.buble= new Text('', clone(coreVars.formatOsdLo));//clone, porque luego voy a cambiar una propiedad de este objeto y al ser un objeto y pasar por referencia, se me cambiaria el original.
    this.buble.style.fill=textColor;
    this.startTimeTalking=0;

    this.buble.visible=false;
    this.interactive=interactive;

    this.centrado=true; //truco para que el texto en off se pueda alinear arriba/izquierda

    this.naction=-1;

    this.paso=false;
    this.walkAnim="walk";

    //extensiones opcionales (las rellena Core.loadCharacter desde los datos del personaje)
    this.speedH=null;
    this.speedV=null;
    this.footsteps=null;
    this.animationSounds=null;
    this.onUpdate=null;
    this.beforeSay=null;
    this.attachments={};

    core.osd.bubleContainer.addChild(this.buble);
}
Character.prototype = Object.create( M4Thing.prototype );
Character.prototype.constructor = Character;


/**
* Crea un sprite "pegado" al personaje (gafas, bigote, sombrero...).
* Queda accesible como this.attachments[id] y this[id].
*/
Character.prototype.addAttachment = function(att){
    var sprite=new M4Thing(att.images);
    sprite.x=(typeof att.x=='number')?att.x:0;
    sprite.y=(typeof att.y=='number')?att.y:0;
    sprite.visible=(att.visible!==false);
    this.addChild(sprite);
    this.attachments[att.id]=sprite;
    this[att.id]=sprite; //alias comodo: personaje.bigote
    return sprite;
}

Character.prototype.hideme = function(naction){
    naction=lactionBegin(naction);
    this.visible=false;
    this.interactive=false;
    lactionEnd(naction);
}

/**
* Camina hasta (tx,ty). animName permite usar una animacion de andar
* alternativa (por defecto "walk").
*/
Character.prototype.walkTo = function(tx,ty,naction,animName){
    this.naction=lactionBegin(naction);
    animName=animName||"walk";

    if(!this.walking)this.stop();
    if(tx>this.x){
        this.scale = new PIXI.Point(-1,1); //// DEPENDE DE PARA DONDE MIRE EL SPRITE ORIGINAL!! ESTO DEBERIA IR A CONFIG
    }else if(tx<this.x){
        this.scale = new PIXI.Point(1,1);
    }
    if((this.x<tx+4)&&(this.x>tx-4)&&(this.y<ty+4)&&(this.y>ty-4)){ //si estas muy cerca, ni se mueve
        this.target.x=this.x;
        this.target.y=this.y;
        this.stopWalk();
    }else{
        if(!this.walking || this.walkAnim!=animName){
            this.gotoAndPlayAnimation(animName,true);
        }
        this.walkAnim=animName;
        this.target.x=tx;
        this.target.y=ty;
        this.walking=true;
    }
}

//alias historico: caminar con la animacion alternativa "walk2"
Character.prototype.walk2To = function(tx,ty,naction){
    this.walkTo(tx,ty,naction,"walk2");
}

Character.prototype.pick = function(itemName, naction){
    this.naction=lactionBegin(naction);
    core.osd.enabled=false;
    this.gotoAndPlayAnimation("pick",false, this.stopPick);
}

Character.prototype.doAnimation = function(animation, naction){
    this.naction=lactionBegin(naction);
    core.osd.enabled=false;
    this.gotoAndPlayAnimation(animation,false, this.stopWalk);
    if(this.animationSounds && this.animationSounds[animation]){
        core.m4sound.playSound(this.animationSounds[animation]);
    }
}
Character.prototype.doAnimationLoop = function(animation, naction){
    this.naction=lactionBegin(naction);
    core.osd.enabled=false;
    this.gotoAndPlayAnimation(animation,true);
    if(this.animationSounds && this.animationSounds[animation]){
        core.m4sound.playSound(this.animationSounds[animation]);
    }
    this.finishLAction();
}

Character.prototype.lookAt = function(itemName,naction){
    this.naction=lactionBegin(naction);

    var item=getItem(itemName);
    if(!item)item=getCharacter(itemName);

    if(item){
        if(item.x>this.x){
            this.scale = new PIXI.Point(-1,1);
        }else{
            this.scale = new PIXI.Point(1,1);
        }
    }

    this.finishLAction();
    this.stop();
}


Character.prototype.say = function(text,naction){
    this.naction=lactionBegin(naction);

    if(typeof this.beforeSay=='function'){
        this.beforeSay(this,text,this.naction);
    }

    this.stop();
    this.talking=true;
    var framesMouth=this.animations[this.getSec("talk")][1];

    this.buble.style.fill=this.textColor;
    this.buble.text=multiline(text,40);

    this.bubleupdate();
    this.buble.visible=true;

    //lip-sync: cada letra se traduce a una posicion de boca segun config.base.lipsync
    var lipsync=config.base.lipsync;
    var secuencia=[];
    for (var i = 0; i<text.length; i++){
        var letra=text.charAt(i).toLowerCase();
        if(isCJK(letra)){
            //silaba CJK: el lipsync solo cubre el alfabeto latino, asi que se
            //ponen 2 bocas aleatorias (aprox. consonante+vocal) y un reposo;
            //3 frames por hanzi ademas iguala la duracion al texto occidental
            secuencia.push(framesMouth[1+Math.floor(Math.random()*(framesMouth.length-1))]);
            secuencia.push(framesMouth[1+Math.floor(Math.random()*(framesMouth.length-1))]);
            secuencia.push(framesMouth[0]);
        }else{
            var boca=(typeof lipsync[letra]!='undefined')?lipsync[letra]:0;
            secuencia.push(framesMouth[boca]);
        }
    }

    this.startTimeTalking=coreVars.sceneTime;
    if(secuencia.length<config.base.minTakinSequence){ //minTakinSequence es el tiempo minimo de buble
        for(var i=0; i<config.base.minTakinSequence-secuencia.length;i++)secuencia.push(0);
    }
    this.animationSpeed = 0.15;
    this.gotoAndPlaySequence(secuencia,false,this.stopSay);
}

Character.prototype.stopSay = function(){
    this.finishLAction();
    this.stop();
    this.buble.text="";
}
Character.prototype.stopWalk = function(){
    this.finishLAction();
    if(core.osd.inventoryPanel.visible==true)core.osd.enabled=true;
    this.stop();
}
Character.prototype.stopPick = function(){
    this.finishLAction();
    core.osd.enabled=true;
    this.stop();
}


Character.prototype.stop = function(){ //ojo, estoy sobreescribiendo el metodo
                                        //stop de MovieClip. el cual hace solamente
                                        //this.playing=false, pero en lugar de eso
                                        //aqui pongo en play la animacion de "stop"
    this.animationSpeed = 0.1;
    this.buble.visible=false;
    this.gotoAndPlayAnimation("stop",true);
    this.talking=false;
    this.walking=false;
}




Character.prototype.bubleupdate = function(){

    if(this.centrado==true){
        this.buble.x=this.x+core.scene.layers[core.scene.layer].x-(this.buble.width/2);
        this.buble.y=this.y-this.height-this.buble.height-config.base.textPadding;
    }else{
        this.buble.x=this.x;
        this.buble.y=this.y-this.height;
    }

    if(core.osd.inventoryPanel.container.visible||core.character.y<-1000){
        this.buble.y=20;
        this.buble.x=(config.base.width/2)-(this.buble.width/2);
    }
    if( (this.buble.x+this.buble.width)>(config.base.width-config.base.textPadding) ){
        this.buble.x=config.base.width-this.buble.width-config.base.textPadding;
    }
    if(this.buble.x<config.base.textPadding){
        this.buble.x=config.base.textPadding;
    }
}


Character.prototype.actualiza = function(){ //nunca llamar desde fuera

    if(typeof this.onUpdate=='function')this.onUpdate(this);

    if(this.walking){

        this.bubleupdate();

        //sonidos de pasos (config del personaje o, en su defecto, global)
        var footsteps=this.footsteps||config.base.footsteps;
        if(footsteps){
            if((this.indicesec==footsteps.frames[0])&&(this.paso==true) ){ //this.paso evita que durante un frame salten varios sonidos
                core.m4sound.playSound(footsteps.sounds[0]);
                this.paso=false;
            }else if((this.indicesec==footsteps.frames[1])&&(this.paso==false)){
                core.m4sound.playSound(footsteps.sounds[1]);
                this.paso=true;
            }
        }

        var speedH=this.speedH||config.base.speedH;
        var speedV=this.speedV||config.base.speedV;

        if(this.target.x>this.x+speedH){
            this.x=this.x+speedH;
        }else if(this.target.x<this.x-speedH){
            this.x=this.x-speedH;
        }

        if(this.target.y>this.y+speedV){
            this.y=this.y+speedV;
        }else if(this.target.y<this.y-speedV){
            this.y=this.y-speedV;
        }

        if( (this.x>=(this.target.x-speedH))&&(this.x<=(this.target.x+speedH))&&(this.y>=(this.target.y-speedV))&&(this.y<=(this.target.y+speedV)) ){
            this.stopWalk();
        }
    }
}
