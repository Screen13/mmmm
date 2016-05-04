# mmmm
Motor de la Mazmorra para Matt Murphy

## Config.js
In this file media files needed, behavior and events of the entire system are defined.

### Section "config"
        name:"" // Game name
        assets:[] // List of json file defining images and other media (generated with screen13packer)
        fadeSpeed:500 // Speed of screen fades (in ms)
        width:640 // Screen width
        height:360 //Screen height
        textHeight:20 //Text size
        textPadding:10 //Text space from border of the screen
        textSize:16 //Text size
        colorOsdLo:"#f6a800" //Color for general text
        colorOsdHi:"#F5CE7A" //Color for general text when hilighted
        colorOsd2Lo:"#c03e57" //Secondary color for general text
        colorOsd2Hi:"#BF7785" //Secondary color for general text when hilighted
        pixelPerfect:true //Adjust images to pixels
        folder:"juego" //Folder where assets are stored
        speedH:2 //Horizontal speed when moving characters
        speedV:1 //Vertical speed when moving characters
        verbs:["coger","hablar","mirar"] //Verbs allowed
        verbsDefaultText:["No quiero coger eso.","No quiero decir nada.","No veo nada."] //Default text when no text is defined (one per verb)


### Section "characters"
    main:{  //Internal name of the character. The first one must be allways "main"
        name:"John" //Character's name
        color:"#c03e57" //Text color for this character
        images:[] //List of images (previusly loaded in config section)
        animations:{
             stop:[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,1],
             walk:[3,4,5,6,7,8],
             talk:[21,22,23,24,25,26,27,28],
             get:[9,10,11,12,13,14,15,16,17,18,19,20],
             dance:[5,3,1,3,12,5]
        }
    }


### Section "scenes"

    calle:{
        name:"Calle",
        imgBack:[],
        img:"",
        imgFront:[],
        areas:[
            [30,148,1900,148,1900,348,30,348]
        ],
        items:[
                {
                    name:"farola",
                    x:612,
                    y:36,
                    z:1,
                    width:37,
                    height:327,
                    actions:[
                        function(){
                            core.get("John").say("Esto es coger").wait(3).say("Ale");
                        },function(){
                            core.get("John");
                        },function(){
                            core.get("John").say("Esto es mirar");
                        }
                    ]
                },
                {
                    name:"chicle",
                    images:[""],
                    loop:false,
                    x:623,
                    y:200,
                    z:1
                }
        ],
        characters:[]
