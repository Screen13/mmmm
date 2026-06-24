/**
* Panel de verbos y ejecutor de las acciones declarativas {action, params, if}.
*
* Las acciones disponibles estan en Actions.prototype.handlers. Cada juego
* puede añadir las suyas (o sobreescribir las existentes) registrandolas en
* config.customActions desde su gamedata:
*
*    config.customActions = {
*        miAccion: function(params, thing){
*            core.lactions.add(function(naction){ ... });
*        }
*    };
*
* @class Actions
*/
function Actions() {
    actions_self=this;
    PIXI.Sprite.call(this);

    this.obj= new Text('',coreVars.formatOsdLo);
    this.obj.x=0; this.obj.y=0;
    this.obj.id=0;
    this.aro=new PIXI.Sprite(PIXI.Texture.fromFrame("osd_aro.png"));
    this.aro.x=0; this.aro.y=0;
    this.addChild(this.aro);

    //Verbos en circulo, definidos en config.base.verbs (con "icons":[normal,hover])
    this.verbs=[];
    var numVerbs=config.base.verbs.length;
    var angulo=2.5;
    var incremento=(2*Math.PI)/numVerbs;
    var radio=config.base.verbRadius;
    for (var i = 0; i < numVerbs; i++) {
        var vdef=config.base.verbs[i];
        var icons=vdef.icons||[];
        this.verbs.push(new VerbIcon(vdef.name,icons[0],icons[1]));
        this.verbs[i].x=Math.cos(angulo)*radio +29-20;
        this.verbs[i].y=Math.sin(angulo)*radio +29-20;
        this.addChild(this.verbs[i]);
        this.verbs[i].click=this.selecciona;
        angulo=angulo+incremento;
    }
}
Actions.prototype = Object.create( PIXI.Sprite.prototype );
Actions.prototype.constructor = Actions;


Actions.prototype.selecciona = function(mouseData){
    actions_self.doAction(mouseData.target.name,actions_self.obj.id);
    core.osd.hideActionsPanel();
}

/*
* Calcula un punto transitable cerca de un objeto, a "dist" pixels por el
* lado desde el que viene el personaje.
*/
function walkNearThing(thing, dist){
    var d = (core.character.x<thing.x) ? -dist : dist;
    var point2 = new PIXI.Point(thing.x+d, thing.y);
    var path = shortestPath(core.character.x, core.character.y, point2.x, point2.y, core.scene.areas);
    if(path.encontrado==false) point2=lineaMasCercana(point2.x, point2.y, core.scene.areas);
    return point2;
}

/*
* Texto por defecto al usar el item del cursor sobre algo sin respuesta definida.
*/
function addDefaultUseAtSay(thing){
    var heldName = core.osd.cursor.itemAtObj.name;
    var texts = getUseAtTexts();
    var text = getCharacter(thing.id) ? texts.character : texts.item;
    core.lactions.add(function(naction){
        core.character.say(text.replace('#item#',heldName), naction);
    });
}

/**
* Ejecuta el verbo seleccionado sobre el item del escenario o del inventario.
*
* @method doAction
* @param {String} verb Acción a ejecutar ([verbo], useAt, gotoDoor, gotoDoorInmediate)
* @param {String} itemName ID del item sobre el que ejecutar la acción. Puede ser del escenario o del inventario.
*/
Actions.prototype.doAction = function(verb, itemName){

    var thing;
    if(core.osd.inventoryPanel.container.visible==false){
        thing=getItem(itemName);
    }else{
        thing=getItemInventory(itemName);
    }
    if(!thing)thing=getCharacter(itemName);
    if(!thing)thing=getExit(itemName);
    if(typeof thing=='undefined')return;

    core.lactions.stop();

    if((typeof thing.actions=='undefined')||(typeof thing.actions[verb]=='undefined')){ //si no hay action definida para este item
        if(core.osd.inventoryPanel.container.visible==false){
            if(verb=="useAt"){
                addDefaultUseAtSay(thing);
            }else if(verb=="gotoDoor"){
                core.lactions.add(function(naction){
                    core.character.walkTo(thing.x+(thing.width/2), thing.y+thing.height, naction);
                });
                core.lactions.add(function(naction){
                    core.loadScene(getScene(thing.goto), thing.gotoEnter);
                });
            }else if(verb=="gotoDoorInmediate"){
                //salida en vehiculo: el exit define "vehicle" (id de un item de la escena) y opcionalmente "vehicleSound"
                if(thing.vehicle){
                    core.lactions.add(function(naction){
                        getItem(thing.vehicle).slideTo(thing.x, thing.y+20, naction);
                    });
                    if(thing.vehicleSound)core.m4sound.playSound(thing.vehicleSound);
                }
                core.lactions.add(function(naction){
                    core.loadScene(getScene(thing.goto), thing.gotoEnter);
                });
            }else{
                var lookName=thing.name;
                core.lactions.add(function(naction){ core.character.lookAt(lookName,naction); });
                var defaultText=getVerb(verb).defaultText;
                core.lactions.add(function(naction){ core.character.say(defaultText, naction); });
            }
        }else{//en el inventario
            var vdef=getVerb(verb);
            if(vdef && vdef.isPickup){ //el verbo "coger" del inventario pone el item en el cursor
                core.osd.cursor.addItem(thing);
            }else if(verb=="useAt"){
                addDefaultUseAtSay(thing);
            }else{
                if(vdef){ //evita error si clicas en una puerta con el inventario abierto
                    var lookName2=thing.name;
                    core.lactions.add(function(naction){ core.character.lookAt(lookName2,naction); });
                    var defaultText2=vdef.defaultText;
                    core.lactions.add(function(naction){ core.character.say(defaultText2, naction); });
                }
            }
        }
    }else{
        if(verb=="useAt"){
            var actionstodo="";
            for (var k in thing.actions["useAt"]){
                if(k==core.osd.cursor.itemAtObj.id){ //si tiene accion especifica para este objeto
                    actionstodo=thing.actions["useAt"][k];
                }
            }
            if(actionstodo==""){
                addDefaultUseAtSay(thing);
            }else{
                this.doActions(actionstodo,thing);
            }
        }else{
            this.doActions(thing.actions[verb],thing);
        }
    }
    core.lactions.play();
}

/**
* Acciones declarativas del motor. Cada handler recibe (params, thing) y
* normalmente encola trabajo en core.lactions (que se ejecuta despues, en orden).
* "thing" es el item/personaje sobre el que se ejecuto el verbo (puede ser undefined
* en acciones lanzadas desde dialogos o before()).
*/
Actions.prototype.handlers = {

    say: function(params, thing){
        if(thing){
            var lookName=thing.name;
            core.lactions.add(function(naction){ core.character.lookAt(lookName,naction); });
        }
        core.lactions.add(function(naction){ core.character.say(params, naction); });
    },

    otherSay: function(params, thing){
        if(thing){
            var lookName=thing.name;
            core.lactions.add(function(naction){ core.character.lookAt(lookName,naction); });
        }
        var id=thing.id;
        core.lactions.add(function(naction){ getCharacter(id).say(params, naction); });
    },

    dialog: function(params, thing){
        var point2 = new PIXI.Point(thing.x,thing.y);
        var path = shortestPath(core.character.x,core.character.y,point2.x,point2.y,core.scene.areas);
        if(path.encontrado==false)point2=lineaMasCercana(point2.x,point2.y,core.scene.areas);

        var distancia_a_objeto;
        if(core.character.x<thing.x){
            distancia_a_objeto=-150+Math.abs(point2.x-thing.x);
        }else{
            //si ya esta bastante lejos del personaje (porque no puede acercarse mas), no se le restan los 150
            distancia_a_objeto=150-Math.abs(point2.x-thing.x);
        }
        var tx=point2.x+distancia_a_objeto;
        var ty=point2.y;
        var id=thing.id;
        core.lactions.add(function(naction){ core.character.walkTo(tx,ty,naction); });
        core.lactions.add(function(naction){ core.character.lookAt(id,naction); });
        core.lactions.add(function(naction){ getDialog(params).play(); });
    },

    gotoNdialog: function(params, thing){
        var p=params.split(",");
        var id=thing.id;
        core.lactions.add(function(naction){ core.character.walkTo(parseFloat(p[0]),parseFloat(p[1]),naction); });
        core.lactions.add(function(naction){ core.character.lookAt(id,naction); });
        core.lactions.add(function(naction){ getDialog(p[2]).play(); });
    },

    dialogNoGoto: function(params){
        core.lactions.add(function(naction){ getDialog(params).play(); });
    },

    pick: function(params, thing){
        var point2=walkNearThing(thing,50); //se para antes de llegar al objeto
        var id=thing.id;
        core.lactions.add(function(naction){ core.character.walkTo(point2.x,point2.y,naction); });
        core.lactions.add(function(naction){ core.character.lookAt(id,naction); });
        core.lactions.add(function(naction){ core.character.pick(id,naction); });
        core.lactions.add(function(naction){ core.scene.removeItem(id,naction); });
        core.lactions.add(function(naction){ core.osd.inventoryPanel.in(params,naction); });
    },

    walkToObject: function(params, thing){
        var point2=walkNearThing(thing,10);
        var id=thing.id;
        core.lactions.add(function(naction){ core.character.walkTo(point2.x,point2.y,naction); });
        core.lactions.add(function(naction){ core.character.lookAt(id,naction); });
    },

    lookObject: function(params){
        core.lactions.add(function(naction){ core.character.lookAt(params,naction); });
    },

    walk: function(params){
        var p=params.split(",");
        core.lactions.add(function(naction){ getCharacter(p[0]).walkTo(parseFloat(p[1]),parseFloat(p[2]),naction); });
    },

    sound: function(params){
        core.lactions.add(function(naction){ core.m4sound.playSound(params,false,null,naction); });
    },

    goto: function(params){
        core.lactions.add(function(naction){ core.loadScene(getScene(params)); });
    },

    gotosub: function(params){
        var p=params.split(",");
        coreVars.gosubAction=p[1];
        coreVars.gosubScene=core.scene.id;
        coreVars.gosubPosition={x:core.character.x,y:core.character.y,scale:core.character.scale};
        core.lactions.add(function(naction){ core.loadScene(getScene(p[0])); });
    },

    combine: function(params){ //params es un Array: [item1, item2, resultado]
        core.osd.cursor.removeItem();
        core.lactions.add(function(naction){ core.osd.inventoryPanel.out(params[0],naction); });
        core.lactions.add(function(naction){ core.osd.inventoryPanel.out(params[1],naction); });
        core.lactions.add(function(naction){ core.osd.inventoryPanel.in(params[2],naction); });
    },

    addInventory: function(params){
        core.lactions.add(function(naction){ core.osd.inventoryPanel.in(params,naction); });
    },

    removeInventory: function(params){
        core.lactions.add(function(naction){ core.osd.inventoryPanel.out(params,naction); });
    },

    closeInventory: function(){
        core.lactions.add(function(naction){ core.osd.closeInventory(naction); });
    },

    setVar: function(params){
        var idx=params.indexOf(",");
        var name=params.substring(0,idx);
        var value=params.substring(idx+1);
        try{ value=JSON.parse(value); }catch(e){} //numeros y booleanos se guardan con su tipo; el resto, como texto
        gameVars[name]=value;
    },

    hideObject: function(params){
        core.lactions.add(function(naction){ core.scene.hideItem(params,naction); });
    },

    showObject: function(params){
        core.lactions.add(function(naction){ core.scene.showItem(params,naction); });
    },

    showObjectNoInteractive: function(params){
        core.lactions.add(function(naction){ core.scene.showItemNoInteractive(params,naction); });
    },

    moveObject: function(params){
        var p=params.split(",");
        core.lactions.add(function(naction){ core.scene.moveItem(p[0],parseFloat(p[1]),parseFloat(p[2]),naction); });
    },

    osdOff: function(){
        core.lactions.add(function(naction){ core.osd.hide(naction); });
    },

    osdOn: function(){
        core.lactions.add(function(naction){ core.osd.show(naction); });
    },

    animation: function(params){
        var p=params.split(",");
        if(p.length==3){
            core.lactions.add(function(naction){ getCharacter(p[0]).doAnimationLoop(p[1],naction); });
        }else{
            core.lactions.add(function(naction){ getCharacter(p[0]).doAnimation(p[1],naction); });
        }
    },

    objAnimation: function(params){
        var p=params.split(",");
        if(p.length==3){
            core.lactions.add(function(naction){ getItem(p[0]).doAnimationLoop(p[1],naction); });
        }else{
            core.lactions.add(function(naction){ getItem(p[0]).doAnimation(p[1],naction); });
        }
    },

    showNotebook: function(){
        core.osd.inventoryPanel.hide();
        core.osd.notebookPanel.show();
    },

    escribe: function(params){
        core.lactions.add(function(naction){ core.osd.notebookPanel.in(params,naction); });
    }
};

/**
* Ejecuta una lista de acciones declarativas [{if, action, params}] en orden.
*
* @method doActions
* @param {Array} actions Lista de acciones a ejecutar.
* @param {Object} thing Item o personaje objetivo (opcional, usado por algunas acciones).
*/
Actions.prototype.doActions = function(actions, thing){
    for (var i = 0; i < actions.length; i++) {
        if(shouldSkip(actions[i].if))continue;

        var handler=this.handlers[actions[i].action];
        if(!handler && config.customActions)handler=config.customActions[actions[i].action];
        if(handler){
            handler.call(this, actions[i].params, thing);
        }else{
            console.warn("M4Engine: accion desconocida '"+actions[i].action+"'");
        }
    }
}
