function M4Thing(textures) {
    this.listatexturas=new Array();
    for(i=0;i<textures.length;i++){
        this.listatexturas.push(new PIXI.Texture.fromFrame(textures[i]));
    }
    PIXI.extras.MovieClip.call(this, this.listatexturas);
    this.from = 0;
    this.to = this.textures.length;
    this.animation = -1;
    this.loop = false;
    this.indicesec = 0;
    this.animations = [];
    this.secuencia=-1;
    
    this.animationSpeed = 0.1; /////////////////////////////////////////// global,local o en el config????????????????????????????????
}
M4Thing.prototype = Object.create( PIXI.extras.MovieClip.prototype );
M4Thing.prototype.constructor = M4Thing;









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

M4Thing.prototype.gotoAndPlayFromTo = function(from,to,loop) {
    this.from = from;
    this.to = to;
    this.currentTime = from;
    this.loop=loop;
    this.play();   
}
M4Thing.prototype.gotoAndPlayAnimation = function(name,loop) {
    var i= this.getSec(name);
    if(i!=-1){
        this.gotoAndPlaySequence(this.animations[i][1],loop);
    }
}
M4Thing.prototype.gotoAndPlaySequence = function(secuencia,loop) {
    this.lasttime=-1;
    this.secuencia=secuencia;
    this.loop=loop;
        
    this.indicesec=0;
    this.currentTime = 0;

    this.gotoAndPlay(this.secuencia[0]);
}





M4Thing.prototype.update = function (deltaTime){
    if(this.secuencia!=-1){

                var floor = Math.ceil(this.currentTime);
                
                if(floor!=this.lasttime){
                    this.lasttime=floor;
                    this.texture = this.textures[this.secuencia[this.indicesec]];
                    this.indicesec++;
                    
                    if(this.indicesec>this.secuencia.length-1){
                        if(this.loop==true){
                            this.lasttime=-1;
                            this.indicesec=0;
                            this.currentTime = 0;
                        }else{
                            this.secuencia=-1;
                            this.gotoAndStop(0);
                            if (this.onComplete){
                                this.onComplete();
                            }
                        }
                    }

                }

    }else{

                
                if(this.currentTime>this.to+1)this.currentTime=this.from;
                if(this.currentTime<this.from)this.currentTime=this.from;

                var floor = Math.floor(this.currentTime);

                if (floor < 0)
                {
                    if (this.loop)
                    {
                        this.texture = this.textures[this.textures.length - 1 + floor % this.textures.length];
                    }
                    else
                    {
                        this.gotoAndStop(0);

                        if (this.onComplete)
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

                    if (this.onComplete)
                    {
                        this.onComplete();
                    }
                }
    }//if sequence
    this.currentTime += this.animationSpeed * deltaTime;
}