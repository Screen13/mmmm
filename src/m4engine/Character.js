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

    this.buble.visible=false;
    this.interactive=interactive;

    this.naction=-1;

    this.paso=false;

/*************************** ESPECIFICO **********************************/
    if(this.name=="Matt Murphy"){
        this.bigote=new M4Thing(["obj_bigote.png","obj_bigote_2.png"]);
        this.bigote.x=-8;
        this.bigote.y=-130;
        this.bigote.visible=false;
        this.addChild(this.bigote);
    }
/*************************** ESPECIFICO **********************************/
    
    core.osd.addChild(this.buble);
}
Character.prototype = Object.create( M4Thing.prototype );
Character.prototype.constructor = Character;


Character.prototype.hideme = function(naction){
        /*order functions*/
        if(typeof naction === 'undefined'){
            naction=-1;
            core.lactions.stop();
        }
        this.naction=naction;
        /*order functions*/
        this.visible=false;
        this.interactive=false;

        if(this.naction!=-1){//hay un numero de accion asignado
            core.lactions.acabada=this.naction;
            this.naction=-1;
        }
}

Character.prototype.walkTo = function(tx,ty,naction){

        /*order functions*/
        if(typeof naction === 'undefined'){
            naction=-1;
            core.lactions.stop();
        }
        this.naction=naction;
        /*order functions*/

        this.stop();
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
            if(!this.walking){
                this.gotoAndPlayAnimation("walk",true);
            }
            this.target.x=tx;
            this.target.y=ty;
            this.walking=true;
            
        }


}
/**************************** especial para sparky **********************************************/
Character.prototype.walk2To = function(tx,ty,naction){

        /*order functions*/
        if(typeof naction === 'undefined'){
            naction=-1;
            core.lactions.stop();
        }
        this.naction=naction;
        /*order functions*/

        this.stop();
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
            if(!this.walking){
                this.gotoAndPlayAnimation("walk2",true);
            }
            this.target.x=tx;
            this.target.y=ty;
            this.walking=true;
            
        }


}

Character.prototype.pick = function(itemName, naction){
        /*order functions*/
        if(typeof naction === 'undefined'){
            naction=-1;
            core.lactions.stop();
        }
        this.naction=naction;
        /*order functions*/
        core.osd.enabled=false;
        this.gotoAndPlayAnimation("pick",false, this.stopPick);


}

Character.prototype.doAnimation = function(animation, naction){
        /*order functions*/
        if(typeof naction === 'undefined'){
            naction=-1;
            core.lactions.stop();
        }
        this.naction=naction;
        /*order functions*/
        core.osd.enabled=false;
        this.gotoAndPlayAnimation(animation,false, this.stopWalk);


}
Character.prototype.doAnimationLoop = function(animation, naction){
        /*order functions*/
        if(typeof naction === 'undefined'){
            naction=-1;
            core.lactions.stop();
        }
        this.naction=naction;
        /*order functions*/
        core.osd.enabled=false;
        this.gotoAndPlayAnimation(animation,true);

        if(this.naction!=-1){//hay un numero de accion asignado
            core.lactions.acabada=this.naction;
            this.naction=-1;
        }

}

Character.prototype.lookAt = function(itemName,naction){
        /*order functions*/
        if(typeof naction === 'undefined'){
            naction=-1;
            core.lactions.stop();
        }
        this.naction=naction;
        /*order functions*/

        var item;
        if(!item)item=getItem(itemName);
        if(!item)item=getCharacter(itemName);
        if(item){
            if((item.x+(item.width/2))>this.x){
                this.scale = new PIXI.Point(-1,1);
            }else{
                this.scale = new PIXI.Point(1,1);
            }
        }


        if(this.naction!=-1){//hay un numero de accion asignado
            core.lactions.acabada=this.naction;
            this.naction=-1;
        }
        this.stop();

}


Character.prototype.say = function(text,naction){
    /*order functions*/
    if(typeof naction === 'undefined'){
        naction=-1;
        core.lactions.stop();
    }
    this.naction=naction;
    /*order functions*/

    this.stop();
    this.talking=true;
    var framesMouth=this.animations[this.getSec("talk")][1];
    
    this.buble.style.fill=this.textColor;
    this.buble.text=multiline(text,40);
    
    this.bubleupdate();
    this.buble.visible=true;
    var secuencia=[];
    for (var i = 0; i<text.length; i++){
        switch(text.charAt(i).toLowerCase()){
            case ".":case ",":case " "://.,-
                secuencia.push(framesMouth[0]);
                break;
            case "a"://a
                secuencia.push(framesMouth[1]);
                break;
            case "o":case "u"://o,u
                secuencia.push(framesMouth[2]);
                break;
            case "e":case "i"://e,i
                secuencia.push(framesMouth[3]);
                break;
            case "t":case "s":case "c":case "g":case "k":case "r":case "y":case "z":case "d":case "j":case "k":case "x":case "q":case "w"://t,s,c,g,k,r,y,z,d,j,k,x,q,w
                secuencia.push(framesMouth[4]);
                break;
            case "l":case "n":case "ñ"://l,n,ñ
                secuencia.push(framesMouth[5]);
                break;
            case "m":case "b":case "p"://m,b,p
                secuencia.push(framesMouth[6]);
                break;
            case "f":case "v"://f,v
                secuencia.push(framesMouth[7]);
                break;
            default:
                secuencia.push(framesMouth[0]);
                break;
        }
    }
    if(secuencia.length<16){ //16 es el tiempo minimo de buble
        for(var i=0; i<16-secuencia.length;i++)secuencia.push(0);
    }
    this.animationSpeed = 0.15;
    this.gotoAndPlaySequence(secuencia,false,this.stopSay);
}

Character.prototype.stopSay = function(){

    if(this.naction!=-1){//hay un numero de accion asignado
        core.lactions.acabada=this.naction;
        this.naction=-1;
    }
    this.stop();
    this.buble.text="";

}
Character.prototype.stopWalk = function(){
    if(this.naction!=-1){//hay un numero de accion asignado
        core.lactions.acabada=this.naction;
        this.naction=-1;
    }
    if(core.osd.inventoryPanel.visible==true)core.osd.enabled=true;
    this.stop();
}
Character.prototype.stopPick = function(){
    if(this.naction!=-1){//hay un numero de accion asignado
        core.lactions.acabada=this.naction;
        this.naction=-1;
    }
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

/*
//update automatico
Character.prototype.update = function (deltaTime){
    MovieClipPlus.prototype.update.call(this, deltaTime);
    this.actualiza();
}
*/




Character.prototype.bubleupdate = function(){
    
    this.buble.x=this.x+core.scene.layers[core.scene.layer].x-(this.buble.width/2);
    this.buble.y=this.y-this.height-this.buble.height-config.base.textPadding;

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

    if(this.walking){

    //this.indicesec=6;
/*************************** ESPECIFICO **********************************/
    if(this.name=="Matt Murphy"){
        this.bigote.gotoAndStop(1);
        this.bigote.x=-30;
        this.bigote.y=-130;
        switch(this.indicesec){
            case 0:this.bigote.y=-128;break;
            case 1:this.bigote.y=-130;break;
            case 2:this.bigote.y=-131;break;
            case 3:this.bigote.y=-128;break;
            case 4:this.bigote.y=-130;break;
            case 5:this.bigote.y=-131;break;
            case 6:this.bigote.y=-128;break;
        }
    }
/*************************** ESPECIFICO **********************************/

            this.bubleupdate();


            if((this.indicesec==1)&&(this.paso==true) ){ //this.paso evita que durante un frame salten varios sonidos *********************AQUI EL FRAME NO SERA 1***
                createjs.Sound.play("snd_paso1");
                this.paso=false;
            }else if((this.indicesec==4)&&(this.paso==false)){
                createjs.Sound.play("snd_paso2");
                this.paso=true;
            }
/*************************** ESPECIFICO **********************************/
    if(this.name=="Sparky"){
            if(this.target.x>this.x+1){
                this.x=this.x+1;
            }else if(this.target.x<this.x-1){
                this.x=this.x-1;
            }
    }else{
/*************************** ESPECIFICO **********************************/
            if(this.target.x>this.x+config.base.speedH){
                this.x=this.x+config.base.speedH;
            }else if(this.target.x<this.x-config.base.speedH){
                this.x=this.x-config.base.speedH;
            }

}//*********************************************************************
            if(this.target.y>this.y+config.base.speedV){
                this.y=this.y+config.base.speedV;
                
            }else if(this.target.y<this.y-config.base.speedV){
                this.y=this.y-config.base.speedV;
                
            }
            
            if( (this.x>=(this.target.x-config.base.speedH))&&(this.x<=(this.target.x+config.base.speedH))&&(this.y>=(this.target.y-config.base.speedV))&&(this.y<=(this.target.y+config.base.speedV)) ){

                    this.stopWalk();
            }
        }else{//if walking
        	
            /*************************** ESPECIFICO **********************************/
            //este codigo esta en M4Thing
        	/*************************** ESPECIFICO **********************************/
        }//if not walking
        
}
