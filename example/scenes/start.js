config.scenes.push({
      "id" : "Start",
      "imgBack": [],
      "img": "fondo.png",
      "imgFront": [],
      "imgSpeed":[1],
      "enters":[
        {//puerta [1]
          "inix":600,
          "iniy":347,
          "endx":600,
          "endy":347
        }
      ],
      "exits":[
        {
          "id": "calle",
          "name": "calle",
          "x": 600,
          "y": 0,
          "z": 0,
          "width": 40,
          "height": 348,
          "cursorImage":"cursor_derecha.png",
          "goto":"Calle",
          "gotoEnter":0
        }
      ],
      "areas": [
        [
          590,
          347,
          601,
          347,
          601,
          347,
          590,
          347
        ]
      ],
      "items": [
      {
          "id": "poster",
          "name": "póster",
          "x": 142,
          "y": 75,
          "z": 0,
          "width":"75",
          "height":"100",
          "actions": {
            "mirar": [
              {
                "action": "say",
                "params": "Es un póster de un avión."
              }
            ]
          }
        },
        //mas items





      ],
      "characters": [







      ],
      before:function(){

      },
      everyupdate:function(){
        if(coreVars.sceneTime==1){

        }
      }//every update
});
