function Notebook() {
    notebook_self=this;
    PIXI.Sprite.call(this,new PIXI.Texture.fromFrame("libreta.png"));
    this.pagina=0;
    this.paginas=[''];
    this.linewidth=32;
    this.linesperpage=9;
    this.entries=[];   //anotaciones como CLAVES (texto original): se traducen al renderizar
    this.plaintext=''; //derivado de entries en updateItems(); no escribir directamente
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


//deshace la traduccion: busca la clave cuyo valor traducido es "texto".
//La libreta guarda claves para que el savegame sobreviva a un cambio de idioma.
Notebook.prototype.untranslate = function(texto){
    if(typeof(translations)=='undefined')return texto; //idioma base: el texto ES la clave
    if(!Notebook.reverseMap){
        Notebook.reverseMap={};
        for(var k in translations)Notebook.reverseMap[translations[k]]=k;
    }
    return (typeof Notebook.reverseMap[texto]!='undefined')?Notebook.reverseMap[texto]:texto;
}

Notebook.prototype.in = function(texto,naction){
        naction=lactionBegin(naction);
        this.entries.push(this.untranslate(texto));
        lactionEnd(naction);
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
    //se traduce al renderizar: "|" = salto de parrafo, "\n" final separa anotaciones
    this.plaintext='';
    for(var i=0; i<this.entries.length; i++){
        this.plaintext+=__(this.entries[i],"m4").replace('|',"\n\n")+"\n";
    }
    //CJK a 3 unidades: el latin de Notepen es estrecho y los hanzi de la
    //libreta ocupan ~3 veces su ancho (caben ~10-11 por linea, no 16)
    var processedtext=multiline(this.plaintext,this.linewidth,3);
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
