
function Character(name, textures, textColor, interactive, actions) {
    M4Thing.call(this, textures);
    this.anchor = new PIXI.Point(0.5,1);
    

    this.name=name;
    this.walking=false;
    this.talking=false;
    this.target=new PIXI.Point(0,0);
    this.textColor=textColor;
    this.actions=actions;

    this.buble= new PIXI.Text('', coreVars.formatOsdLo);
    this.buble.resolution=5;
    this.buble.style.fill=textColor;
    this.buble.visible=false;
    this.interactive=interactive;

    this.naction=-1;
    
    core.osd.addChild(this.buble);
}
Character.prototype = Object.create( M4Thing.prototype );
Character.prototype.constructor = Character;



/***** INTERFACE **********/

Character.prototype.click = function(mouseData){
    core.osd.showActionsPanel(mouseData.data.getLocalPosition(core.scene).x, mouseData.data.getLocalPosition(core.scene).y);
}
Character.prototype.mouseover = function(mouseData){
    
    coreVars.itemsUnder++;
    coreVars.item=this.name;
    core.osd.nameItem(this.name);
}
Character.prototype.mouseout = function(mouseData){
    coreVars.itemsUnder--;
    if(coreVars.itemsUnder==0){
        core.osd.cleanItem();
        coreVars.item="";
    }
    
}
/*************************/




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
            this.scale = new PIXI.Point(-1,1);
        }else if(tx<this.x){
            this.scale = new PIXI.Point(1,1);
        }
        if((this.x<tx+4)&&(this.x>tx-4)&&(this.y<ty+4)&&(this.y>ty-4)){ //si estas muy cerca, ni se mueve
            this.target.x=this.x;
            this.target.y=this.y;
            this.stopWalk();
        }else{
            if(!this.walking)this.gotoAndPlayAnimation("walk",true);
            this.target.x=tx;
            this.target.y=ty;
            this.walking=true;
        }

}

Character.prototype.coge = function(naccion){
        this.stop();
        if(typeof naccion === 'undefined'){
            naccion=-1;
            lacciones.stop();
        }
        this.naccion=naccion;
        this.gotoAndPlayAnimation("coge",true);
        lacciones.acabada=this.naccion;
        this.naccion=-1;
}

Character.prototype.lookat = function(objeto,naccion){
        this.stop();
        if(typeof naccion === 'undefined'){
            naccion=-1;
            lacciones.stop();
        }
        this.naccion=naccion;

        
        if(objeto.x>this.x){
            this.scale = new PIXI.Point(-1,1);
        }else{
            this.scale = new PIXI.Point(1,1);
        }
        lacciones.acabada=this.naccion;
        this.naccion=-1;
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
    var framesMouth=this.animations[this.getSec("talk")][1];
    
    this.buble.text=text;
    
    this.bubleupdate();
    this.buble.visible=true;
    var secuencia=[];
    for (var i = 0; i<text.length; i++){
        switch(text.charAt(i).toLowerCase()){
            case ".":case ",":case " "://.,-
                secuencia.push(framesMouth[0]);
                break;
            case "a":case "A"://a
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
        }
    }
    if(secuencia.length<16){ //16 es el tiempo minimo de buble
        for(var i=0; i<16-secuencia.length;i++)secuencia.push(0);
    }
    this.gotoAndPlaySequence(secuencia,false,this.stopSay);
}

Character.prototype.stopSay = function(){
    if(this.naction!=-1){//hay un numero de accion asignado
        core.lactions.acabada=this.naction;
        this.naction=-1;
    }
    this.stop();
}
Character.prototype.stopWalk = function(){
    if(this.naction!=-1){//hay un numero de accion asignado
        core.lactions.acabada=this.naction;
        this.naction=-1;
    }
    this.stop();
}


Character.prototype.stop = function(){

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
    //this.buble.x=this.x-core.camera.x-(this.buble.width/2);
    this.buble.x=this.x+core.scene.layers[core.scene.layer].x-(this.buble.width/2);
    this.buble.y=this.y-this.height-this.buble.height-config.textPadding;

    //if(osd.inventario.abierto)this.buble.y=20;
    if( (this.buble.x+this.buble.width)>(config.width-config.textPadding) ){
        this.buble.x=config.width-this.buble.width-config.textPadding;
    }
    if(this.buble.x<config.textPadding){
        this.buble.x=config.textPadding;
    }
}


Character.prototype.actualiza = function(){ //nunca llamar desde fuera

    if(this.walking){


            this.bubleupdate();

/*
            if((this.currentFrame==1)&&(this.paso==true) ){ //this.paso evita que durante un frame salten varios sonidos *********************AQUI EL FRAME NO SERA 1***
                createjs.Sound.play("snd_paso1");
                this.paso=false;
            }else if((this.currentFrame==4)&&(this.paso==false)){
                createjs.Sound.play("snd_paso2");
                this.paso=true;
            }
*/
            if(this.target.x>this.x+config.speedH){
                this.x=this.x+config.speedH;
            }else if(this.target.x<this.x-config.speedH){
                this.x=this.x-config.speedH;
            }
            if(this.target.y>this.y+config.speedV){
                this.y=this.y+config.speedV;
            }else if(this.target.y<this.y-config.speedV){
                this.y=this.y-config.speedV;
            }
            //console.log(this.y+","+this.target.y+" - "+this.x+","+this.target.x);
            if( (this.x>=(this.target.x-config.speedH))&&(this.x<=(this.target.x+config.speedH))&&(this.y>=(this.target.y-config.speedV))&&(this.y<=(this.target.y+config.speedV)) ){

                    this.stopWalk();
            }
        }//if talking
        
}





