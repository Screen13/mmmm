function Core() {
	PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST;

    this.keyboard = keyboard_module();
    //var renderer = new PIXI.WebGLRenderer(config.width, config.height);
    this.renderer = new PIXI.CanvasRenderer(config.width, config.height);
    this.renderer.roundPixels=config.pixelperfect;
    this.stage = new PIXI.Container();
    
    
    /**********************/
    this.recalculate();
    window.addEventListener("resize", this.recalculate);
    /**********************/
    document.addEventListener('DOMContentLoaded', function(){ document.body.appendChild(core.renderer.view) }, false);
    
    
    /*esto deberia recalculaterse al hacer resize, pero no lo puedo llamar antes del appendChild??????????????*/
    //config.offsettop=document.getElementsByTagName('canvas')[0].offsetTop;
    //config.offsetleft=document.getElementsByTagName('canvas')[0].offsetLeft;
    

    
    for (var i = 0; i < config.assets.length; i++) {
        config.assets[i]=config.folder+"/"+config.assets[i];
    }

    /*******************************************************************************************/

    
    this.camera;            //controla el marco visible del escenario
    this.mainContainer;     //contenedor para la escena actual
    this.osd;               //controla inventario, cursor, etc...

    this.mainCharacter;     //personaje principal
    this.scene;             //escena actual

    this.lactions;
    
    this.assetsToLoad = config.assets; //podemos automatizar este array??
    
    
    this.loader = new PIXI.loaders.Loader();
    this.loader.add(this.assetsToLoad);
    this.loader.once("complete", function () { core.start(); });
    this.loader.load(); 
}
Core.prototype.constructor = Core;

Core.prototype.recalculate = function(){
    var scaleX =  window.innerWidth / config.width;
    var scaleY = window.innerHeight / config.height;
    coreVars.scale = Math.min(scaleX, scaleY);
    this.stage.scale.x=this.stage.scale.y=coreVars.scale;
    this.renderer.resize(Math.floor(config.width*coreVars.scale), Math.floor(config.height*coreVars.scale));
}


Core.prototype.start = function(){

            this.camera = new Camera();
            this.mainContainer = new PIXI.Container();
            this.osd = new Osd();

            this.lactions = new LActions();

            this.mainCharacter = this.loadCharacter(main_character, false);
            this.scene = this.loadScene(scenes.exterior_despacho); //tendria que ser la primera siempre, no? O QUE??

            this.scene.addCharacter(this.mainCharacter);
            this.mainContainer.addChild(this.scene);
            this.mainContainer.addChild(this.osd);

//debug code        
            this.mainCharacter.x=130; // en el escenario de prueba, 130 es el limite para que no salga
            this.mainCharacter.y=347;
            this.mainCharacter.gotoAndPlayAnimation("stop",true);
//fin debug code

            this.stage.addChild(this.mainContainer);

            this.pinta();
}

    
    

        

Core.prototype.pinta = function() {       
    requestAnimationFrame(core.pinta);
    core.mainCharacter.actualiza();
    core.camera.actualiza(core.mainCharacter);
    core.scene.actualiza(core.camera);
    core.lactions.actualiza();

/**************************** DEBUG ************************/
    if(core.keyboard['A']){
        core.camera.setPos(core.camera.x-10,core.camera.y);
    }
    if(core.keyboard['D']){
        core.camera.setPos(core.camera.x+10,core.camera.y);
    }
    if(core.keyboard['W']){
        core.camera.setPos(core.camera.x,core.camera.y-10);
    }
    if(core.keyboard['S']){
        core.camera.setPos(core.camera.x,core.camera.y+10);
    }
/**********************************************************/        
    core.renderer.render(core.stage);
}//pinta   







Core.prototype.loadCharacter = function(characterData, interactive){
        var lcharacter = new Character(characterData.name,characterData.images,characterData.color, interactive, characterData.actions);
        for(var key in characterData.animations){
            lcharacter.addAnimation(key,characterData.animations[key]);
        }
        return lcharacter;
    }

Core.prototype.loadScene = function(sceneData){
    var lscene;

    for (var i=this.mainContainer.children.length - 1;i>=0;i--) {
        this.mainContainer.removeChildAt(i);
    }

    lscene=new Scene(sceneData.name, sceneData.img,sceneData.imgBack,sceneData.imgFront);
    for(var i = 0; i < sceneData.areas.length; i++) {
        var larea=[];
        for(var j = 0; j < sceneData.areas[i].length; j=j+2) {
            larea.push(new PIXI.Point(sceneData.areas[i][j],sceneData.areas[i][j+1]));
        }
        lscene.addArea(larea);
    }
    for (var i = 0; i < sceneData.items.length; i++) {
        lscene.addItem(new Item(sceneData.items[i].name,sceneData.items[i].images,sceneData.items[i].loop,sceneData.items[i].width,sceneData.items[i].height, sceneData.items[i].actions),sceneData.items[i].x,sceneData.items[i].y,sceneData.items[i].z);//x y capa(-3 +3)
    }

    for (var i = 0; i < sceneData.characters.length; i++) {
        lscene.addCharacter(this.loadCharacter(sceneData.characters[i], true),sceneData.characters[i].x,sceneData.characters[i].y);
    }

    return lscene;
}


Core.prototype.action = function(verb, item){
        var nv=-1;
        for (var i = 0; i < this.scene.items.length; i++) { // WITH ITEMS **************************
            if(this.scene.items[i].name==item){
                nv=config.verbs.indexOf(verb);
                if(this.scene.items[i].actions==undefined){ //si no hay action definida
                    this.character(this.mainCharacter.name).say(config.verbsDefaultText[nv]);
                }else{
                    //eval(this.scene.items[i].actions[verb]);
                    var strfunc="";
                    core.lactions.stop();
                    strfunction=core.scene.items[i].actions[verb][0];
                    core.lactions.add(strfunction);
                    strfunction=core.scene.items[i].actions[verb][1];
                    core.lactions.add(strfunction);
                    core.lactions.play();
                }
                
            }//if
        }//for
        for (var i = 0; i < this.scene.characters.length; i++) { // WITH CHARACTERS **************************
            if(this.scene.characters[i].name==item){
                nv=config.verbs.indexOf(verb);
                if(this.scene.characters[i].actions==undefined){ //si no hay action definida
                    this.character(this.mainCharacter.name).say(config.verbsDefaultText[nv]);
                }else{
                    eval(this.scene.items[i].actions[verb]);
                }
                
            }//if
        }//for
    }
/*
core.character().walkTo(x,y);
core.character().say(a);
core.scene().addObject(a);
core.scene().removeObject(a);
core.inventory.addObject(a);
core.inventory.removeObject(a);
core.variables.set(a,0);
core.variables.get(a,0);
core.osd.off();
core.osd.on();
*/





coreVars={
    scale:0,
    itemsUnder:0,
    item:"",
    formatOsdLo:{font : '13px pc_seniorregular', fill : config.colorOsdLo, stroke : 0x000000, strokeThickness : 2, align : 'center'},
    formatOsdHi:{font : '13px pc_seniorregular', fill : config.colorOsdHi, stroke : 0x000000, strokeThickness : 2, align : 'center'},
    formatOsd2Lo:{font : '13px pc_seniorregular', fill : config.colorOsd2Lo, stroke : 0x000000, strokeThickness : 2, align : 'center'},
    formatOsd2Hi:{font : '13px pc_seniorregular', fill : config.colorOsd2Hi, stroke : 0x000000, strokeThickness : 2, align : 'center'},
    inventory:[]
}

var core = new Core();










