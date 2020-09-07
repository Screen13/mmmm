gameVars={
    letrero:{texto:"",color:0xffffff,escena:"Start",puerta:0},
    entrada:0,
    drawDebug:false,
    items:[],
    invent:[],
    aqui_puedes:"anadir_variables"
}

var config = {
  "base":{
    "name": "Config de ejemplo",
    "folder": "gamedata",
    "assets": [
      "escena.json"
    ],
    "fadeSpeed": 500,
    "width": 640,
    "height": 360,
    "textHeight": 20,
    "textPadding": 10,
    "textSize": 16,
    "maxlength":70,
    "colorOsdLo": "#32865d",
    "colorOsdHi": "#4eda96",
    "colorOsd2Lo": "#32865d",
    "colorOsd2Hi": "#4eda96",
    "pixelPerfect": true,
    "speedH": 3,
    "speedV": 3,
    "verbs": [
      {
        "name": "coger",
        "defaultText": "No quiero coger eso.",
        "useAtText": "Eso no va con eso.",
        "useAtCharText" : "No quiero dar eso."
      },
      {
        "name": "mirar",
        "defaultText": "No veo nada."
      },
      {
        "name": "hablar",
        "defaultText": "No quiero decir nada."
      }
    ],

    "initScene":"Start"
  },
  "characters": [
    {
      "id":"protagonista",
      "name": "Protagonista",
      "color": "#bfc296",
      "images": [
        "fotograma0.png",
        "fotograma1.png"
      ],
      "animations": {
        "stop": [
          0,
        ],
        "walk": [
          0,
          1,
          0,
          1
        ],
        "talk": [
          0,
          1,
          0,
          1,
          0,
          1,
          0
        ],
        "pick": [
          0,1,0,1
        ],
        "se_pueden_anadir_animaciones": [
          1,0,1,0
        ]
      }
    }
  ],
  "inventory": [
    {
      "id":"inventario_llave",
      "name": "llave",
      "images": [
        "inventario_llave.png"
      ],
      "loop": false,
      "actions": {
        "mirar": [
          {
            "action": "say",
            "params": "Es una llave."
          }
        ],
        "useAt": {
          "xxxxxx":[
          {
            "action": "combine",
            "params": ["inventario_llave","inventario_caja","inventario_diamante"]
          }
          ],
          "personaje_secundario":[
          {
            "action": "dialog",
            "params": "dar_llave"
          }
          ]
        }
      }
    },//
    {
      "id":"inventario_caja",
      "name": "caja de madera",
      "images": [
        "inventario_caja.png"
      ],
      "loop": false,
      "actions": {
        "mirar": [
          {
            "action": "say",
            "params": "Está cerrada con llave."
          }
        ]
    },//
    //tantos objetos como quieras
  ],
  "scenes": [],
  "dialogs": [
  /***********************************************************************************************************/
  /***********************************************************************************************************/
  /***********************************************************************************************************/
  /***********************************************************************************************************/
  /***********************************************************************************************************/
    {
      "id": "dar_llave",
      "name": "dar_llave",
      "lines": [
        {
          "id": 0,
          "onlyonce": true,
          "say": [
            {
              "character": "protagonista",
              "text": "Toma esta llave."
            },
            {
              "character": "personaje_secundario",
              "text": "Gracias"
            }
          ],
          "goto": 1
        },
        {
          "id": 1,
          "options": [
            {
              "text": "¿Tienes algo para mi?",
              "goto": 2
            },
            {
              "text": "Adios.",
              "goto": 3
            }
          ]
        },
        {
          "id": 2,
          "say": [
            {
              "character": "protagonista",
              "text": "¿Tienes algo para mi?"
            },
            {
              "character": "personaje_secundario",
              "text": "No"
            }
          ],
          "goto": 1
        },
        {
          "id": 3,
          "say": [
            {
              "character": "protagonista",
              "text": "Adios."
            },
            {
              "character": "personaje_secundario",
              "text": "Hasta otra."
            }
          ],
          "goto": -1
        }

      ]
    },

    //aqui mas dialogos














]
}
