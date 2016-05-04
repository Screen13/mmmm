function getCharacter(selector){
    for (var i = 0; i < core.scene.characters.length; i++) {
        if(core.scene.characters[i].name==selector){
            return core.scene.characters[i];
        }//if
    }//for  
    if(core.mainCharacter.name==selector){
        return core.mainCharacter;
    }
}
function getScene(selector){
    for (var i = 0; i < core.scene.items.length; i++) {
        if(core.scene.items[i].name==selector){
            
        }//if
    }//for
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