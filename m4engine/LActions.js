/**
* Cola de acciones secuenciales (una por frame).
*
* Cada entrada de la cola puede ser:
*  - Una FUNCION: se ejecuta como fn(naction). Es el formato recomendado:
*      core.lactions.add(function(naction){ core.character.say("Hola, D'Angelo", naction); });
*    El texto puede contener comillas sin problema.
*  - Un STRING: se evalua con eval() y dentro esta disponible la variable naction.
*    Se mantiene por compatibilidad con los gamedata antiguos:
*      core.lactions.add("core.character.say('Hola', naction)");
*
* La accion debe marcar su final asignando core.lactions.acabada=naction
* (todos los metodos del motor que aceptan naction lo hacen automaticamente).
*/
function LActions() {
	this.listaacciones=[];
	this.actual=-1;
	this.acabada=-1;
	this.running=false;
	this.callback=null;
}
LActions.prototype.constructor = LActions;


LActions.prototype.play = function(cb=null) {
	this.running=true;
	this.callback=cb;
}
LActions.prototype.next = function() {
	this.acabada=this.actual;
}
LActions.prototype.isLast = function() {
	return (this.actual==this.listaacciones.length-1);
}
LActions.prototype.stop = function() {
	this.listaacciones=[];
	this.actual=-1;
	this.acabada=-1;
	this.running=false;
	var cb=this.callback;
	this.callback=null; //se anula antes de llamarlo para evitar dobles disparos si el callback vuelve a llamar a stop()
	if(typeof(cb)=='function'){
		cb();
	}
}

LActions.prototype.clear = function() {
	this.listaacciones=[];
	this.actual=-1;
	this.acabada=-1;
	this.running=false;
	this.callback=null;
}

LActions.prototype.add = function(accion) {
	this.listaacciones.push(accion);
}
LActions.prototype.actualiza = function() {
	if(this.running){
		if(this.acabada==this.actual){
			this.actual++;
			if(this.actual<this.listaacciones.length){
				var naction=this.actual;
				var accion=this.listaacciones[this.actual];
				if(typeof accion==='function'){
					accion(naction);
				}else{
					eval(accion);
				}
			}else{
				this.stop();
			}
		}
	}
}
