/*
* Configuracion minima de un juego M4Engine.
* El motor pone valores por defecto a todo lo demas (tamaño, colores,
* velocidades, lip-sync...): ver applyConfigDefaults() en m4engine/Core.js.
*/

//variables de estado del juego (se guardan en las partidas)
gameVars={
    ejemplo_saludado: 0,

    items:{},     //estado de los items por escena (lo rellena el motor)
    invent:[]     //ids de items del inventario que se tienen al empezar
}

var config = {
  "base":{
    "name": "Mi juego",
    "folder": "gamedata_template", //carpeta de este gamedata (para assets)

    //spritesheets a cargar desde <folder>/assets/ (.json estilo TexturePacker + .png)
    "assets": [
      "personaje.json",
      "escena_ejemplo.json"
    ],

    //sonidos y musica, desde <folder>/assets/
    "snd": [
      //{src:"snd/paso1.mp3", id:"snd_paso1"}
    ],

    //"footsteps": { "frames":[1,4], "sounds":["snd_paso1","snd_paso2"] },
    //"inventorySound": "snd_mete",
    //"menuAtStart": true,       //arrancar mostrando el menu (cargar/nuevo juego)
    //"languages": ["es","en"],  //idiomas validos; el primero es el de por defecto

    "verbs": [
      {
        "name": "coger",
        "isPickup": true, //en el inventario, este verbo pone el item en el cursor
        "icons": ["osd_ico_mano_1.png","osd_ico_mano_2.png"],
        "defaultText": __("No puedo coger eso.","m4"),
        "useAtText":  __("No parece buena idea.","m4"),
        "useAtCharText" :  __("No quiero dárselo.","m4")
      },
      {
        "name": "mirar",
        "icons": ["osd_ico_ojo_1.png","osd_ico_ojo_2.png"],
        "defaultText":  __("No le veo nada raro.","m4")
      },
      {
        "name": "hablar",
        "icons": ["osd_ico_boca_1.png","osd_ico_boca_2.png"],
        "defaultText":  __("No sabría que decir.","m4")
      }
    ],

    "initScene":"Escena_Ejemplo" //para probar otra: ?scene=Nombre en la URL
  },

  //el primer personaje es el protagonista
  "characters": [
    {
      "id":"Prota",
      "name": "Prota",
      "color": "#c03e57", //color de su texto
      "images": [
        "prota_quieto.png",
        "prota_anda_1.png", "prota_anda_2.png",
        "prota_boca_cerrada.png",
        "prota_boca_a.png", "prota_boca_ou.png", "prota_boca_ei.png",
        "prota_boca_cons1.png", "prota_boca_cons2.png", "prota_boca_mbp.png", "prota_boca_fv.png",
        "prota_coge_1.png", "prota_coge_2.png"
      ],
      "animations": {
        "stop": [0],
        "walk": [1, 2],
        //talk: [frames boca cerrada], [8 bocas para lip-sync] (ver GAMEDATA_FORMAT.md)
        "talk": [3, 4, 5, 6, 7, 8, 9, 10],
        "pick": [11, 12]
      }
    }
  ],

  //items que pueden estar en el inventario
  "inventory": [
    /*
    {
      "id":"llave",
      "name": __("llave","m4"),
      "images": ["inventario_llave.png"],
      "loop": false,
      "actions": {
        "mirar": [
          { "action": "say", "params": __("Una llave vieja.","m4") }
        ]
      }
    }
    */
  ],

  "scenes": [],
  "dialogs": []
}
