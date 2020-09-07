/**
* Clase principal, encargada de inicializar y controlar el resto de componentes.
*
* @class Core
* @Core
*/

function Core() {

	PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST;
    /**
    * Registra las entradas de teclado
    * 
    * @property keyboard
    * @type Array
    */
    this.keyboard = keyboard_module();
    /**
    * Objeto para gestionar la representación gráfica.
    * 
    * @property renderer
    * @type PIXI.CanvasRenderer
    */
    this.renderer = new PIXI.WebGLRenderer(config.base.width, config.base.height);
    //this.renderer = new PIXI.CanvasRenderer(config.base.width, config.base.height);
    this.renderer.roundPixels=config.base.pixelperfect;
    /**
    * Contenedor principal de objetos gráficos en pantalla.
    * 
    * @property stage
    * @type PIXI.Container
    */
    this.stage = new PIXI.Container();


    this.recalculate();
    window.addEventListener("resize", this.recalculate);
    document.addEventListener('DOMContentLoaded', function(){ document.body.appendChild(core.renderer.view) }, false);

    for (var i = 0; i < config.base.assets.length; i++) {
        config.base.assets[i]=config.base.folder+"/assets/"+config.base.assets[i];
    }

    /*******************************************************************************************/

    /**
    * Control de camara dentro de la escena.
    * 
    * @property camera
    * @type Camera
    */
    this.camera;            //controla el marco visible del escenario
    /**
    * Contenedor para todos los elementos actualmente en pantalla.
    * 
    * @property mainContainer
    * @type PIXI.Container
    */
    this.mainContainer;     //contenedor principal
    /**
    * On Screen Display (capa de inerfaz)
    * 
    * @property osd
    * @type Osd
    */
    this.osd;               //controla inventario, cursor, etc...
    //this.inputobject;     //TODO: Centralizar los eventos
    /**
    * Personaje principal
    * 
    * @property character
    * @type Character
    */
    this.character;         //personaje principal
    /**
    * Escena cargada actualmente
    * 
    * @property scene
    * @type Scene
    */
    this.scene;             //escena actual
    this.black;
    /**
    * Lista de acciones
    * 
    * @property lactions
    * @type Lactions
    */
    this.lactions;          //controlador de listas de acciones
    this.preSceneData;

    this.assetsToLoad = config.base.assets; //podemos automatizar este array????????????????
    this.storage=window.localStorage;


    this.loader = new PIXI.loaders.Loader();
    this.loader.add(this.assetsToLoad);
    this.loader.once("complete", function () { core.carga_sonido(); });
    this.loader.load();

    this.running;

}
Core.prototype.constructor = Core;



/**
* Ajusta el tamaño del renderer si cambia el tamaño de la pantalla.
*
* @method recalculate
*/
Core.prototype.recalculate = function(){
    if(core){
        var scaleX =  window.innerWidth / config.base.width;
        var scaleY = window.innerHeight / config.base.height;
        coreVars.scale = Math.min(scaleX, scaleY);
        core.stage.scale.x=core.stage.scale.y=coreVars.scale;
        core.renderer.resize(Math.floor(config.base.width*coreVars.scale), Math.floor(config.base.height*coreVars.scale));
    }
}







/**
* Precarga los archivos de sonido.
*
* @method carga_sonido
*/
var loaded_sounds=0;
var loaded_fonts=0;
Core.prototype.carga_sonido = function(){
     createjs.Sound.on("fileload", this.cargado, this);
     createjs.Sound.alternateExtensions = ["mp3"];
     coreVars.sounds = [
     {src:config.base.folder+"/assets/snd/jazz.ogg", id:"snd_jazz"},
         {src:config.base.folder+"/assets/snd/city.ogg", id:"snd_city"},
         {src:config.base.folder+"/assets/snd/paso1.ogg", id:"snd_paso1"},
         {src:config.base.folder+"/assets/snd/paso2.ogg", id:"snd_paso2"},
         {src:config.base.folder+"/assets/snd/ok.ogg", id:"snd_mete"},
         {src:config.base.folder+"/assets/snd/timem.ogg", id:"snd_time"},
         {src:config.base.folder+"/assets/snd/no_surprises_intro.ogg", id:"snd_intro"},

     ];
     createjs.Sound.registerSounds(coreVars.sounds);

}
Core.prototype.cargado = function(){
    loaded_sounds++;
    if(loaded_sounds==coreVars.sounds.length){
        document.fonts.load('22px led-font').then(
            function(){
                document.fonts.load('22px normal-font').then(
                    fuentes_cargadas
                );        
            }
        );
    }
}



function fuentes_cargadas(){
        core.start();
}


Core.prototype.start = function(){

            this.camera = new Camera();
            this.mainContainer = new PIXI.Container();
            this.osd = new Osd();
            //this.inputobject = new Input(config.base.width,config.base.height);

            this.lactions = new LActions();

            this.black = new PIXI.Graphics();
            this.black.beginFill(0x000000);
            this.black.lineStyle(0, 0x000000);
            this.black.drawRect(0, 0, config.base.width, config.base.height);
            this.black.alpha = 0;

            this.character = this.loadCharacter(config.characters[0], false);
            this.character.hitArea = new PIXI.Rectangle(0, 0, 0, 0); //truqui para que sea intocable

            this.loadScene(getScene(config.base.initScene));

            this.mainContainer.addChild(this.scene);
            this.mainContainer.addChild(this.osd);
            this.mainContainer.addChild(this.black);
            //this.character.gotoAndPlayAnimation("stop",true);

            this.stage.addChild(this.mainContainer);
            core.osd.addChild(core.osd.cursor); //aqui fuera para que se ejecute siempre el ultimo

            this.running=true;
            this.recalculate();
            this.pinta();

}

Core.prototype.pause = function(){
        if(core.scene){
            for(var i=0; i<core.scene.characters.length; i++){
                core.scene.characters[i].playing=false;
            }
            core.scene.playing=false;
            core.scene.loff();
            core.scene.pause();
        }
        core.running=false;
}
Core.prototype.run = function(){
        if(core.scene){
            for(var i=0; i<core.scene.characters.length; i++){
                core.scene.characters[i].playing=true;
            }
            core.scene.playing=true;
            core.scene.lon();
            core.scene.run();
        }
        core.running=true;
}

Core.prototype.pinta = function() {
    requestAnimationFrame(core.pinta);
    var mousePosition = core.renderer.plugins.interaction.mouse.getLocalPosition(core.scene);
    core.osd.cursor.x=mousePosition.x;
    core.osd.cursor.y=mousePosition.y;

    if(core.running==true){
        if(core.scene)for(var i=0; i<core.scene.characters.length; i++){
            core.scene.characters[i].actualiza();
        }
        core.camera.actualiza();
        core.scene.actualiza(core.camera);
        core.lactions.actualiza();    
        /**************************** DEBUG ************************/
        /*
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
        */
        /**********************************************************/
        /**************************** DEBUG ************************/
        /*
        for(var i=0; i<10; i++){
        	if(core.keyboard[i]){
        		if(core.keyboard['L']){
        			core.keyboard['L']=false;
        			core.loadGame(i);
        		}
        	    if(core.keyboard['S']){
        	    	core.keyboard['S']=false;
        			core.saveGame(i);
        		}    
        	}
        }
        */
        /**********************************************************/

        if(coreVars.actualFade<coreVars.targetFade){
            coreVars.actualFade=coreVars.actualFade+0.04;
            if(Math.abs(coreVars.actualFade-coreVars.targetFade)<0.05){
                coreVars.actualFade=coreVars.targetFade;
                if(coreVars.afterFade!=null){
                    coreVars.afterFade.call();
                    coreVars.afterFade=null;
                }
            }
            core.black.alpha=coreVars.actualFade;
        }else if(coreVars.actualFade>coreVars.targetFade){
            coreVars.actualFade=coreVars.actualFade-0.04;
            if(Math.abs(coreVars.actualFade-coreVars.targetFade)<0.05){
                coreVars.actualFade=coreVars.targetFade;
                if(coreVars.afterFade!=null){
                    coreVars.afterFade.call();
                    coreVars.afterFade=null;
                }
            }
            core.black.alpha=coreVars.actualFade;
        }else{
            if(coreVars.afterFade!=null){
                    coreVars.afterFade.call();
                    coreVars.afterFade=null;
            }
        }


        if(coreVars.escapado==false){
            if(core.keyboard['']){
                core.keyboard['']=false;
                coreVars.escapado=true;
                core.scene.escapa();
            }
        }else{
            if(!core.keyboard['']){
                coreVars.escapado=false;
            }
        }
        
        //dibuja rectangulos para debug
        if(coreVars.drawdebug){
            drawDebug();
        }//drawdebug

        coreVars.totalTime++;

    }//if running
        core.renderer.render(core.stage);
        

    
}//pinta



Core.prototype.loadGame = function(slot){
	console.log("carga "+slot);

	var saveGame = localStorage.getItem('savegame'+slot);
	if(saveGame!=null){
		saveGame=JSON.parse(saveGame);

		
		gameVars=saveGame.items;
		
		for (var i = 0; i < saveGame.inventory.length; i++) {
			var iventItem=getItemInventory(saveGame.inventory[i].id);
	            iventItem.status=saveGame.inventory[i].status;
	            iventItem.prder=saveGame.inventory[i].order;
		}
		

		core.scene.stopTalking();
        core.mainContainer.removeChild(core.scene);
        core.scene=null;
		this.loadScene(getScene(saveGame.scene),0,saveGame.character);

	}else{
		console.log("slot vacio");
	}
	
	
}
Core.prototype.saveGame = function(slot){
	console.log("guarda "+slot);

	//hay que salvar la pantalla actual
	gameVars.items[core.scene.id]={}; //este trozo esta repetido en loadSceneN
	for(var i=0; i<core.scene.items.length; i++){
		gameVars.items[core.scene.id][core.scene.items[i].id]={
			id:core.scene.items[i].id,
			x:core.scene.items[i].x,
			y:core.scene.items[i].y,
			visible:core.scene.items[i].visible,
			interactive:core.scene.items[i].interactive
		};
	}//for i

	var inventoryToSave=[];
	for (var i = 0; i < core.osd.inventoryPanel.items.length; i++) {
            inventoryToSave.push({
            	id:core.osd.inventoryPanel.items[i].id,
            	status:core.osd.inventoryPanel.items[i].status,
            	order:core.osd.inventoryPanel.items[i].order
            });
	}
		
	var saveGame = {
		character:{x:core.character.x,y:core.character.y,scale:core.character.scale},
		items:gameVars,
		inventory:inventoryToSave,
		scene:core.scene.id
	}

	localStorage.setItem('savegame'+slot, JSON.stringify(saveGame));
}




Core.prototype.loadCharacter = function(characterData, interactive){
        var lcharacter = new Character(characterData.id,characterData.name,characterData.images,characterData.color, interactive, characterData.actions);
        for(var key in characterData.animations){
            lcharacter.addAnimation(key,characterData.animations[key]);
        }
        return lcharacter;
    }


Core.prototype.loadScene = function(sceneData,gotoEnter,position){
    gotoEnter=(typeof(gotoEnter)=='undefined')?0:gotoEnter;
    position=(typeof(position)=='undefined')?null:position;
    core.preSceneData=sceneData;
    core.osd.hide();
    core.osd.cursor.removeItem();
    if(core.scene){
        fadeOut(false, function(){
            core.loadSceneN(core.preSceneData,gotoEnter,position);
        });
    }else{
        fadeOut(true);
        core.loadSceneN(core.preSceneData,gotoEnter,position);
    }

}
Core.prototype.loadSceneN = function(sceneData,gotoEnter, position){
    gotoEnter=(typeof(gotoEnter)=='undefined')?0:gotoEnter;
    position=(typeof(position)=='undefined')?null:position;

    if(gotoEnter>=1000)gotoEnter=gotoEnter-1000; //truco para cuando > 1000, carga sin andar (creo que no sirve para nada)

    createjs.Sound.stop();
    if(core.scene){
        //gameVars.items[core.scene.id]=core.scene.items;//salva el estado actual de los items
        gameVars.items[core.scene.id]={};
		for(var i=0; i<core.scene.items.length; i++){
			gameVars.items[core.scene.id][core.scene.items[i].id]={
				id:core.scene.items[i].id,
				x:core.scene.items[i].x,
				y:core.scene.items[i].y,
				visible:core.scene.items[i].visible,
				interactive:core.scene.items[i].interactive
			};
		}//for i

        core.scene.stopTalking();
        core.mainContainer.removeChild(core.scene);
        core.scene=null;

    }

    core.lactions.stop();
    core.character.stop();
    core.osd.cursor.loff();
    //coreVars.itemsUnder=0;
    coreVars.item="";
    coreVars.itemid=0;



    lscene=new Scene(sceneData.id, sceneData.name, sceneData.img,sceneData.imgBack,sceneData.imgFront,sceneData.imgSpeed,sceneData.escape_target,sceneData.escape_target_door, sceneData.before, sceneData.everyupdate);

    for(var i = 0; i < sceneData.areas.length; i++) {
        var larea=[];
        for(var j = 0; j < sceneData.areas[i].length; j=j+2) {
            larea.push(new PIXI.Point(sceneData.areas[i][j],sceneData.areas[i][j+1]));
        }
        lscene.addArea(larea);
    }
    /****** entradas y salidas ******/
    for (var i = 0; i < sceneData.enters.length; i++) {
        thisenter=new Enter(sceneData.enters[i].inix,sceneData.enters[i].iniy,sceneData.enters[i].endx,sceneData.enters[i].endy);
        lscene.addEnter(thisenter);
    }
    for (var i = 0; i < sceneData.exits.length; i++) {
        thisexit=new Item(sceneData.exits[i].id,sceneData.exits[i].name,sceneData.exits[i].images,null, null, sceneData.exits[i].loop,sceneData.exits[i].width,sceneData.exits[i].height,true,sceneData.exits[i].goto,sceneData.exits[i].gotoEnter,sceneData.exits[i].cursorImage);
        //thisexit.cursorImageIndex=2; //deberia ser distinto segun la direccion

        lscene.addExit(thisexit,sceneData.exits[i].x,sceneData.exits[i].y,sceneData.exits[i].z);
    }
    /*****/
/* ANTIGUA FORMA DE SALVAR LOS OBJETOS (con texturas incluidas)
    if(typeof(gameVars.items[sceneData.id])=='undefined'){
        for (var i = 0; i < sceneData.items.length; i++) {
            thisitem=new Item(sceneData.items[i].id,sceneData.items[i].name,sceneData.items[i].images,sceneData.items[i].textcontent, sceneData.items[i].textformat, sceneData.items[i].loop,sceneData.items[i].width,sceneData.items[i].height,sceneData.items[i].interactive,null,null,sceneData.items[i].cursorImage, sceneData.items[i].actions,sceneData.items[i].click_action);
            for(var key in sceneData.items[i].animations){
                thisitem.addAnimation(key,sceneData.items[i].animations[key]);
            }
            lscene.addItem(thisitem,sceneData.items[i].x,sceneData.items[i].y,sceneData.items[i].z);//x y capa(-3 +3)
        }
    }else{
        for (var i = 0; i < gameVars.items[sceneData.id].length; i++) {
            thisitem=gameVars.items[sceneData.id][i];
            lscene.addItem(thisitem,thisitem.x,thisitem.y,thisitem.layer);//x y capa(-3 +3)
        }
        //lscene.items=gameVars.items[sceneData.id]; //carga el estado de los items
    }
*/

	for (var i = 0; i < sceneData.items.length; i++) {
            thisitem=new Item(sceneData.items[i].id,sceneData.items[i].name,sceneData.items[i].images,sceneData.items[i].textcontent, sceneData.items[i].textformat, sceneData.items[i].loop,sceneData.items[i].width,sceneData.items[i].height,sceneData.items[i].interactive,null,null,sceneData.items[i].cursorImage, sceneData.items[i].actions,sceneData.items[i].click_action);
            for(var key in sceneData.items[i].animations){
                thisitem.addAnimation(key,sceneData.items[i].animations[key]);
            }
            lscene.addItem(thisitem,sceneData.items[i].x,sceneData.items[i].y,sceneData.items[i].z);//x y capa(-3 +3)
    }
	if(typeof(gameVars.items[lscene.id])!='undefined'){
		for(var i=lscene.items.length-1; i>=0; i--){
			if(typeof(gameVars.items[lscene.id][lscene.items[i].id])!='undefined'){
				lscene.items[i].id=gameVars.items[lscene.id][lscene.items[i].id].id;
				lscene.items[i].x=gameVars.items[lscene.id][lscene.items[i].id].x;
				lscene.items[i].y=gameVars.items[lscene.id][lscene.items[i].id].y;
				lscene.items[i].visible=gameVars.items[lscene.id][lscene.items[i].id].visible;
				lscene.items[i].interactive=gameVars.items[lscene.id][lscene.items[i].id].interactive;
			}else{
				lscene.layers[lscene.layer+lscene.items[i].layer].removeChild(lscene.items[i]);
			    lscene.items.splice(i, 1);
			}
		}//for i        
    }

    



    if(position==null){
        lscene.addCharacter(core.character,lscene.enters[gotoEnter].inix,lscene.enters[gotoEnter].iniy);
    }else{
        lscene.addCharacter(core.character,position.x,position.y);
        core.character.scale=position.scale;
    }

    for (var i = 0; i < sceneData.characters.length; i++) {
        lscene.addCharacter(this.loadCharacter(sceneData.characters[i], true),sceneData.characters[i].x,sceneData.characters[i].y,sceneData.characters[i].z);
    }
    core.scene=lscene;



    core.mainContainer.addChild(core.scene);
    core.mainContainer.addChild(core.black);
    core.mainContainer.addChild(core.osd);
    core.scene.lon(); //si por casualidad sales de la escena con el inventario abierto (ojetos off), cuando vuelvas estarian en off.

    //reseteamos unas cuantas coreVars
    core.osd.cleanItem();
    //coreVars.itemsUnder=0;
    coreVars.item="";
    coreVars.itemid=0;
    coreVars.onDialog=false;


    core.camera.follow(core.character.name);

    core.camera.setPos(core.camera.followed.x-core.camera.limite_der,core.camera.y,true); //regulin, pero funciona


    //por si estaba desactivado desde una function before()
    core.osd.inventoryPanel.button.interactive=true;
    core.osd.inventoryPanel.button.visible=true;
    core.osd.show();
    fadeIn();
    if(position!=null){
        vieneDeGosub=true;
    }else{
        vieneDeGosub=false;
    }
    lscene.before(vieneDeGosub);
    if(position==null){
        if(core.scene.enters[gotoEnter].endx!=core.character,core.scene.enters[gotoEnter].inix)core.character.walkTo(core.scene.enters[gotoEnter].endx,core.scene.enters[gotoEnter].endy);
    }

    //return lscene;
}

Core.prototype.loadDialog = function(dialogData){
    var ldialog;
    ldialog=new Dialog(dialogData.name, dialogData.line);
}

Core.prototype.gosubReturn = function(){
    if(coreVars.gosubAction!=null){
        coreVars.gosubAction=null;
        this.loadScene(getScene(coreVars.gosubScene),0,coreVars.gosubPosition);
    }
}




//creo que todas se pueden sacar a objetos...
//con pc-senior el tamaño era 13px
coreVars={
    scale:0,
    //itemsUnder:0,
    item:"",
    itemid:0,
    overVerb: false,
    onDialog:false,
    formatOsdLo:{font : '22px normal-font', fill : config.base.colorOsdLo, stroke : 0x000000, strokeThickness : 2, align : 'center'},
    formatOsdHi:{font : '22px normal-font', fill : config.base.colorOsdHi, stroke : 0x000000, strokeThickness : 2, align : 'center'},
    formatOsd2Lo:{font : '22px normal-font', fill : config.base.colorOsd2Lo, stroke : 0x000000, strokeThickness : 2, align : 'center'},
    formatOsd2Hi:{font : '22px normal-font', fill : config.base.colorOsd2Hi, stroke : 0x000000, strokeThickness : 2, align : 'center'},
    formatNotebook:{font : '22px notepen', fill : 0x000000, stroke : 0x000000, strokeThickness : 0, align : 'left'},
    drawdebug:gameVars.drawDebug,
    lastx:-1,
    lasty:-1,
    actualFade:0,
    targetFade:0,
    afterFade:null,
    escapado:false,
    sceneTime:0,
    totalTime:0,
    gosubAction:null,
    gosubScene:null,
    gosubPosition:{x:0,y:0,scale:new PIXI.Point(1,1)},
    sounds:[]
}



var core = new Core();
