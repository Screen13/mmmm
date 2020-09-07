function Options() {
    options_self=this;
    PIXI.Sprite.call(this);

    this.hide();
  
    this.texture=PIXI.Texture.fromFrame('interfaz.png');


    this.obj= new Text('MENÚ',coreVars.formatOsdLo);
    this.obj.anchor=new PIXI.Point(0.5,0);//si uso obj.width, pierde el estilo. asi funciona
    this.obj.x=Math.floor((this.width/2));
    this.obj.y=15;
    this.addChild(this.obj);


    
    this.opts=['Nuevo','Continuar','Guardar','Cargar','Salir'];
    this.verbs=[];

    
    //Opciones
    for (var i = 0; i < this.opts.length; i++) {
        this.verbs.push(new Text(this.opts[i],coreVars.formatOsd2Lo,coreVars.formatOsd2Hi) );
        this.verbs[i].anchor=new PIXI.Point(0.5,0);
        this.verbs[i].x=Math.floor(this.width/2);
        this.verbs[i].y=45+(20*i); // altura del texto e interlineado

        this.addChild(this.verbs[i]);
        this.verbs[i].click=this.selecciona;
    }
}
Options.prototype = Object.create( PIXI.Sprite.prototype );
Options.prototype.constructor = Options;

Options.prototype.show = function(){
    core.osd.inventoryPanel.hide();
    core.osd.hideActionsPanel();
    core.osd.cursor.loff();
    this.interactive=true;
    this.visible=true;
    core.pause();
}
Options.prototype.hide = function(){
    this.interactive=false;
    this.visible=false;
    core.run();
}

Options.prototype.selecciona = function(mouseData){
    options_self.doOptions(mouseData.target.text);
    
}



Options.prototype.doOptions = function(verb){
    switch(verb){
        case 'Nuevo':
        break;
        case 'Continuar':
            core.osd.hideOptionsPanel();
        break;
        case 'Guardar':
            var msg = new MsgBox("¿Guardar la partida?",["Si","No"]);
            msg.x=Math.floor((this.width/2)-(msg.width/2));
            msg.y=Math.floor((this.height/2)-(msg.height/2));
            this.addChild(msg);
            msg.show();
        break;
        case 'Cargar':
        break;
        case 'Salir':
        break;
    }
}


function MsgBox(texto, opts) {
    msgbox_self=this;
    PIXI.Sprite.call(this);

    this.hide();
  
    this.texture=PIXI.Texture.fromFrame('interfaz2.png');

    this.obj= new Text(texto,coreVars.formatOsdLo);
    this.obj.x=Math.floor((this.width/2)-this.obj.width/2);
    this.obj.y=10;
    this.addChild(this.obj);
    

    this.opts=opts;
    this.verbs=[];

    
    //Opciones
    var lx=10;
    for (var i = 0; i < this.opts.length; i++) {
        this.verbs.push(new Text(this.opts[i],coreVars.formatOsd2Lo,coreVars.formatOsd2Hi) );
        this.verbs[i].x=lx;
        lx=lx+this.verbs[i].width+10;
        this.verbs[i].y=30;
        this.addChild(this.verbs[i]);
        this.verbs[i].click=this.selecciona;
    }
}
MsgBox.prototype = Object.create( PIXI.Sprite.prototype );
MsgBox.prototype.constructor = MsgBox;

MsgBox.prototype.show = function(){
    core.osd.optionsPanel.interactive=false;
    this.interactive=true;
    this.visible=true;
}
MsgBox.prototype.hide = function(){
    core.osd.optionsPanel.interactive=true;
    this.interactive=false;
    this.visible=false;
}

MsgBox.prototype.selecciona = function(mouseData){
    msgbox_self.doOptions(mouseData.target.name);

}



MsgBox.prototype.doOptions = function(verb){
    switch(verb){
        case 'Si':
        break;
        case 'No':
        break;
        case 'Guardar':
        break;
        case 'Cargar':
        break;
        case 'Salir':
        break;
    }
}
