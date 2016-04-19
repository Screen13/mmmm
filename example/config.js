//M&Ms - Script del Motor de la Mazmorra para Matt Murphy
var config={
        name:"",
        assets:[],
        fadeSpeed:500,
        width:640,
        height:360,
        textHeight:20,
        textPadding:10,
        textSize:16,
        colorOsdLo:"#f6a800",
        colorOsdHi:"#F5CE7A",
        colorOsd2Lo:"#c03e57",
        colorOsd2Hi:"#BF7785",
        pixelPerfect:true,
        folder:"juego",
        speedH:2,
        speedV:1,
        verbs:["coger","hablar","mirar"],
        verbsDefaultText:["No quiero coger eso.","No quiero decir nada.","No veo nada."]
};//config

var characters={
    main:{
        name:"John",
        color:"#c03e57",
        images:[],
        animations:{
             stop:[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,1],
             walk:[3,4,5,6,7,8],
             talk:[21,22,23,24,25,26,27,28],
             get:[9,10,11,12,13,14,15,16,17,18,19,20],
             dance:[5,3,1,3,12,5]
        }
    },
    bracamontes:{

    }

}



var scenes={
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
    }//calle
}