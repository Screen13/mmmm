
function VerbIcon(name, imgLo, imgHi) {
    this.name=name;
    if(this.name=="hablar"){
    	this.nexo=" con";
    }else{
    	this.nexo="";
    }

    PIXI.Sprite.call(this);
    this.texture = new PIXI.Texture.fromFrame(imgLo);

    this.interactive=true;

    this.imgLo=imgLo;
    this.imgHi=imgHi;

    this.mouseover=this.lon;
    this.mouseout=this.loff;
}
VerbIcon.prototype = Object.create( PIXI.Sprite.prototype );
VerbIcon.prototype.constructor = VerbIcon;


VerbIcon.prototype.lon = function(mouseData){
   //coreVars.overVerb=true;
   this.texture = new PIXI.Texture.fromFrame(this.imgHi);
   //core.osd.nameItem(this.name+this.nexo+" "+core.osd.actionsPanel.obj._text);
}
VerbIcon.prototype.loff = function(mouseData){
  //if(core.osd.bottomDisplay._text==this.name+this.nexo+" "+core.osd.actionsPanel.obj._text){
   //coreVars.overVerb=false;
   this.texture = new PIXI.Texture.fromFrame(this.imgLo);
   //core.osd.cleanItem();
   //coreVars.item="";
   //coreVars.itemid=0;
   //core.osd.cursor.loff();
  //}
}
