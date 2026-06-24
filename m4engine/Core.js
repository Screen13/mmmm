/**
* Clase principal, encargada de inicializar y controlar el resto de componentes.
*
* @class Core
*/

/*
* Valores por defecto del motor. El config.js de cada juego solo necesita
* definir lo que quiera cambiar (y lo obligatorio: assets, verbs, characters,
* initScene...).
*/
function applyConfigDefaults(){
    var defaults={
        fadeSpeed: 500,
        width: 640,
        height: 360,
        textHeight: 20,
        textPadding: 10,
        textSize: 16,
        maxlength: 70,
        colorOsdLo: "#ffffff",
        colorOsdHi: "#cccccc",
        colorOsd2Lo: "#ffffff",
        colorOsd2Hi: "#cccccc",
        pixelPerfect: true,
        menuAtStart: false,        //si es true, el juego arranca mostrando el menu sobre negro
        languages: ["es","en"],    //idiomas validos; el primero es el de por defecto
        speedH: 3,
        speedV: 3,
        minTakinSequence: 16,
        minTimeBeforeClick: 35,
        verbRadius: 28,
        //fuentes: la primera es la de la interfaz, se esperan cargadas antes de arrancar
        fontFamily: "normal-font",
        notebookFontFamily: "notepen",
        fonts: ["normal-font","notepen"],
        //sonidos opcionales
        footsteps: null,        //{frames:[f1,f2], sounds:[id1,id2]}
        inventorySound: null,   //sonido al recibir un item en el inventario
        //textos por defecto de "usar X con Y" (si ningun verbo define useAtText)
        useAtText: __("No parece buena idea.","m4"),
        useAtCharText: __("No parece buena idea.","m4"),
        //lip-sync: letra -> posicion de boca (indice dentro de talk[1])
        lipsync: {
            ".":0, ",":0, " ":0,
            "a":1,
            "o":2, "u":2,
            "e":3, "i":3,
            "t":4, "s":4, "c":4, "g":4, "k":4, "r":4, "y":4, "z":4, "d":4, "j":4, "x":4, "q":4, "w":4,
            "l":5, "n":5, "ñ":5,
            "m":6, "b":6, "p":6,
            "f":7, "v":7
        }
    };
    for(var key in defaults){
        if(typeof config.base[key]=='undefined')config.base[key]=defaults[key];
    }
    //estructuras que el motor da por existentes
    if(typeof config.scenes=='undefined')config.scenes=[];
    if(typeof config.dialogs=='undefined')config.dialogs=[];
    if(typeof config.inventory=='undefined')config.inventory=[];
    if(typeof config.customActions=='undefined')config.customActions={};
    if(typeof window.gameVars=='undefined')window.gameVars={};
    if(typeof gameVars.items=='undefined')gameVars.items={};
    if(typeof gameVars.invent=='undefined')gameVars.invent=[];
}

/*
* Escena vacia (fondo negro, personaje oculto) usada como pantalla del
* menu inicial cuando config.base.menuAtStart es true.
*/
var M4_BOOT_SCENE = {
    id: "__menu",
    img: null, imgBack: null, imgFront: null, imgSpeed: [1],
    enters: [{inix: -100, iniy: -2000, endx: -100, endy: -2000}],
    exits: [], areas: [], items: [], characters: [],
    before: function(){}, everyupdate: function(){}
};

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
    this.renderer = new PIXI.CanvasRenderer(config.base.width, config.base.height);
    this.renderer.roundPixels=config.base.pixelPerfect;
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
    /**
    * Sistema de sonido
    *
    * @property m4sound
    * @type M4Sound
    */
    this.m4sound = new M4Sound();          //controlador de sonido
    this.preSceneData;

    this.assetsToLoad = config.base.assets;
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
Core.prototype.carga_sonido = function(){

     coreVars.sounds = [];
     for(let i=0; i<config.base.snd.length; i++){
        coreVars.sounds.push(
            {src:config.base.folder+"/assets/"+config.base.snd[i].src, id:config.base.snd[i].id}
        );
     }

     this.m4sound.preloadSounds(coreVars.sounds,this.cargado);

}
/**
* Espera a que esten cargadas las fuentes de config.base.fonts y arranca el juego.
*/
Core.prototype.cargado = function(){
    var fonts=config.base.fonts;
    var i=0;
    function next(){
        if(i>=fonts.length){
            core.start();
            return;
        }
        //el texto de muestra incluye un caracter CJK para forzar tambien la
        //carga de las fuentes chinas (sin el, algun navegador no las resuelve).
        //si una fuente falla se sigue arrancando igual (mejor texto con
        //fallback del sistema que juego colgado en Loading)
        document.fonts.load('22px '+fonts[i++],'Ag永').then(next,next);
    }
    next();
}


Core.prototype.start = function(){

            var loading=document.getElementById('loading');
            if(loading)loading.remove();
            if(config.base.name)document.title=config.base.name;

            this.camera = new Camera();
            this.mainContainer = new PIXI.Container();

            //Antes del OSD
            config.base.fullscreen=core.storage.getItem('fullscreen');

            if(config.base.fullscreen!=false && config.base.fullscreen!=true &&
                config.base.fullscreen!='false' && config.base.fullscreen!='true'){

                config.base.fullscreen=false;
                core.storage.setItem('fullscreen', config.base.fullscreen);
            }

            if(typeof(window.api)!='undefined')

            if(core.storage.getItem('fullscreen')==true || core.storage.getItem('fullscreen')=='true'){
                window.api.invoke('ponFullScreen', []).then(function(res) {}).catch(function(err) {});
            }else{
                window.api.invoke('quitaFullScreen', []).then(function(res) {}).catch(function(err) {});
            }

            config.base.lang=core.storage.getItem('lang');

            if(config.base.languages.indexOf(config.base.lang)==-1){
                config.base.lang=config.base.languages[0];
                core.storage.setItem('lang', config.base.lang);
            }

            this.osd = new Osd();

            this.lactions = new LActions();

            this.black = new PIXI.Graphics();
            this.black.beginFill(0x000000);
            this.black.lineStyle(0, 0x000000);
            this.black.drawRect(0, 0, config.base.width, config.base.height);
            this.black.alpha = 0;

            this.character = this.loadCharacter(config.characters[0], false);
            this.character.hitArea = new PIXI.Rectangle(0, 0, 0, 0); //truqui para que sea intocable

            //estado inicial del juego: lo restaura "NUEVO JUEGO" (core.newGame)
            this.initialGameVars = clone(gameVars);

            //para depurar se puede arrancar en cualquier escena con ?scene=Nombre_Escena
            //(en ese caso se salta el menu inicial)
            var startScene=null;
            try{
                var urlScene=new URLSearchParams(window.location.search).get('scene');
                if(urlScene)startScene=getScene(urlScene);
            }catch(e){}
            if(!startScene && config.base.menuAtStart){
                coreVars.onBootMenu=true;
                startScene=M4_BOOT_SCENE;
            }
            if(!startScene)startScene=getScene(config.base.initScene);
            this.loadScene(startScene);

            this.mainContainer.addChild(this.scene);
            this.mainContainer.addChild(this.osd);
            this.mainContainer.addChild(this.black);

            this.stage.addChild(this.mainContainer);
            core.osd.addChild(core.osd.cursor); //aqui fuera para que se ejecute siempre el ultimo

            this.running=true;
            this.recalculate();
            this.pinta();

            if(coreVars.onBootMenu){
                //menu inicial sobre negro: sin interfaz de juego pero con cursor.
                //El fade se pone transparente (la escena de arranque ya es negra);
                //si no, el velo de fundido taparia el menu al estar el juego en pausa.
                fadeIn(true);
                this.osd.hide();
                this.osd.cursor.visible=true;
                this.osd.showOptionsPanel();
            }

}

/**
* Empieza una partida desde el principio: restaura las variables y el
* inventario iniciales y carga la escena inicial.
*/
Core.prototype.newGame = function(){
    coreVars.onBootMenu=false;
    gameVars=clone(this.initialGameVars);

    var items=core.osd.inventoryPanel.items;
    for(var i=0; i<items.length; i++){
        items[i].status = (gameVars.invent.indexOf(items[i].id)!=-1) ? 1 : 0;
        items[i].order=-1;
    }
    core.osd.cursor.removeItem();

    //la libreta vuelve a estar en blanco
    core.osd.notebookPanel.entries=[];
    core.osd.notebookPanel.plaintext='';
    core.osd.notebookPanel.pagina=0;
    core.osd.notebookPanel.paginas=[''];

    this.loadScene(getScene(config.base.initScene));
}

Core.prototype.pause = function(){
        if(core.scene){
            core.scene.playing=false;
            core.scene.loff();
            core.scene.pause();
        }
        core.running=false;
}
Core.prototype.run = function(){
        if(core.scene){
            core.scene.playing=true;
            core.scene.lon();
            core.scene.run();
        }
        core.running=true;
}
    /* Limitar los FPS */
    let g_TICK = 1000/60; // duracion de un tick de logica: 60 por segundo
    let g_Time = 0;
    /* Recalcular sceneTime */
    let lastUpdateTime = (new Date()).getTime();

/* Avanza el fundido a negro hacia targetFade y dispara el callback al llegar. */
function updateFade(){
    if(coreVars.actualFade!=coreVars.targetFade){
        var dir=(coreVars.targetFade>coreVars.actualFade)?1:-1;
        coreVars.actualFade=coreVars.actualFade+(0.08*dir);
        if(Math.abs(coreVars.actualFade-coreVars.targetFade)<0.1){
            coreVars.actualFade=coreVars.targetFade;
            fireAfterFade();
        }
        core.black.alpha=coreVars.actualFade;
    }else{
        fireAfterFade();
    }
}
function fireAfterFade(){
    if(coreVars.afterFade!=null){
        var callback=coreVars.afterFade;
        coreVars.afterFade=null; //se anula antes de llamar, por si el callback programa otro fade
        callback.call();
    }
}

Core.prototype.pinta = function() {
    requestAnimationFrame(core.pinta);

    /* Limitar los FPS: la logica solo avanza en ticks de g_TICK ms,
       independientemente del refresco del monitor */
    let timeNow = (new Date()).getTime();
    if (timeNow - g_Time < g_TICK) return;
    g_Time += g_TICK; //se acumula (no se iguala) para no perder ticks por el jitter de requestAnimationFrame
    if (timeNow - g_Time > g_TICK*5) g_Time = timeNow; //retraso grande (pestana en segundo plano): se descarta en vez de recuperarlo a rafagas

    /* Recalcular sceneTime */
    let deltaTime = timeNow - lastUpdateTime;
    lastUpdateTime = timeNow;

    let mousePosition = core.renderer.plugins.interaction.mouse.getLocalPosition(core.scene);
    core.osd.cursor.x=mousePosition.x;
    core.osd.cursor.y=mousePosition.y;

    if(core.running==true){
        if(core.scene)for(var i=0; i<core.scene.characters.length; i++){
            core.scene.characters[i].actualiza();
        }
        core.camera.actualiza();
        core.scene.actualiza(core.camera);
        core.lactions.actualiza();

        updateFade();

        if(coreVars.escapado==false){
            if(core.keyboard['\x1B']){ //tecla ESC
                core.keyboard['\x1B']=false;
                coreVars.escapado=true;
                core.scene.escapa();
            }
        }else{
            if(!core.keyboard['\x1B']){
                coreVars.escapado=false;
            }
        }

        //dibuja rectangulos para debug
        if(coreVars.drawdebug){
            drawDebug();
        }

        if(deltaTime>=30)deltaTime=30-1;
        coreVars.totalTime += Math.floor(  (30-deltaTime)/30  );

    }//if running
    core.renderer.render(core.stage);

}//pinta


/**
* Guarda en gameVars.items el estado (posicion/visibilidad) de los items
* de la escena actual.
*/
Core.prototype.snapshotSceneItems = function(){
    if(!core.scene)return;
    gameVars.items[core.scene.id]={};
    for(var i=0; i<core.scene.items.length; i++){
        var item=core.scene.items[i];
        gameVars.items[core.scene.id][item.id]={
            id:item.id,
            x:item.x,
            y:item.y,
            visible:item.visible,
            interactive:item.interactive
        };
    }
}

Core.prototype.loadGame = function(slot){

	var saveGame = localStorage.getItem('savegame'+slot);

	if(saveGame!=null){
		coreVars.onBootMenu=false;
		saveGame=JSON.parse(saveGame);

		gameVars=saveGame.items;

		for (var i = 0; i < saveGame.inventory.length; i++) {
			var iventItem=getItemInventory(saveGame.inventory[i].id);
	            iventItem.status=saveGame.inventory[i].status;
	            iventItem.order=saveGame.inventory[i].order;
		}

		//libreta: array de claves que se traducen al renderizar (un string suelto
		//es un savegame del formato anterior; partidas sin el campo, vacia)
		var nb=saveGame.notebook;
		core.osd.notebookPanel.entries=Array.isArray(nb)?nb:(nb?[nb]:[]);
		core.osd.notebookPanel.plaintext='';
		core.osd.notebookPanel.pagina=0;
		core.osd.notebookPanel.paginas=[''];


		core.scene.stopTalking();
        core.mainContainer.removeChild(core.scene);
        core.scene=null;

        this.loadScene(getScene(saveGame.scene),0,saveGame.character);

	}
}
Core.prototype.saveGame = function(slot){

	//hay que salvar la pantalla actual
	this.snapshotSceneItems();

	var inventoryToSave=[];
	for (var i = 0; i < core.osd.inventoryPanel.items.length; i++) {
            inventoryToSave.push({
            	id:core.osd.inventoryPanel.items[i].id,
            	status:core.osd.inventoryPanel.items[i].status,
            	order:core.osd.inventoryPanel.items[i].order
            });
	}
	var d = new Date();
	var saveGame = {
        id:("0" + d.getDate()).slice(-2) + "/" + ("0"+(d.getMonth()+1)).slice(-2) + "/" + d.getFullYear() + " " + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2),
		character:{x:core.character.x,y:core.character.y,scale:core.character.scale},
		items:gameVars,
		inventory:inventoryToSave,
		notebook:core.osd.notebookPanel.entries,
		scene:core.scene.id
	}

	localStorage.setItem('savegame'+slot, JSON.stringify(saveGame));
}




Core.prototype.loadCharacter = function(characterData, interactive){
        var lcharacter = new Character(characterData.id,characterData.name,characterData.images,characterData.color, interactive, characterData.actions);
        for(var key in characterData.animations){
            lcharacter.addAnimation(key,characterData.animations[key]);
        }
        //extensiones opcionales definidas en los datos del personaje
        if(characterData.speedH)lcharacter.speedH=characterData.speedH;
        if(characterData.speedV)lcharacter.speedV=characterData.speedV;
        if(characterData.footsteps)lcharacter.footsteps=characterData.footsteps;
        if(characterData.animationSounds)lcharacter.animationSounds=characterData.animationSounds;
        if(characterData.onUpdate)lcharacter.onUpdate=characterData.onUpdate;
        if(characterData.beforeSay)lcharacter.beforeSay=characterData.beforeSay;
        if(characterData.attachments){
            for(var i=0; i<characterData.attachments.length; i++){
                lcharacter.addAttachment(characterData.attachments[i]);
            }
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

    if(gotoEnter>=1000)gotoEnter=gotoEnter-1000; //los gotoEnter >= 1000 marcan "llegada en vehiculo" (ver gotoDoorInmediate)


    if(core.scene){
        core.snapshotSceneItems(); //salva el estado actual de los items
        core.scene.stopTalking();
        core.mainContainer.removeChild(core.scene);
        core.scene=null;
    }

    core.lactions.stop();
    core.character.stop();
    core.osd.cursor.loff();
    coreVars.item="";
    coreVars.itemid=0;


    var lscene=new Scene(sceneData.id, sceneData.name, sceneData.img,sceneData.imgBack,sceneData.imgFront,sceneData.imgSpeed,sceneData.escape_target,sceneData.escape_target_door, sceneData.before, sceneData.everyupdate);
    lscene.noOptionsMenu=(sceneData.noOptionsMenu===true);

    for(var i = 0; i < sceneData.areas.length; i++) {
        var larea=[];
        for(var j = 0; j < sceneData.areas[i].length; j=j+2) {
            larea.push(new PIXI.Point(sceneData.areas[i][j],sceneData.areas[i][j+1]));
        }
        lscene.addArea(larea);
    }
    /****** entradas y salidas ******/
    for (var i = 0; i < sceneData.enters.length; i++) {
        var thisenter=new Enter(sceneData.enters[i].inix,sceneData.enters[i].iniy,sceneData.enters[i].endx,sceneData.enters[i].endy);
        lscene.addEnter(thisenter);
    }
    for (var i = 0; i < sceneData.exits.length; i++) {
        var thisexit=new Item(sceneData.exits[i].id,sceneData.exits[i].name,sceneData.exits[i].images,null, null, sceneData.exits[i].loop,sceneData.exits[i].width,sceneData.exits[i].height,true,sceneData.exits[i].goto,sceneData.exits[i].gotoEnter,sceneData.exits[i].cursorImage);
        thisexit.vehicle=sceneData.exits[i].vehicle;
        thisexit.vehicleSound=sceneData.exits[i].vehicleSound;
        lscene.addExit(thisexit,sceneData.exits[i].x,sceneData.exits[i].y,sceneData.exits[i].z);
    }
    /****** items ******/
	for (var i = 0; i < sceneData.items.length; i++) {
            var thisitem=new Item(sceneData.items[i].id,sceneData.items[i].name,sceneData.items[i].images,sceneData.items[i].textcontent, sceneData.items[i].textformat, sceneData.items[i].loop,sceneData.items[i].width,sceneData.items[i].height,sceneData.items[i].interactive,null,null,sceneData.items[i].cursorImage, sceneData.items[i].actions,sceneData.items[i].click_action);
            for(var key in sceneData.items[i].animations){
                thisitem.addAnimation(key,sceneData.items[i].animations[key]);
            }
            lscene.addItem(thisitem,sceneData.items[i].x,sceneData.items[i].y,sceneData.items[i].z);//x y capa(-3 +3)
    }
    //restaura el estado guardado y elimina los que no están en gameVars (porque han sido cogidos previamente)
	if(typeof(gameVars.items[lscene.id])!='undefined'){
		for(var i=lscene.items.length-1; i>=0; i--){
			var saved=gameVars.items[lscene.id][lscene.items[i].id];
			if(typeof(saved)!='undefined'){
				lscene.items[i].x=saved.x;
				lscene.items[i].y=saved.y;
				lscene.items[i].visible=saved.visible;
				lscene.items[i].interactive=saved.interactive;
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

    var vieneDeGosub=(position!=null);
    lscene.before(vieneDeGosub);
    if(position==null){
        if(core.scene.enters[gotoEnter].endx!=core.scene.enters[gotoEnter].inix)core.character.walkTo(core.scene.enters[gotoEnter].endx,core.scene.enters[gotoEnter].endy);
    }
}

Core.prototype.gosubReturn = function(){
    coreVars.gosubAction=null;
    this.loadScene(getScene(coreVars.gosubScene),0,coreVars.gosubPosition);
}




applyConfigDefaults();

coreVars={
    scale:0,
    item:"",
    itemid:0,
    overVerb: false,
    onDialog:false,
    onBootMenu:false,
    formatOsdLo:{font : '22px '+config.base.fontFamily, fill : config.base.colorOsdLo, stroke : 0x000000, strokeThickness : 2, align : 'center'},
    formatOsdHi:{font : '22px '+config.base.fontFamily, fill : config.base.colorOsdHi, stroke : 0x000000, strokeThickness : 2, align : 'center'},
    formatOsd2Lo:{font : '22px '+config.base.fontFamily, fill : config.base.colorOsd2Lo, stroke : 0x000000, strokeThickness : 2, align : 'center'},
    formatOsd2Hi:{font : '22px '+config.base.fontFamily, fill : config.base.colorOsd2Hi, stroke : 0x000000, strokeThickness : 2, align : 'center'},
    formatNotebook:{font : '22px '+config.base.notebookFontFamily, fill : 0x000000, stroke : 0x000000, strokeThickness : 0, align : 'left'},
    formatMeanwhile:{font : '22px '+config.base.fontFamily, fill : 0x000000, stroke : 0x000000, strokeThickness : 0, align : 'left'},
    drawdebug:false,
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
