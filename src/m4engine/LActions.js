function LActions() {
    this.listaacciones=new Array();
    this.actual=-1;
    this.acabada=-1;
    this.running=false;

}
LActions.prototype.constructor = LActions;


LActions.prototype.play = function() {
			this.running=true;
}
LActions.prototype.stop = function() {
			this.listaacciones=new Array();
			this.actual=-1;
			this.acabada=-1;
			this.running=false;
}

LActions.prototype.add = function(funcion) {
			this.listaacciones.push(funcion)
}
LActions.prototype.actualiza = function() {
		if(this.running){
			if(this.acabada==this.actual){
				this.actual++;
				if(this.actual<this.listaacciones.length){
					var naction=this.actual;
					eval(this.listaacciones[this.actual]); /**************** evitar el eval? ******/
				}else{
					this.stop();
				}
			}
		}
}




