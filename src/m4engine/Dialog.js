function Dialog(name,lines) {
    dialog_self = this;
    this.name=name;
	  this.lines=lines;
    this.actualLine=0;
    this.naction=-1;
    this.callback=function(){}
}
Dialog.prototype.constructor = Dialog;

Dialog.prototype.play = function(callback) {

    core.osd.cursor.loff();
    
    coreVars.item="";
    coreVars.itemid=0;

    core.osd.bottomDisplay.text="";
    core.osd.inventoryPanel.hide();
    core.osd.inventoryPanel.visible=false;
    core.osd.hideActionsPanel();
    coreVars.onDialog=true;
    core.scene.loff();
    if(callback)this.callback=callback;



    if (typeof this.lines[this.actualLine].options != 'undefined') {
        if(this.lines[this.actualLine].options[0].goto==-1){
            this.semiStop();
            //this.stop();
        }else{
            this.printOptions(this.actualLine);
        }
    }else{
        core.lactions.stop();
        for (var i = 0; i < this.lines[this.actualLine].say.length; i++) {
            core.lactions.add("getCharacter('"+this.lines[this.actualLine].say[i].character+"').say('"+this.lines[this.actualLine].say[i].text+"',naction);");
        }
        core.lactions.add("dialog_self.next()");
        core.lactions.play();
    }
}

Dialog.prototype.printOptions = function(d){

    var j=0;
    var longitud = 0;
    for(var i=0; i<this.lines[d].options.length; i++){
        if(testExp(this.lines[d].options[i].if)==false){
            longitud++;
        }
    }

    for(var i=0; i<this.lines[d].options.length; i++){

        if(testExp(this.lines[d].options[i].if)==false){

            var suspensiv="";
            //if(this.lines[d].options[i].text.length>43)suspensiv="...";
            //var option = new Text( this.lines[d].options[i].text.substring(0,43)+suspensiv , coreVars.formatOsd2Lo,coreVars.formatOsd2Hi);
            var option = new Text( this.lines[d].options[i].text, coreVars.formatOsd2Lo,coreVars.formatOsd2Hi,config.base.maxlength);
            option.goto = this.lines[d].options[i].goto;

            option.x=config.base.textPadding;
            option.y=config.base.height-config.base.textPadding-(config.base.textHeight*(longitud+1))+(config.base.textHeight*(j+1));
            option.interactive=true;
            option.click=this.selecciona;

            core.osd.lines.addChild(option);
            j++;
        }//if
    }//for

}
Dialog.prototype.clearOptions = function(){
            //se engargará PIXI de quitar los eventlisteners?
            for(var i = core.osd.lines.children.length - 1; i >= 0; i--){
                core.osd.lines.children[i].mouseover=null;
                core.osd.lines.children[i].mouseout=null;
                core.osd.lines.children[i].click=null;
                core.osd.lines.removeChild(core.osd.lines.children[i]);
            }
}

Dialog.prototype.selecciona = function(mouseData){
    dialog_self.clearOptions();
    dialog_self.actualLine=mouseData.target.goto;
    dialog_self.play();
}

Dialog.prototype.next = function() {


    if(this.lines[this.actualLine].goto>=0){

        if (typeof this.lines[this.actualLine].options != 'undefined') {
            this.actualLine=this.lines[this.actualLine].options[0].goto;
        }else{
          if(typeof(this.lines[this.actualLine].actions)=='function'){ /** controla las actions **/
              this.lines[this.actualLine].actions();
          }
            this.actualLine=this.lines[this.actualLine].goto;
        }
        if(typeof(this.lines[this.actualLine].actions)=='function'){ /** controla las actions **/
            this.lines[this.actualLine].actions();
        }
        this.play();
    }else{
        if(typeof(this.lines[this.actualLine].actions)=='function'){ /** controla las actions **/
            this.lines[this.actualLine].actions();
        }
        this.stop();
    }

}


Dialog.prototype.stop = function() {
    core.osd.inventoryPanel.visible=true;
    coreVars.onDialog=false;
    core.scene.lon();
    core.osd.enabled=true;
    this.actualLine=0;
    this.callback.call();

}
Dialog.prototype.semiStop = function() {
    //core.osd.inventoryPanel.visible=true;
    coreVars.onDialog=false;
    core.scene.lon();
    //core.osd.enabled=true;
    this.actualLine=0;
    this.callback.call();

}


/*
Dialog.prototype.actualiza = function(cy) {
    cy=cy*config.base.pantalla.xx;
    osd.cursor.gotoAndStop(0);
    for(var i=0; i<osd.Dialogs.children.length; i++){

        if((cy>osd.Dialogs.children[i].getBounds().y) && (cy<osd.Dialogs.children[i].getBounds().y+osd.Dialogs.children[i].getBounds().height)){
            osd.Dialogs.children[i].setColor(config.base.texto.coloropcionesover);
            osd.cursor.gotoAndStop(1);
        }else{
            if(osd.Dialogs.children[i]._color==config.base.texto.coloropcionesover)osd.Dialogs.children[i].setColor(config.base.texto.coloropciones);
        }
    }
}
*/
