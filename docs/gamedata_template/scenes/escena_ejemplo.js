config.scenes.push({
      "id" : "Escena_Ejemplo",
      "img": "fondo_ejemplo.png",   //capa principal
      "imgBack": [],                //capas de parallax traseras
      "imgFront": [],               //capas de parallax delanteras
      "imgSpeed":[1],               //velocidad de scroll por capa (la principal siempre 1)

      "enters":[
        { "inix":-50, "iniy":300, "endx":100, "endy":300 } //entra por la izquierda andando
      ],

      "exits":[
        /*
        {
          "id": "puerta",
          "name": __("puerta","m4"),
          "x": 500, "y": 150, "z": 0,
          "width": 80, "height": 150,
          "goto": "Otra_Escena",
          "gotoEnter": 0
        }
        */
      ],

      //poligonos por los que se puede andar (pares x,y)
      "areas": [
        [ 20,300,  620,300,  620,350,  20,350 ]
      ],

      "items": [
        {
          "id":"cartel",
          "name": __("cartel","m4"),
          "x": 300, "y": 100, "z": 0,
          "width": 60, "height": 80,
          "images": ["cartel.png"],
          "actions": {
            "mirar": [
              { "action": "say", "params": __("Un cartel de ejemplo.","m4") }
            ],
            "coger": [
              { "action": "say", "params": __("Está clavado a la pared.","m4") }
            ]
          }
        }
      ],

      "characters": [
        /*
        {
          "id":"vecino",
          "name": "Vecino",
          "color": "#8a8371",
          "x": 450, "y": 320,
          "images": [ ... ],
          "animations": { "stop":[0], "walk":[...], "talk":[[...],[...]] },
          "actions": {
            "hablar": [ { "action": "dialog", "params": "hablar_con_ejemplo" } ]
          }
        }
        */
      ],

      before: function(vieneDeGosub){
        //se ejecuta una vez al cargar la escena (musica, estado de items...)
      },

      everyupdate: function(){
        //se ejecuta cada frame
      }
});
