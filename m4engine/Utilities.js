function __(texto,domain){
    if((typeof(translations)!='undefined')&&(typeof(translations[texto])!='undefined')){
        return translations[texto];
    }else{
        return texto;
    }
}

/********* Cola de acciones: helpers **********/
/*
* Casi todos los metodos del motor aceptan un parametro opcional "naction".
* - Si se llaman desde la cola (core.lactions), reciben el numero de accion y
*   deben marcarla como acabada al terminar.
* - Si se llaman sueltos (sin naction), se detiene la cola actual.
* Estos dos helpers concentran ese protocolo, antes repetido en cada metodo.
*/
function lactionBegin(naction){
    if(typeof naction === 'undefined'){
        core.lactions.stop();
        return -1;
    }
    return naction;
}
function lactionEnd(naction){
    if(typeof naction !== 'undefined' && naction!=-1){
        core.lactions.acabada=naction;
    }
}

function getCharacter(selector){
    for (var i = 0; i < core.scene.characters.length; i++) {
        if(core.scene.characters[i].id==selector){
            return core.scene.characters[i];
        }
    }
    if(core.character.id==selector){
        return core.character;
    }
}
function getScene(selector){
    for (var i = 0; i < config.scenes.length; i++) {
        if(config.scenes[i].id==selector){
            return config.scenes[i];
        }
    }
}
function getItem(selector){
    for (var i = 0; i < core.scene.items.length; i++) {
        if(core.scene.items[i].id==selector){
            return core.scene.items[i];
        }
    }
}

function getExit(selector){
    for (var i = 0; i < core.scene.exits.length; i++) {
        if(core.scene.exits[i].id==selector){
            return core.scene.exits[i];
        }
    }
}
var getDoor = getExit; //alias historico

function getItemInventory(selector){
    for (var i = 0; i < core.osd.inventoryPanel.items.length; i++) {
        if(core.osd.inventoryPanel.items[i].id==selector){
            return core.osd.inventoryPanel.items[i];
        }
    }
}
function getVerb(selector){
    for (var i = 0; i < config.base.verbs.length; i++) {
        if(config.base.verbs[i].name==selector){
            return config.base.verbs[i];
        }
    }
}
function getDialog(selector){
    for (var i = 0; i < config.dialogs.length; i++) {
        if(config.dialogs[i].id==selector){
            return new Dialog(config.dialogs[i].name,config.dialogs[i].lines);
        }
    }
}

/*
* Textos por defecto al usar un item del inventario sobre algo que no tiene
* respuesta definida. Se buscan en el verbo que los defina (historicamente
* "coger") y si no, en config.base.useAtText / useAtCharText.
*/
function getUseAtTexts(){
    for (var i = 0; i < config.base.verbs.length; i++) {
        if(config.base.verbs[i].useAtText){
            return {
                item: config.base.verbs[i].useAtText,
                character: config.base.verbs[i].useAtCharText || config.base.verbs[i].useAtText
            };
        }
    }
    return {item: config.base.useAtText, character: config.base.useAtCharText};
}

function setVar(name, value, naction){
    naction=lactionBegin(naction);
    gameVars[name]=value;
    lactionEnd(naction);
}


/********* Texto: anchos y cortes de linea (latino + CJK) **********/
//Un caracter CJK ocupa el doble de ancho que uno latino, y el chino no usa
//espacios: se puede cortar entre dos caracteres cualesquiera, salvo delante
//de la puntuacion de cierre.
function isCJK(ch){
    return /[⺀-〿㐀-䶿一-鿿豈-﫿＀-￯]/.test(ch);
}
//cjkw: unidades de ancho de un caracter CJK respecto a uno latino (2 por
//defecto; la libreta usa 3 porque su pareja de fuentes tiene el latin estrecho)
function charWidth(ch,cjkw){
    return isCJK(ch)?(cjkw||2):1;
}
//kinsoku: puntuacion que no puede abrir linea / caracteres que no pueden cerrarla
var CJK_NO_BREAK_BEFORE="，。、！？；：）】》」』’”…·～%℃";
var CJK_NO_BREAK_AFTER="（【《「『‘“";

//Corta "text" en lineas de como mucho "length" unidades de ancho (CJK=2).
//Puntos de corte: los espacios (texto occidental) y cualquier frontera donde
//intervenga un caracter CJK (el chino no usa espacios), respetando kinsoku.
function multiline(text,length,cjkw){
    var out="";
    var line="";
    var lineW=0;
    var lastBreak=-1; //posicion de line donde se puede cortar (si hay espacio ahi, se consume)
    for (var i = 0; i < text.length; i++) {
        var ch=text.charAt(i);
        if(ch=="\n"){
            out+=line+"\n"; line=""; lineW=0; lastBreak=-1;
            continue;
        }
        var w=charWidth(ch,cjkw);
        if(lineW+w>length && line.length>0){
            if(ch==" "){ //el corte cae justo en un espacio: se consume
                out+=line+"\n"; line=""; lineW=0; lastBreak=-1;
                continue;
            }
            if(lastBreak>0){
                out+=line.substring(0,lastBreak)+"\n";
                line=line.substring(lastBreak);
                if(line.charAt(0)==" ")line=line.substring(1);
            }else{ //sin punto de corte (palabra larguisima): corte duro
                out+=line+"\n";
                line="";
            }
            lastBreak=-1;
            lineW=0;
            for(var j=0;j<line.length;j++)lineW+=charWidth(line.charAt(j),cjkw);
        }
        if(line.length>0){
            var prev=line.charAt(line.length-1);
            if(ch==" "){
                lastBreak=line.length;
            }else if((isCJK(ch)||isCJK(prev)) && prev!=" " &&
                     CJK_NO_BREAK_BEFORE.indexOf(ch)<0 && CJK_NO_BREAK_AFTER.indexOf(prev)<0){
                lastBreak=line.length;
            }
        }
        line+=ch;
        lineW+=w;
    }
    return out+line;
}

//Recorta "text" a "length" unidades de ancho (CJK=2). Sustituye al antiguo
//substring de Text.js, que con chino dejaba lineas el doble de largas.
function truncateWidth(text,length){
    var w=0;
    for (var i = 0; i < text.length; i++) {
        w+=charWidth(text.charAt(i));
        if(w>length)return text.substring(0,i);
    }
    return text;
}

//Variante de word-wrap que reparte por palabras completas (usada en textos de items).
//Ojo: añade un espacio inicial a cada linea, no es intercambiable con multiline().
function enes(s,l){
  return ' '+multiline(s,l).replace(/\n/g,"\n ");
}



function fadeIn(now,callback){
    now=(typeof(now)=='undefined')?false:now;
    callback=(typeof(callback)=='undefined')?null:callback;
    if(now==true){
        core.black.alpha=0;
        coreVars.targetFade=0;
        coreVars.actualFade=0;
    }else{
        coreVars.targetFade=0;
        if(typeof(callback)=='function'){
            coreVars.afterFade=callback;
        }
    }
}
function fadeOut(now,callback){
    now=(typeof(now)=='undefined')?false:now;
    callback=(typeof(callback)=='undefined')?null:callback;
    if(now==true){
        core.black.alpha=1;
        coreVars.targetFade=1;
        coreVars.actualFade=1;
    }else{
        coreVars.targetFade=1;
        if(typeof(callback)=='function'){
            coreVars.afterFade=callback;
        }
    }
}

function depthCompare(a,b){
    var a2=a.y;
    var b2=b.y;
    if(a.anchor.y==0)a2=a.y+a.height;
    if(b.anchor.y==0)b2=b.y+b.height;
    if (b2 < a2){
        return 1;
    }else if(b2 > a2){
        return -1;
    }else{
        return 0;
    }
}


function clone(obj) {
    var copy;

    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
        copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
        copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = clone(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
        }
        return copy;
    }
}

/*
* Evalua una condicion "variable,valor" contra gameVars.
* Devuelve TRUE si NO se cumple (es decir: true = saltarse la accion).
*/
function shouldSkip(elif){
    if(typeof(elif)=="undefined")return false;
    var tautology=elif.split(",");
    return !(gameVars[tautology[0]]==JSON.parse(tautology[1]));
}
var testExp = shouldSkip; //alias historico (logica invertida: true = saltar)

function drawDebug(){
    core.osd.cursor.visible=false;
    core.scene.graphics.clear();
    core.scene.graphics.lineStyle(1, 0x00FF00);

    for(var i=0; i<core.scene.areas.length; i++){
        core.scene.graphics.drawPolygon(core.scene.areas[i]);
    }
    for(var i=0; i<core.scene.exits.length; i++){
        core.scene.graphics.lineStyle(1,0xff00ff);

        core.scene.graphics.drawRect(
            core.scene.exits[i].x+core.scene.layers[core.scene.exits[i].layer].x,
            core.scene.exits[i].y,
            core.scene.exits[i].width,
            core.scene.exits[i].height);
    }
    for(var i=0; i<core.scene.items.length; i++){
        if(core.scene.items[i].interactive==true){
            core.scene.graphics.lineStyle(1,0xff0000);

            core.scene.graphics.drawRect(
                core.scene.items[i].x+core.scene.layers[core.scene.layer+core.scene.items[i].layer].x,
                core.scene.items[i].y,
                core.scene.items[i].width,
                core.scene.items[i].height);
        }
    }
    core.scene.graphics.lineStyle(1,0x0000ff);
    core.scene.graphics.moveTo(0, Math.floor(core.osd.cursor.y));
    core.scene.graphics.lineTo(config.base.width,Math.floor(core.osd.cursor.y));
    core.scene.graphics.moveTo(Math.floor(core.osd.cursor.x),0);
    core.scene.graphics.lineTo(Math.floor(core.osd.cursor.x),config.base.height);



    core.scene.debugtxt.text="Cam:"+Math.floor(core.camera.x)+","+Math.floor(core.camera.y)+"\n"+
                             "X: "+Math.floor(core.osd.cursor.x- core.scene.layers[core.scene.layer].x )+"\n"+
                             "Y: "+Math.floor(core.osd.cursor.y)+"\n";
    if(coreVars.lastx>-1){
    core.scene.debugtxt.text="X: "+coreVars.lastx+"\n"+
                             "Y: "+coreVars.lasty+"\n"+
                            "An: "+Math.floor(core.osd.cursor.x- core.scene.layers[core.scene.layer].x-coreVars.lastx )+"\n"+
                             "Al: "+Math.floor(core.osd.cursor.y-coreVars.lasty)+"\n";
    }
    if(core.keyboard['A']==true){
        core.keyboard['A']=false;
        if(coreVars.lastx==-1){
            coreVars.lastx=Math.floor(core.osd.cursor.x- core.scene.layers[core.scene.layer].x );
            coreVars.lasty=Math.floor(core.osd.cursor.y);

        }else{
            coreVars.lastx=-1;
        }
    }
    if(core.keyboard['S']==true){
        core.keyboard['S']=false;

            console.log("X: "+coreVars.lastx+"\n"+
                        "Y: "+coreVars.lasty+"\n"+
                        "An: "+Math.floor(core.osd.cursor.x- core.scene.layers[core.scene.layer].x-coreVars.lastx )+"\n"+
                        "Al: "+Math.floor(core.osd.cursor.y-coreVars.lasty)+"\n");

    }
}

function cursorIn(objeto){
    objeto=getItem(objeto);
    if(typeof(objeto)!="undefined"){
        return (core.osd.cursor.x>objeto.x) &&
               (core.osd.cursor.x<objeto.x+objeto.width) &&
               (core.osd.cursor.y>objeto.y) &&
               (core.osd.cursor.y<objeto.y+objeto.height);
    }
}



/********* TOUCH **********/
function mapTouchEvents(event,simulatedType) {

    //Ignore any mapping if more than 1 fingers touching
    if(event.changedTouches.length>1){return;}

    var touch = event.changedTouches[0];

    var eventToSimulate = document.createEvent('MouseEvent');

    eventToSimulate.initMouseEvent(
        simulatedType,      //type
        true,               //bubbles
        true,               //cancelable
        window,             //view
        1,                  //detail
        touch.screenX,      //screenX
        touch.screenY,      //screenY
        touch.clientX,      //clientX
        touch.clientY,      //clientY
        false,              //ctrlKey
        false,              //altKey
        false,              //shiftKey
        false,              //metaKey
        0,                  //button
        null                //relatedTarget
    );

    touch.target.dispatchEvent(eventToSimulate);
    //This ignores the default scroll behavior
    event.preventDefault();
    core.keyboard['\x1B']=true; //simula la tecla ESC para que el touch tambien pueda saltar cutscenes
}

document.addEventListener('touchstart',function(e){ mapTouchEvents(e,'mousedown'); },true);
document.addEventListener('touchmove',function(e){ mapTouchEvents(e,'mousemove'); },true);
document.addEventListener('touchend',function(e){ mapTouchEvents(e,'mouseup');  },true);
document.addEventListener('touchcancel',function(e){ mapTouchEvents(e,'mouseup'); },true);
