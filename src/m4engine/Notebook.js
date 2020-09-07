function Notebook() {
    notebook_self=this;
    PIXI.Sprite.call(this,new PIXI.Texture.fromFrame("libreta.png"));
    this.pagina=0;
    this.paginas=[''];
    this.linewidth=32;
    this.linesperpage=9;
    this.plaintext='';
    this.text=new Text('',coreVars.formatNotebook);

    this.text.y=50;
    this.text.x=10;
    this.naction;
    
    this.button = new M4Thing();
    this.button.name="";
    this.button.interactive=true;
    this.button.visible=true;
    this.button.width=50;
    this.button.height=50;
    this.button.click=this.nextPage;

    this.interactive=true;
    this.visible=false;

    this.x=0;
    this.y=0;

    this.addChild(this.text);
    this.addChild(this.button);
    this.click=this.doClick;
    
    this.x=(config.base.width/2)-(this.width/2);
    this.y=(config.base.height/2)-(this.height/2);
    this.button.x=this.width-this.button.width-20;
    this.button.y=this.height-this.button.height;


}
Notebook.prototype = Object.create( PIXI.Sprite.prototype );
Notebook.prototype.constructor = Notebook;


Notebook.prototype.in = function(texto,naction){
        /*order functions*/
        if(typeof naction === 'undefined'){
            naction=-1;
            core.lactions.stop();
        }
        this.naction=naction;
        /*order functions*/
        texto=texto.replace('|',"\n\n"); //salto de linea donde no se pueden escapar caracteres
        this.plaintext=this.plaintext+texto+"\n"; //salto de lina al final importante para que funcione bien updateItems();


        if(this.naction!=-1){//hay un numero de accion asignado
                core.lactions.acabada=this.naction;
                this.naction=-1;
        }
}


Notebook.prototype.show = function(){
    core.lactions.stop();
    core.character.stop();
    core.scene.loff();

	this.updateItems();
    this.visible=true;
}
Notebook.prototype.hide = function(){
    this.visible=false;
    core.scene.lon();
}

Notebook.prototype.updateItems = function(){
    var count=0;
    var processedtext="";
    var nextword="";
    var nextchar="";
    for(var i=0; i<this.plaintext.length; i++){
        count++;
        if(count>=this.linewidth){
            processedtext=processedtext+"\n";
            count=nextword.length;
        }
            nextchar=this.plaintext.substring(i,i+1);
            
            if((nextchar==" ")||(nextchar=="\n")){
                nextword=nextword+nextchar;
                processedtext=processedtext+nextword;
                nextword="";
                if(nextchar=="\n")count=nextword.length;
            }else{
                nextword=nextword+nextchar;
            }    
    }
    var lineas=processedtext.split("\n");
    var count=-1;
    var pagina=0;
    this.paginas=[''];
    for(var i=0; i<lineas.length; i++){
        count++;
        if(lineas[i].substr(lineas[i].length - 2)=="##"){ //truco para forzar salto de pagina
            lineas[i]=lineas[i].substr(0,lineas[i].length - 2);
                count=10000;
        }
        this.paginas[pagina]=this.paginas[pagina]+lineas[i]+"\n";
        if(count>this.linesperpage){
            count=0;
            pagina++;
            this.paginas.push('');
        }
    }

    this.text.text=this.paginas[this.pagina];


}

Notebook.prototype.nextPage = function(mouseData){
    notebook_self.pagina++;
    if(notebook_self.pagina>=notebook_self.paginas.length)notebook_self.pagina=0;
    notebook_self.updateItems();
}

Notebook.prototype.doClick = function(mouseData){
//pasar de pagina?
}
