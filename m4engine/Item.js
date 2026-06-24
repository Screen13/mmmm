function Item(id,name,textures,textcontent,textformat,loop,width,height,interactive,goto,gotoEnter,cursorImage,actions, click_action) {
    click_action=(typeof(click_action)=='undefined')?null:click_action;
    M4Thing.call(this, textures);
    this.id=id;
    this.loop=loop;
    this.name=name;
    this.actions=actions;
    this.status=0; //para el inventario
    this.order=-1; //para el inventario
    this.click_action=click_action;
    if(height)this.height=height;
    if(width)this.width=width;
    if(goto)this.goto=goto;
    if(gotoEnter)this.gotoEnter=gotoEnter;
    if(cursorImage)this.cursorImage=cursorImage;
    if(loop)this.gotoAndPlay(0);
    if(typeof(interactive)=='undefined'){
        this.interactive=true;
        this.interactivefix=true;
    }else{
        this.interactive=interactive;
        this.interactivefix=interactive;
    }
    this.textobj=null;

    if((typeof(textcontent)!='undefined')&&(textcontent!=null)){
        this.textobj = new Text(textcontent, textformat);
        this.addChild(this.textobj);
        this.width=2;
        this.height=2;
    }

    this.naction=-1;
    this.walking=false;
    this.target=new PIXI.Point(0,0);
}
Item.prototype = Object.create( M4Thing.prototype );
Item.prototype.constructor = Item;





Item.prototype.slideTo = function(tx,ty,naction){
        this.naction=lactionBegin(naction);

        this.walking=false;
        if(tx>this.x){
            this.scale = new PIXI.Point(-1,1); //// DEPENDE DE PARA DONDE MIRE EL SPRITE ORIGINAL!! ESTO DEBERIA IR A CONFIG
             this.anchor = new PIXI.Point(1,0);
        }else if(tx<this.x){
            this.scale = new PIXI.Point(1,1);
            this.anchor = new PIXI.Point(0,0);
        }
        if((this.x<tx+4)&&(this.x>tx-4)&&(this.y<ty+4)&&(this.y>ty-4)){ //si estas muy cerca, ni se mueve
            this.target.x=this.x;
            this.target.y=this.y;
            this.stopWalk();
        }else{
            this.target.x=tx;
            this.target.y=ty;
            this.walking=true;
        }
}

Item.prototype.stopWalk = function(){
    this.finishLAction();
    this.walking=false;
}

Item.prototype.doAnimation = function(animation, naction){ //como la de Character, pero no anula el OSD
        this.naction=lactionBegin(naction);
        this.gotoAndPlayAnimation(animation,false, this.stopWalk);
}
Item.prototype.doAnimationLoop = function(animation, naction){ //como la de Character, pero no anula el OSD
        this.naction=lactionBegin(naction);
        this.gotoAndPlayAnimation(animation,true);
        this.finishLAction();
}


Item.prototype.updatePos = function(){ //nunca llamar desde fuera

    if(this.walking){

            

            if(this.target.x>this.x+config.base.speedH){
                this.x=this.x+config.base.speedH;
            }else if(this.target.x<this.x-config.base.speedH){
                this.x=this.x-config.base.speedH;
            }
            
            if(this.target.y>this.y+config.base.speedV){
                this.y=this.y+config.base.speedV;
            }else if(this.target.y<this.y-config.base.speedV){
                this.y=this.y-config.base.speedV;
            }
            
           
            
            if( (this.x>=(this.target.x-config.base.speedH))&&(this.x<=(this.target.x+config.base.speedH))&&(this.y>=(this.target.y-config.base.speedV))&&(this.y<=(this.target.y+config.base.speedV)) ){

                    this.stopWalk();
            }
        }//if walking
}
