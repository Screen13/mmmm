/**
* Ejecuta las acciones.
*
* @class Actions
* @Actions
*/
function Actions() {
    actions_self=this;
    PIXI.Sprite.call(this);
  
    this.obj= new Text('',coreVars.formatOsdLo);
    this.obj.x=0; this.obj.y=0;
    this.obj.id=0;
    //this.addChild(this.obj); //titulo del objeto (solo debe aparecer si se usa la version texto del selector)
    this.aro=new PIXI.Sprite(PIXI.Texture.fromFrame("osd_aro.png"));
    this.aro.x=0; this.aro.y=0;
    this.addChild(this.aro);

    this.verbs=[];

    /*
    //Verbos en formato texto
    for (var i = 0; i < config.base.verbs.length; i++) {
        this.verbs.push(new Text(config.base.verbs[i].name,coreVars.formatOsd2Lo,coreVars.formatOsd2Hi) );
        this.verbs[i].x=0; this.verbs[i].y=15+(15*i); // altura del texto e interlineado
        this.verbs[i].name=config.base.verbs[i].name;
        this.addChild(this.verbs[i]);
        this.verbs[i].click=this.selecciona;
    }
    */

    //Verbos en formato imagen
    var angulo_inicial=2.5;
    var incremento=(2*Math.PI)/3; //3 es el numero de verbos
    var i=0; //coger
    this.verbs.push(new VerbIcon(config.base.verbs[i].name,"osd_ico_mano_1.png","osd_ico_mano_2.png") );
    this.verbs[i].x=Math.cos(angulo_inicial)*28  +29-20
    this.verbs[i].y=Math.sin(angulo_inicial)*28  +29-20
    this.addChild(this.verbs[i]);
    this.verbs[i].click=this.selecciona;
    i=1; //mirar
    angulo_inicial=angulo_inicial+incremento;
    this.verbs.push(new VerbIcon(config.base.verbs[i].name,"osd_ico_ojo_1.png","osd_ico_ojo_2.png") );
    this.verbs[i].x=Math.cos(angulo_inicial)*28  +29-20
    this.verbs[i].y=Math.sin(angulo_inicial)*28  +29-20
    this.addChild(this.verbs[i]);
    this.verbs[i].click=this.selecciona;
    i=2; //hablar
    angulo_inicial=angulo_inicial+incremento;
    this.verbs.push(new VerbIcon(config.base.verbs[i].name,"osd_ico_boca_1.png","osd_ico_boca_2.png") );
    this.verbs[i].x=Math.cos(angulo_inicial)*28  +29-20
    this.verbs[i].y=Math.sin(angulo_inicial)*28  +29-20
    this.addChild(this.verbs[i]);
    this.verbs[i].click=this.selecciona;
}
Actions.prototype = Object.create( PIXI.Sprite.prototype );
Actions.prototype.constructor = Actions;


Actions.prototype.selecciona = function(mouseData){
    actions_self.doAction(mouseData.target.name,actions_self.obj.id);
    core.osd.hideActionsPanel();
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
    if(!thing)if(core.osd.inventoryPanel.container.visible==false){
        thing=getItem(itemName);
    }else{
        thing=getItemInventory(itemName);
    }
    if(!thing)thing=getCharacter(itemName);
    if(!thing)thing=getDoor(itemName);
    if(typeof thing!='undefined'){




    core.lactions.stop();
    if((typeof thing.actions=='undefined')||(typeof thing.actions[verb]=='undefined')){ //si no hay action definida para este item
        if(core.osd.inventoryPanel.container.visible==false){
            if(verb=="useAt"){
                //console.log("USAR CON personaje u objeto");
                //thing.name = objeto del escenario o character
                //core.osd.cursor.itemAtObj.name = objeto en el cursor
                if(getCharacter(thing.id)){ //si es un personaje...
                    core.lactions.add("core.character.say('"+getVerb("coger").useAtCharText.replace('#item#',core.osd.cursor.itemAtObj.name)+"', naction)");
                }else{
                    core.lactions.add("core.character.say('"+getVerb("coger").useAtText.replace('#item#',core.osd.cursor.itemAtObj.name)+"', naction)");
                }
            }else if(verb=="gotoDoor"){
                core.lactions.add("core.character.walkTo("+(thing.x+(thing.width/2))+","+(thing.y+thing.height)+", naction)");
                core.lactions.add( "core.loadScene(getScene('"+thing.goto+"'),"+thing.gotoEnter+")" );
            }else if(verb=="gotoDoorInmediate"){
                core.lactions.add("getItem('mini_coche').slideTo("+thing.x+","+(thing.y+20)+", naction)"); /************************************************************** MINICOCHE HARDCODE ***********/
                core.lactions.add( "core.loadScene(getScene('"+thing.goto+"'),"+thing.gotoEnter+")" );
            }else{
                if(thing)core.lactions.add("core.character.lookAt('"+thing.name+"',naction)");
                core.lactions.add("core.character.say('"+getVerb(verb).defaultText+"', naction)");
            }
        }else{//en el inventario
            if(verb=="coger"){ /******************************* no deberia ser por nombre de verbo.. quizas orden y que siempre sea coger el primero en el json?? *****************/
                core.osd.cursor.addItem(thing);
            }else if(verb=="useAt"){
                //console.log("USAR CON inventario");
                var actionstodo="";
                for (var k in thing.actions["useAt"]){
                    if(k==core.osd.cursor.itemAtObj.id){ //si tiene accion especifica para este objeto
                        actionstodo=thing.actions["useAt"][k];
                    }
                }
                if(actionstodo==""){
                //thing.name = objeto del escenario o character
                //core.osd.cursor.itemAtObj.name = objeto en el cursor
                    core.lactions.add("core.character.say('"+getVerb("coger").useAtText.replace('#item#',core.osd.cursor.itemAtObj.name)+"', naction)");
                }else{
                    this.doActions(actionstodo,thing);
                }
            }else{
                if(getVerb(verb)){ //evita error si clicas en una puerta con el inventario abierto
                    if(thing)core.lactions.add("core.character.lookAt('"+thing.name+"',naction)");
                    core.lactions.add("core.character.say('"+getVerb(verb).defaultText+"', naction)"); 
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
                //accion por defecto (esto esta repetido arriba)
                //thing.name = objeto del escenario o character
                //core.osd.cursor.itemAtObj.name = objeto en el cursor
                if(getCharacter(thing.name)){ //si es un personaje...
                    core.lactions.add("core.character.say('"+getVerb("coger").useAtCharText.replace('#item#',core.osd.cursor.itemAtObj.name)+"', naction)");
                }else{
                    core.lactions.add("core.character.say('"+getVerb("coger").useAtText.replace('#item#',core.osd.cursor.itemAtObj.name)+"', naction)");
                }
            }else{
                this.doActions(actionstodo,thing);
            }
        }else{
            this.doActions(thing.actions[verb],thing, getItemInventory("tripas de pescado"));/////////////////// O J O C U I D A O //////
            /***********************************************************************************/
            /***********************************************************************************/
            /***********************************************************************************/
            /***********************************************************************************/
            /***********************************************************************************/
            /***********************************************************************************/
            /***********************************************************************************/
            /***********************************************************************************/
            /***********************************************************************************/
            /***********************************************************************************/
            /***********************************************************************************/
            /***********************************************************************************/
            /***********************************************************************************/
            /***********************************************************************************/
        }//if useAt
    }//if
    core.lactions.play();
    }//if thing
}

/**
* Ejecuta la acción (o acciones) por orden. Método principal par ejecutar listas de acciones en el juego.
* Las acciones pueden ser:
* - Dialog: (params->ID del dialogo, thing->Objeto o personaje al que mirar)
* - dialogNoGoto: Igual que Dialog, pero no se acerca para hablar.
* - pick: (params->ID del objeto que añade al inventario, thing->Objeto que coge del escenario)
* - say: (params->Texto a decir, thing->Objeto o personaje al que mirar)
* - walk: (params->Coordenadas (separadas por , ))
* - walkToObject: (thing->Objeto al que acercarse)
* - goto: Ir a la escena PARAMS
* - gotosub: Igual que goto, pero recuerda la escena y la posicion actual en gameVars.
* - combine: Elimina 1 y 2 del inventario y añade 3.
* - addInventory: Añade PARAMS al inventario.
* - removeInventory: Elimina PARAMS de inventario.
* - setVar: Variable (gameVars), valor.
* - hideObject: Oculta el objeto PARAMS.
* - showObject: Muestra el objeto PARAMS.
* - moveObject: Item, x, y.
* - osdOff: Apaga el OSD.
* - osdOn: Enciende el OSD.
* - animation: Character, animacion, loop (true o false).
* - objAnimation: Item, animacion, loop (true o false).
*
* @method doActions
* @param {Array} actions Lista de acciones [if, action, params] a ejecutar.
* @param {String} thing Parámetro extra 1, usado en algunas actions.
* @param {String} thing2 Parámetro extra 2, usado en algunas actions.
*/
Actions.prototype.doActions = function(actions, thing, thing2){

    var skip_this_action = false;

    for (var i = 0; i < actions.length; i++) {

        skip_this_action = false;

        if(typeof(actions[i].if)!="undefined"){

            var tautology=actions[i].if.split(",");
            
            if(gameVars[tautology[0]]==JSON.parse(tautology[1])){
                skip_this_action = false;
            }else{
	                skip_this_action = true;
            }

            
        }

        if(skip_this_action==false){

        switch(actions[i].action){
            case "dialog":
                var point1 = new PIXI.Point(core.character.x, core.character.y);
                var point2 = new PIXI.Point(thing.x,thing.y);
                var path = shortestPath(point1.x,point1.y,point2.x,point2.y,scene_self.areas);

                if(path.encontrado==false)point2=lineaMasCercana(point2.x,point2.y,scene_self.areas);
                if(core.character.x<thing.x){
                    distancia_a_objeto=-150;
                    distancia_a_objeto=distancia_a_objeto+Math.abs(point2.x-thing.x);
                }else{
                    distancia_a_objeto=150;
                    distancia_a_objeto=distancia_a_objeto-Math.abs(point2.x-thing.x);//si Matt ya esta bastante lejos del personaje, porque no puede acercarse mas, no le resto los 150
                }
                
                
                core.lactions.add("core.character.walkTo("+(point2.x+distancia_a_objeto)+","+point2.y+", naction)");
                core.lactions.add("core.character.lookAt('"+thing.name+"',naction)");
                core.lactions.add("getDialog('"+actions[i].params+"').play()");
            break;
            case "dialogNoGoto":
                core.lactions.add("getDialog('"+actions[i].params+"').play()");
            break;
            case "pick":

                    var point1 = new PIXI.Point(core.character.x, core.character.y);
                    //se para antes de llegar al objeto
                    if(core.character.x<thing.x){
                        distancia_a_objeto=-0;
                    }else{
                        distancia_a_objeto=0;
                    }
                    var point2 = new PIXI.Point(thing.x+distancia_a_objeto,thing.y);
                    var path = shortestPath(point1.x,point1.y,point2.x,point2.y,scene_self.areas);

                    if(path.encontrado==false)point2=lineaMasCercana(point2.x,point2.y,scene_self.areas);
                    core.lactions.add("core.character.walkTo("+point2.x+","+point2.y+", naction)");
                    core.lactions.add("core.character.lookAt('"+thing.id+"',naction)");
                    core.lactions.add("core.character.pick('"+thing.id+"',naction)");
                    core.lactions.add("core.scene.removeItem('"+thing.id+"',naction)");

                    core.lactions.add("core.osd.inventoryPanel.in('"+actions[i].params+"',naction)");
            break;
            case "say":
                if(thing)core.lactions.add("core.character.lookAt('"+thing.name+"',naction)");
                core.lactions.add("core.character.say('"+actions[i].params+"', naction)");
                //core.lactions.add("core.osd.inventoryPanel.out('chicle',naction)");
                //core.lactions.add("core.osd.inventoryPanel.out('pelo de rata',naction)");
                //core.lactions.add("core.osd.inventoryPanel.in('bigote falso',naction)");

            break;
            case "walk":
                var parameters=actions[i].params.split(",");
                //console.log(parameters);
                //console.log("getCharacter('"+thing.name+"'').walkTo("+parameters[0]+","+parameters[1]+", naction)");
                //if(typeof(getCharacter(thing.name))=="undefined")thing.name=core.character.name;
                //core.lactions.add("getCharacter('"+thing.name+"').walkTo("+parameters[0]+","+parameters[1]+", naction)");
                core.lactions.add("getCharacter('"+parameters[0]+"').walkTo("+parameters[1]+","+parameters[2]+", naction)");
            break;
            case "walk2": //especial para sparky *****************************************************************************
                var parameters=actions[i].params.split(",");
                core.lactions.add("getCharacter('"+parameters[0]+"').walk2To("+parameters[1]+","+parameters[2]+", naction)");
            break;
            case "walkToObject":

                //if(typeof(getCharacter(thing.name))=="undefined")thing.name=core.character.name;
                var point1 = new PIXI.Point(core.character.x, core.character.y);
                    //se para antes de llegar al objeto
                    if(core.character.x<thing.x){
                        distancia_a_objeto=-20;//90
                    }else{
                        distancia_a_objeto=20;//90
                    }
                    var point2 = new PIXI.Point(thing.x+distancia_a_objeto,thing.y);
                    var path = shortestPath(point1.x,point1.y,point2.x,point2.y,scene_self.areas);

                    if(path.encontrado==false)point2=lineaMasCercana(point2.x,point2.y,scene_self.areas);
                    core.lactions.add("core.character.walkTo("+point2.x+","+point2.y+", naction)");
                    
                    core.lactions.add("core.character.lookAt('"+thing.id+"',naction)");
            break;

            case "goto":
                core.lactions.add("core.loadScene(getScene('"+actions[i].params+"'))");
            break;
            case "gotosub":
                var parameters=actions[i].params.split(",");
                coreVars.gosubAction=parameters[1];
                coreVars.gosubScene=core.scene.id;
                coreVars.gosubPosition={x:core.character.x,y:core.character.y,scale:core.character.scale};
                
                core.lactions.add("core.loadScene(getScene('"+parameters[0]+"'))");
            break;
            case "combine":
                core.osd.cursor.removeItem();
                core.lactions.add("core.osd.inventoryPanel.out('"+actions[i].params[0]+"',naction)");
                core.lactions.add("core.osd.inventoryPanel.out('"+actions[i].params[1]+"',naction)");
                core.lactions.add("core.osd.inventoryPanel.in('"+actions[i].params[2]+"',naction)");
            break;
            case "addInventory":
                core.lactions.add("core.osd.inventoryPanel.in('"+actions[i].params+"',naction)");
            break;
            case "removeInventory":
                //core.osd.cursor.removeItem();
                core.lactions.add("core.osd.inventoryPanel.out('"+actions[i].params+"',naction)");
            break;
            case "setVar":
                var parameters=actions[i].params.split(",");
                gameVars[parameters[0]]=parameters[1];
            break;
            case "hideObject":
                core.lactions.add("core.scene.hideItem('"+actions[i].params+"',naction)");
            break;
            case "showObject":
                core.lactions.add("core.scene.showItem('"+actions[i].params+"',naction)");
            break;
            case "moveObject":
                var parameters=actions[i].params.split(",");
                core.lactions.add("core.scene.moveItem('"+parameters[0]+"',"+parameters[1]+","+parameters[2]+",naction)");

            break;
            case "osdOff":
                core.lactions.add("core.osd.hide(naction)");
            break;
            case "osdOn":
                core.lactions.add("core.osd.show(naction)");
            break;
            case "animation":
                var parameters=actions[i].params.split(",");
                if(parameters.length==3){
                    core.lactions.add("getCharacter('"+parameters[0]+"').doAnimationLoop('"+parameters[1]+"',naction)"   );
                }else{
                    core.lactions.add("getCharacter('"+parameters[0]+"').doAnimation('"+parameters[1]+"',naction)"   );
                }
            break;
            case "objAnimation":
                var parameters=actions[i].params.split(",");
                if(parameters.length==3){
                    core.lactions.add("getItem('"+parameters[0]+"').doAnimationLoop('"+parameters[1]+"',naction)"   );
                }else{
                    core.lactions.add("getItem('"+parameters[0]+"').doAnimation('"+parameters[1]+"',naction)"   );
                }
            break;
            case "showNotebook":
                    core.osd.inventoryPanel.hide();
                    core.osd.notebookPanel.show();
            break;
            case "escribe": //muy concreto para Matt Murphy
                var parameters=actions[i].params; //cuidado, el texto no puede contener comas si hago split!!
                core.lactions.add("core.osd.notebookPanel.in(\""+parameters+"\",naction)");
//                core.lactions.add("getCharacter(\"Matt Murphy\").doAnimation(\"escribe\",naction)");
            break;
        }//switch


        }//if skip_this_action
    }//for
}
