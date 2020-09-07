function LActions() {
    this.listaacciones=new Array();
    this.actual=-1;
    this.acabada=-1;
    this.running=false;
    this.osdwasenabled=core.osd.enabled;
    this.callback=null;

}
LActions.prototype.constructor = LActions;


LActions.prototype.play = function(cb=null) {
			this.running=true;
			this.callback=cb;
			//this.osdwasenabled=core.osd.enabled;

}
LActions.prototype.next = function() {
			this.acabada=this.actual;


}
LActions.prototype.isLast = function() {
			if(this.actual==this.listaacciones.length-1){
				return true;
			}else{
				return false;
			}
}
LActions.prototype.stop = function() {
	if(this.running){ //evita que el osd cambie de estado si no es necesario
			this.listaacciones=new Array();
			this.actual=-1;
			this.acabada=-1;
			this.running=false;
			//core.osd.enabled=this.osdwasenabled;
			if(typeof(this.callback)=='function'){
				this.callback();
			}
		}
		
}

LActions.prototype.clear = function() {
			this.listaacciones=new Array();
			this.actual=-1;
			this.acabada=-1;
			this.running=false;
			this.callback=null;
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
					//console.log(this.actual);
					//console.log(this.listaacciones[this.actual]);
					eval(this.listaacciones[this.actual]); /**************** evitar el eval? ******/
				}else{
					this.stop();
				}
			}
		}
}
