/*
* Codigo propio de este juego (el motor no se toca).
*
* Aqui puedes:
*  - registrar acciones declarativas nuevas en config.customActions
*  - añadir attachments/hooks al personaje principal (config.characters[0])
*  - definir funciones auxiliares que usen tus escenas
*/

config.customActions = {

    //ejemplo: { "action": "miAccion", "params": "hola,123" } en cualquier escena
    /*
    "miAccion": function(params, thing){
        var p=params.split(",");
        core.lactions.add(function(naction){
            core.character.say("Me han llamado con "+p[0], naction);
        });
    }
    */
};

/*
//ejemplo de extensiones del personaje principal:
(function(){
    var prota=config.characters[0];

    //sprite pegado al personaje (se maneja con core.character.gafas.visible=true)
    prota.attachments=[
        { "id":"gafas", "images":["obj_gafas.png"], "x":0, "y":-100, "visible":false }
    ];

    //sonido al lanzar una animacion concreta
    prota.animationSounds={ "salta": "snd_salto" };

    //logica visual por frame
    prota.onUpdate=function(ch){ };
})();
*/
