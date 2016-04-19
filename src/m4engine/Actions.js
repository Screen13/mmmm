function Actions() {
    actions_self=this;
    PIXI.Sprite.call(this);
    this.obj= new PIXI.Text('',coreVars.formatOsd2Lo);
    this.obj.resolution=5;
    this.obj.x=0; this.obj.y=0;
    this.addChild(this.obj);

    this.verbs=[];
    for (var i = 0; i < config.verbs.length; i++) {
        this.verbs.push(new PIXI.Text(config.verbs[i],coreVars.formatOsdLo) );
        this.verbs[i].resolution=5;
        this.verbs[i].x=0; this.verbs[i].y=15+(15*i); // altura del texto e interlineado
        this.verbs[i].name=config.verbs[i];
        this.addChild(this.verbs[i]);
        this.verbs[i].interactive=true;
        this.verbs[i].mouseover=this.resalta;
        this.verbs[i].mouseout=this.desresalta;
        this.verbs[i].click=this.selecciona;
    }
}
Actions.prototype = Object.create( PIXI.Sprite.prototype );
Actions.prototype.constructor = Actions;


Actions.prototype.resalta = function(mouseData){
    mouseData.target.style=coreVars.formatOsdHi;
}
Actions.prototype.desresalta = function(mouseData){
    mouseData.target.style=coreVars.formatOsdLo;
}
Actions.prototype.selecciona = function(mouseData){
    core.action(mouseData.target.name,actions_self.obj.text);
    core.osd.hideActionsPanel();
}





