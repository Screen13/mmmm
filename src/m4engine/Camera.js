/**
* Controla las coordenadas y el comportamiento de la camara en la escena actual.
*
* @class Camera
* @Camera
*/
function Camera() {
    /**
    * Coordenada x
    * 
    * @property x
    * @type int
    */
    /**
    * Coordenada y
    * 
    * @property y
    * @type int
    */
	this.x=0;
    this.y=0;
    this.nx=0;
    this.ny=0;
	this._using=false;
	this.limite_der=config.base.width-(config.base.width/2.2);
    this.limite_izq=config.base.width/2.2;
    this.followed=false;
    this.limite_x=0;
}
Camera.prototype.constructor = Camera;

/**
* La camara sigue al item seleccionado
*
* @method follow
* @param {String} itemName ID del item a seguir.
*/
Camera.prototype.follow = function(itemName) {
    this.followed=getItem(itemName);
    if(typeof(this.followed)=="undefined"){
        this.followed=getCharacter(itemName);
    }

}
/**
* Deja de seguir a cualquier item seleccionado previamente.
*
* @method noFollow
*/
Camera.prototype.noFollow = function() {
    this.followed=false;
}

/**
* Mueve la camara a la poscion X,Y
*
* @method setPos
* @param {int} newx Coordenada X
* @param {int} newy Coordenada Y
* @param {bool} inmediate Con o sin animación (true=sin animación)
*/
Camera.prototype.setPos = function(newx,newy,inmediate) {

	this.x=newx;
    this.y=newy;

 
    var limitlayer=core.scene.layers[core.scene.layer]; //la capa que hace de tope deberia poder elegirse desde config.xml

    //this.limite_x=481; //esta es la medida del exterior_despacho. puede que haya que automatizarla
    this.limite_x=core.scene.layers[core.scene.layer].width-config.base.width; //automatizado
    if(this.x>this.limite_x)this.x=this.limite_x;
    if(this.x<0)this.x=0;

    for(var i=0; i<core.scene.layers.length;i++){
        core.scene.layers[i].x=(core.scene.layersSpeeds[i]*(this.x*-1));
        core.scene.layers[i].y=(core.scene.layersSpeeds[i]*(this.y*-1));
    }
    
}



Camera.prototype.actualiza = function() {

    


    if(this.followed){
        if(this.followed.x>this.limite_der+this.x){
            this.setPos(this.followed.x-this.limite_der,this.y,true);
        }
        if(this.followed.x<this.limite_izq+this.x){
            this.setPos(this.followed.x-this.limite_izq,this.y,true);
        }
        //this.setPos(this.followed.x,this.y,true);
    }
   
}
