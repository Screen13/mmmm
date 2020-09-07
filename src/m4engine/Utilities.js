function getCharacter(selector){
    for (var i = 0; i < core.scene.characters.length; i++) {
        if(core.scene.characters[i].id==selector){
            return core.scene.characters[i];
        }//if
    }//for
    if(core.character.id==selector){
        return core.character;
    }
}
function getScene(selector){
    for (var i = 0; i < config.scenes.length; i++) {
        if(config.scenes[i].id==selector){
            return config.scenes[i];
        }//if
    }//for
}
function getItem(selector){

    for (var i = 0; i < core.scene.items.length; i++) {
        if(core.scene.items[i].id==selector){
            return core.scene.items[i];
        }//if
    }//for
}

function getExit(selector){
    for (var i = 0; i < core.scene.exits.length; i++) {
        if(core.scene.exits[i].id==selector){
            return core.scene.exits[i];
        }//if
    }//for
}
function getDoor(selector){
    for (var i = 0; i < core.scene.exits.length; i++) {
        if(core.scene.exits[i].id==selector){
            return core.scene.exits[i];
        }//if
    }//for
}function getItemInventory(selector){
    for (var i = 0; i < core.osd.inventoryPanel.items.length; i++) {
        if(core.osd.inventoryPanel.items[i].id==selector){
            return core.osd.inventoryPanel.items[i];
        }//if
    }//for
}
function getVerb(selector){
    for (var i = 0; i < config.base.verbs.length; i++) {
        if(config.base.verbs[i].name==selector){
            return config.base.verbs[i];
        }//if
    }//for
}
function getDialog(selector){
    //return new Dialog(config.dialogs[0].name,config.dialogs[0].lines);

    for (var i = 0; i < config.dialogs.length; i++) {
        if(config.dialogs[i].id==selector){
            return new Dialog(config.dialogs[i].name,config.dialogs[i].lines);
        }//if
    }//for

}

function setVar(name, value){

}


function multiline(text,length){
    var lastSpace=0;
    var n=0;
    for (var i = 0; i < text.length; i++) {
        if(text.charAt(i)==" ")lastSpace=i;
        if(n>length){
            text=text.substr(0, lastSpace) + "\n" + text.substr(lastSpace+1);
            n=0;
        }
        n++;
    };
    return text;
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
    a2=a.y;
    b2=b.y;
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

function testExp(elif){
        var skip_this_action = false;
        if(typeof(elif)!="undefined"){

            var tautology=elif.split(",");
            
            if(gameVars[tautology[0]]==JSON.parse(tautology[1])){
                skip_this_action = false;
            }else{
                skip_this_action = true;
            }
        }
        return skip_this_action;
}

function drawDebug(){
    core.osd.cursor.visible=false;
    core.scene.graphics.clear();
    core.scene.graphics.lineStyle(1, 0x00FF00);

    for(var i=0; i<core.scene.areas.length; i++){
        core.scene.graphics.drawPolygon(core.scene.areas[i]);
    }
    /*
    for(var i=0; i<core.scene.characters.length; i++){
        core.scene.characters[i].graphics.clear();
        core.scene.characters[i].graphics.lineStyle(1,0xff0000);
        core.scene.characters[i].graphics.drawRect(0,0,-10,-10);
    }
    */
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
    //if(core.keyboard['T'])console.log(core.scene.currentTime);
}

function cursorIn(objeto){
    objeto=getItem(objeto);
    if(typeof(objeto)!="undefined"){
    if( (core.osd.cursor.x>objeto.x) &&
        (core.osd.cursor.x<objeto.x+objeto.width) &&
        (core.osd.cursor.y>objeto.y) &&
        (core.osd.cursor.y<objeto.y+objeto.height)
    ){
        return true;
    }else{
        return false;
    }
    }

}



/********* TOUCH **********/
function mapTouchEvents(event,simulatedType) {

    //Ignore any mapping if more than 1 fingers touching
    if(event.changedTouches.length>1){return;}

    var touch = event.changedTouches[0];

    //--https://developer.mozilla.org/en/DOM/document.createEvent--
    eventToSimulate = document.createEvent('MouseEvent');

    //--https://developer.mozilla.org/en-US/docs/Web/API/event.initMouseEvent--
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
    core.keyboard['']=true; //pruebecita mia

}

document.addEventListener('touchstart',function(e){ mapTouchEvents(e,'mousedown'); },true);
document.addEventListener('touchmove',function(e){ mapTouchEvents(e,'mousemove'); },true);
document.addEventListener('touchend',function(e){ mapTouchEvents(e,'mouseup');  },true);
document.addEventListener('touchcancel',function(e){ mapTouchEvents(e,'mouseup'); },true);

//pruebecita mia
/*
window.onload=function(){
    document.getElementById("fullscreen").addEventListener("click" , function(e){
            if(document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
            } else if(document.documentElement.mozRequestFullScreen) {
                document.documentElement.mozRequestFullScreen();
            } else if(document.documentElement.webkitRequestFullscreen) {
                document.documentElement.webkitRequestFullscreen();
            } else if(document.documentElement.msRequestFullscreen) {
                document.documentElement.msRequestFullscreen();
            }
    });//click
    document.getElementById("fullscreen").addEventListener("touchend" , function(e){
            if(document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
            } else if(document.documentElement.mozRequestFullScreen) {
                document.documentElement.mozRequestFullScreen();
            } else if(document.documentElement.webkitRequestFullscreen) {
                document.documentElement.webkitRequestFullscreen();
            } else if(document.documentElement.msRequestFullscreen) {
                document.documentElement.msRequestFullscreen();
            }
    });//touchend

}//onload
*/
