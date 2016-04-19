function Camera() {
	this.x=0;
    this.y=0;
	this._using=false;
	this.limite_der=config.width-(config.width/3);
    this.limite_izq=config.width/3;
}
Camera.prototype.constructor = Camera;

Camera.prototype.setPos = function(newx,newy) {
	this.x=newx;
    this.y=newy;
}

Camera.prototype.actualiza = function(character) {
    if(character.x>this.limite_der+this.x)this.setPos(character.x-this.limite_der,this.y);
    if(character.x<this.limite_izq+this.x)this.setPos(character.x-this.limite_izq,this.y);
}








