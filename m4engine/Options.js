function Options() {
    options_self=this;
    PIXI.Sprite.call(this);



    this.mainScreen = new GContainer(200,290,__("MENÚ","m4"));
    this.mainScreen.positiona('center','center',config.base.width, config.base.height);

    this.btnNuevo = new GBoton(180,30,__("NUEVO JUEGO","m4"),function(){
      if(coreVars.onBootMenu){
        //en el menu inicial no hay partida que perder: empezar directamente
        core.osd.hideOptionsPanel();
        core.newGame();
      }else{
        options_self.removeChild(options_self.mainScreen);
        options_self.addChild(options_self.sureNewScreen);
      }
    });
    this.btnNuevo.positiona('center',50,this.mainScreen.w, this.mainScreen.h);
    this.mainScreen.addChild(this.btnNuevo);

    this.btnCargar = new GBoton(180,30,__("CARGAR","m4"),function(){
        options_self.removeChild(options_self.mainScreen);
        options_self.addChild(options_self.loadScreen);
    });
    this.btnCargar.positiona('center',90,this.mainScreen.w, this.mainScreen.h);
    this.mainScreen.addChild(this.btnCargar);

    this.btnGuardar = new GBoton(180,30,__("GUARDAR","m4"),function(){
        options_self.removeChild(options_self.mainScreen);
        options_self.addChild(options_self.saveScreen);
    });
    this.btnGuardar.positiona('center',130,this.mainScreen.w, this.mainScreen.h);
    this.mainScreen.addChild(this.btnGuardar);


    this.btnOpciones = new GBoton(180,30,__("OPCIONES","m4"),function(){
        options_self.removeChild(options_self.mainScreen);
        options_self.addChild(options_self.optionsScreen);
    });
    this.btnOpciones.positiona('center',170,this.mainScreen.w, this.mainScreen.h);
    this.mainScreen.addChild(this.btnOpciones);



    this.btnContinuar = new GBoton(180,30,__("CONTINUAR","m4"), function(){
      core.osd.hideOptionsPanel();
    });
    this.btnContinuar.positiona('center',210,this.mainScreen.w, this.mainScreen.h);
    this.mainScreen.addChild(this.btnContinuar);

    this.btnSalir = new GBoton(180,30,__("SALIR","m4"), function(){
      options_self.removeChild(options_self.mainScreen);
      options_self.addChild(options_self.sureExitScreen);
    });
    this.btnSalir.positiona('center',250,this.mainScreen.w, this.mainScreen.h);
    this.mainScreen.addChild(this.btnSalir);



    /***/
    /**** SEGURO SALIR ***/
    this.sureExitScreen = new GContainer(380,80,__("¿QUIERES SALIR?","m4"));
    this.sureExitScreen.positiona('center','center',config.base.width, config.base.height);

    this.btnCerrarExit = new GBoton(180,30,__("NO","m4"), function(){
        options_self.removeChild(options_self.sureExitScreen);
        options_self.addChild(options_self.mainScreen);
    });
    this.btnCerrarExit.positiona('right','bottom',this.sureExitScreen.w, this.sureExitScreen.h);
    this.sureExitScreen.addChild(this.btnCerrarExit);

    this.btnOkExit = new GBoton(180,30,__("SÍ","m4"), function(){
      //cierra
      window.close();
    });
    this.btnOkExit.positiona('left','bottom',this.sureExitScreen.w, this.sureExitScreen.h);
    this.sureExitScreen.addChild(this.btnOkExit);






    this.addChild(this.mainScreen);

    /**** CARGAR ***/
    this.loadScreen = new GContainer(300,240,__("CARGAR","m4"));
    this.loadScreen.positiona('center','center',config.base.width, config.base.height);
    this.btnLoadGame=[];
    for(var i=0; i<5; i++){
      var saveGame = localStorage.getItem('savegame'+i);
      if(saveGame!=null){
        saveGame=JSON.parse(saveGame);
        this.btnLoadGame[i]= new GBoton(290,30,i+".   "+saveGame.id, function(){
           //carga el slot i

           options_self.removeChild(options_self.loadScreen);
           options_self.addChild(options_self.mainScreen);
           core.osd.hideOptionsPanel();
           core.loadGame(this.data);
           core.osd.enabled=false;
           setTimeout(function(){core.osd.enabled=true},100);//trampa muy sucia
        },i);
      }else{
        this.btnLoadGame[i]= new GBoton(290,30,__("- vacío -","m4"), function(){});
      }

      this.btnLoadGame[i].positiona('center',((30+3)*i)+40,this.loadScreen.w, this.loadScreen.h);
      this.loadScreen.addChild(this.btnLoadGame[i]);
    }
    this.btnCerrar = new GBoton(180,30,__("CANCELAR","m4"), function(){
        options_self.removeChild(options_self.loadScreen);
        options_self.addChild(options_self.mainScreen);
    });
    this.btnCerrar.positiona('right','bottom',this.loadScreen.w, this.loadScreen.h);
    this.loadScreen.addChild(this.btnCerrar);


    /***/
    /**** GUARDAR ***/
    this.saveScreen = new GContainer(300,240,__("GUARDAR","m4"));
    this.saveScreen.positiona('center','center',config.base.width, config.base.height);
    this.btnSaveGame=[];
    for(var i=0; i<5; i++){
      var saveGame = localStorage.getItem('savegame'+i);
      if(saveGame!=null){
        saveGame=JSON.parse(saveGame);
        this.btnSaveGame[i]= new GBoton(290,30,i+".   "+saveGame.id, function(){
           //guarda en el slot i, con confirmación
           options_self.btnSaveGame2.data=this.data;
           options_self.removeChild(options_self.saveScreen);
           options_self.addChild(options_self.sureScreen);
        },i);
      }else{
        this.btnSaveGame[i]= new GBoton(290,30,__("- vacío -","m4"), function(){
           //guarda en el slot i, SIN confirmación
           core.saveGame(this.data);
           options_self.refreshSaves();
           options_self.removeChild(options_self.saveScreen);
           options_self.addChild(options_self.savedScreen);
           //core.osd.hideOptionsPanel();


        },i);
      }

      this.btnSaveGame[i].positiona('center',((30+3)*i)+40,this.saveScreen.w, this.saveScreen.h);
      this.saveScreen.addChild(this.btnSaveGame[i]);
    }
    this.btnCerrar2 = new GBoton(180,30,__("CANCELAR","m4"), function(){
        options_self.removeChild(options_self.saveScreen);
        options_self.addChild(options_self.mainScreen);
    });
    this.btnCerrar2.positiona('right','bottom',this.saveScreen.w, this.saveScreen.h);
    this.saveScreen.addChild(this.btnCerrar2);


    /***/
    /**** GUARDADO ***/
    this.savedScreen = new GContainer(300,80,__("JUEGO GUARDADO","m4"));
    this.savedScreen.positiona('center','center',config.base.width, config.base.height);

    this.btnCerrar3 = new GBoton(180,30,__("OK","m4"), function(){
        options_self.removeChild(options_self.savedScreen);
        options_self.addChild(options_self.mainScreen);
    });
    this.btnCerrar3.positiona('center','bottom',this.savedScreen.w, this.savedScreen.h);
    this.savedScreen.addChild(this.btnCerrar3);


    /***/
    /**** SEGURO ***/
    this.sureScreen = new GContainer(380,80,__("¿QUIERES SOBRESCRIBIR ESTE GUARDADO?","m4"));
    this.sureScreen.positiona('center','center',config.base.width, config.base.height);

    this.btnCerrar4 = new GBoton(180,30,__("CANCELAR","m4"), function(){
        options_self.removeChild(options_self.sureScreen);
        options_self.addChild(options_self.saveScreen);
    });
    this.btnCerrar4.positiona('right','bottom',this.sureScreen.w, this.sureScreen.h);
    this.sureScreen.addChild(this.btnCerrar4);

    this.btnSaveGame2 = new GBoton(180,30,__("OK","m4"), function(){
        core.saveGame(this.data);
        options_self.refreshSaves();
        options_self.removeChild(options_self.sureScreen);
        options_self.addChild(options_self.savedScreen);
        //core.osd.hideOptionsPanel();
    });
    this.btnSaveGame2.positiona('left','bottom',this.sureScreen.w, this.sureScreen.h);
    this.sureScreen.addChild(this.btnSaveGame2);


    /***/


    /**** SEGURO NEW ***/
    this.sureNewScreen = new GContainer(380,80,__("¿SEGURO QUE QUIERES EMPEZAR DE NUEVO?","m4"));
    this.sureNewScreen.positiona('center','center',config.base.width, config.base.height);

    this.btnCerrar5 = new GBoton(180,30,__("CANCELAR","m4"), function(){
        options_self.removeChild(options_self.sureNewScreen);
        options_self.addChild(options_self.mainScreen);
    });
    this.btnCerrar5.positiona('right','bottom',this.sureNewScreen.w, this.sureNewScreen.h);
    this.sureNewScreen.addChild(this.btnCerrar5);

    this.btnNewGame = new GBoton(180,30,__("OK","m4"), function(){
      options_self.removeChild(options_self.sureNewScreen);
      options_self.addChild(options_self.mainScreen);
      core.osd.hideOptionsPanel();
      core.newGame();
    });
    this.btnNewGame.positiona('left','bottom',this.sureNewScreen.w, this.sureNewScreen.h);
    this.sureNewScreen.addChild(this.btnNewGame);


    /***/













    












    /**** OPCIONES ***/
    this.optionsScreen = new GContainer(300,240,__("OPCIONES","m4"));
    this.optionsScreen.positiona('center','center',config.base.width, config.base.height);
    this.tmp_lang=config.base.lang;

    //nombres de los idiomas en el selector, cada uno escrito en su propio idioma
    var langNames={"es":"Español","val":"Valencià","en":"English","fr":"Français","de":"Deutsch","it":"Italiano","zh":"中文"};

    //el click solo cambia la seleccion; el idioma se aplica al pulsar VOLVER
    this.selIdioma= new GSelect(290,30,__("Idioma","m4"), function(o){
      options_self.tmp_lang=config.base.languages[o.selected];
    },config.base.languages.map(function(l){return langNames[l]||l;}),Math.max(0,config.base.languages.indexOf(config.base.lang)));



    /***/
    /**** SEGURO ***/
    this.sureLanScreen = new GContainer(380,80,__("HAY QUE REINICIAR","m4"));
    this.sureLanScreen.positiona('center','center',config.base.width, config.base.height);

    this.btnCerrarLang = new GBoton(180,30,__("AHORA NO","m4"), function(){
        config.base.lang=options_self.tmp_lang;
        core.storage.setItem('lang', config.base.lang);

        //se llega aqui desde VOLVER: el idioma queda guardado y se sigue al menu
        options_self.removeChild(options_self.sureLanScreen);
        options_self.addChild(options_self.mainScreen);
    });
    this.btnCerrarLang.positiona('right','bottom',this.sureLanScreen.w, this.sureLanScreen.h);
    this.sureLanScreen.addChild(this.btnCerrarLang);

    this.btnOkLang = new GBoton(180,30,__("VALE","m4"), function(){
      config.base.lang=options_self.tmp_lang;
      core.storage.setItem('lang', config.base.lang);
      window.location.reload();
    });
    this.btnOkLang.positiona('left','bottom',this.sureLanScreen.w, this.sureLanScreen.h);
    this.sureLanScreen.addChild(this.btnOkLang);


    /***/
























    this.selIdioma.positiona('center',8+40,this.optionsScreen.w, this.optionsScreen.h);
    this.optionsScreen.addChild(this.selIdioma);

    this.btnGraficos= new GSelect(290,30,__("Pantalla completa","m4"), function(o){

      if(o.selected==0){
        //full screen
        /*
        var element=document.body;
        var requestMethod = element.requestFullScreen || element.webkitRequestFullScreen || element.mozRequestFullScreen || element.msRequestFullScreen;
        requestMethod.call(element);
        */
        window.api.invoke('ponFullScreen', []).then(function(res) {}).catch(function(err) {});
        config.base.fullscreen=true;
        core.storage.setItem('fullscreen', config.base.fullscreen);
        
      }else{
        //window
        /*
        var element=document;
        var requestMethod = element.cancelFullScreen||element.webkitCancelFullScreen||element.mozCancelFullScreen||element.exitFullscreen||element.webkitExitFullscreen;
        requestMethod.call(element);
        */
        window.api.invoke('quitaFullScreen', []).then(function(res) {}).catch(function(err) {});
        config.base.fullscreen=false;
        core.storage.setItem('fullscreen', config.base.fullscreen);
        
      }
    },['On','Off'],(config.base.fullscreen==true||config.base.fullscreen=='true')?0:1);
    this.btnGraficos.positiona('center',8+40+40,this.optionsScreen.w, this.optionsScreen.h);
    this.optionsScreen.addChild(this.btnGraficos);

    this.btnGraficos= new GSelect(290,30,__("Resolución","m4"), function(){},['Full HD','4K','8K','16K'],0);
    this.btnGraficos.positiona('center',8+40+40+40,this.optionsScreen.w, this.optionsScreen.h);
    this.optionsScreen.addChild(this.btnGraficos);

    this.btnGraficos= new GSelect(290,30,__("RTX","m4"), function(){},['On','On mejorado'],0);
    this.btnGraficos.positiona('center',8+40+40+40+40,this.optionsScreen.w, this.optionsScreen.h);
    this.optionsScreen.addChild(this.btnGraficos);
    




    this.btnVolver = new GBoton(180,30,__("VOLVER","m4"), function(){
        options_self.removeChild(options_self.optionsScreen);
        if(options_self.tmp_lang!=config.base.lang){
            if(coreVars.onBootMenu){
                //en el menu inicial se puede recargar sin perder nada
                core.storage.setItem('lang', options_self.tmp_lang);
                window.location.reload();
                return;
            }
            //en partida hay que confirmar el reinicio
            options_self.addChild(options_self.sureLanScreen);
            return;
        }
        options_self.addChild(options_self.mainScreen);
    });
    this.btnVolver.positiona('right','bottom',this.optionsScreen.w, this.optionsScreen.h);
    this.optionsScreen.addChild(this.btnVolver);

    this.hide();
}
Options.prototype = Object.create( PIXI.extras.MovieClip.prototype );
Options.prototype.constructor = Options;

Options.prototype.update = function(){
  //this.btnGuardar.texto.style=this.btnGuardar.formatoOff;

}

Options.prototype.show = function(){
    core.osd.inventoryPanel.hide();
    core.osd.hideActionsPanel();
    core.osd.cursor.loff();

    //en el menu inicial no hay partida en marcha: GUARDAR y CONTINUAR velados
    this.btnGuardar.setEnabled(!coreVars.onBootMenu);
    this.btnContinuar.setEnabled(!coreVars.onBootMenu);

    //si el panel se cerro con una seleccion de idioma sin aplicar (sin pasar
    //por VOLVER), se descarta: el selector vuelve a mostrar el idioma actual
    this.tmp_lang=config.base.lang;
    this.selIdioma.setSelected(Math.max(0,config.base.languages.indexOf(config.base.lang)));

    this.interactive=true;
    this.visible=true;
    core.pause();
    this.play();
}
Options.prototype.hide = function(){
    this.interactive=false;
    this.visible=false;
    core.run();
    this.stop();
}






Options.prototype.refreshSaves = function(){
  for(var i=0; i<5; i++){
      this.loadScreen.removeChild(this.btnLoadGame[i]);
      this.saveScreen.removeChild(this.btnLoadGame[i]);

      var saveGame = localStorage.getItem('savegame'+i);
      if(saveGame!=null){
        saveGame=JSON.parse(saveGame);
        this.btnLoadGame[i]= new GBoton(290,30,i+".   "+saveGame.id, function(){
           //carga el slot i
           options_self.removeChild(options_self.loadScreen);
           options_self.addChild(options_self.mainScreen);
           core.osd.hideOptionsPanel();
           core.loadGame(this.data);
           core.osd.enabled=false;
           setTimeout(function(){core.osd.enabled=true},100);//trampa muy sucia
        },i);
        this.btnSaveGame[i]= new GBoton(290,30,i+".   "+saveGame.id, function(){
           //guarda en el slot i, con confirmación
           options_self.btnSaveGame2.data=this.data;
           options_self.removeChild(options_self.saveScreen);
           options_self.addChild(options_self.sureScreen);
        },i);
      }else{
        this.btnLoadGame[i]= new GBoton(290,30,__("- vacío -","m4"), function(){});
        this.btnSaveGame[i]= new GBoton(290,30,__("- vacío -","m4"), function(){
           //guarda en el slot i, SIN confirmación
           core.saveGame(this.data);
           options_self.refreshSaves();
           options_self.removeChild(options_self.saveScreen);
           options_self.addChild(options_self.savedScreen);
           //core.osd.hideOptionsPanel();


        },i);
      }



      this.btnLoadGame[i].positiona('center',((30+3)*i)+40,this.loadScreen.w, this.loadScreen.h);
      this.loadScreen.addChild(this.btnLoadGame[i]);

      this.btnSaveGame[i].positiona('center',((30+3)*i)+40,this.saveScreen.w, this.saveScreen.h);
      this.saveScreen.addChild(this.btnSaveGame[i]);
    }

}

/**************************************************************************/
/********************************* VENTANCATS *****************************/
/**************************************************************************/

function GContainer(width,height,titulo){
  this.w=width;
  this.h=height;
  PIXI.Sprite.call(this);
  this.fondo = new PIXI.Graphics();
  //this.fondo.cacheAsBitmap =true;
  this.fondo.beginFill(0x5C4945);
  this.fondo.lineStyle(2, 0x4E3D3A);
  //this.fondo. drawRoundedRect(0, 0, width, height,10);
  this.fondo.drawRect(0, 0, width, height);
  this.formatoTitulo={font : '22px '+config.base.fontFamily, fill : 0xb9b53d, stroke : 0x000000, strokeThickness : 1, align : 'center'};
  this.titulo = new PIXI.Text(titulo,this.formatoTitulo);
  this.titulo.x=(this.w/2)-(this.titulo.width/2);
  this.titulo.y=(this.titulo.height/2)+4;
  //this.titulo.resolution=5;

  this.addChild(this.fondo);
  this.addChild(this.titulo);
}
GContainer.prototype = Object.create( PIXI.Sprite.prototype );
GContainer.prototype.constructor = GContainer;

GContainer.prototype.positiona = function(x,y,ancho_padre=0,alto_padre=0){
  let pad=5;
  switch(x){
    case 'center':
    this.x=(ancho_padre/2)-(this.w/2);
    break;
    case 'right':
    this.x=ancho_padre-this.w-pad;
    break;
    case 'left':
    this.x=pad;
    break;
    default:
    this.x=x;
    break;
  }
  switch(y){
    case 'center':
    this.y=(alto_padre/2)-(this.h/2);
    break;
    case 'top':
    this.y=pad;
    break;
    case 'bottom':
    this.y=alto_padre-this.h-pad;
    break;
    default:
    this.y=y;
  }
}
GContainer.prototype.hide = function(){
  this.visible = false;
  this.interactive = false;
}
GContainer.prototype.show = function(){
  this.visible = true;
  this.interactive = true;
}

/**************************************************************************/

function GBoton(width,height,texto,clickfn=function(){},data=null){
  GContainer.call(this,width,height,"");
  this.interactive = true;

  this.clickfn=clickfn;
  this.on('mousedown', this.doClick);
  this.on('touchstart', this.doClick);
  this.data=data;

  this.formato={font : '22px '+config.base.fontFamily, fill : 0xb9b53d, stroke : 0x000000, strokeThickness : 1, align : 'center'};
  this.formatoOff={font : '22px '+config.base.fontFamily, fill : 0x68674a, stroke : 0x000000, strokeThickness : 1, align : 'center'};
  this.texto = new PIXI.Text(texto,this.formato);
  this.texto.x=(this.w/2)-(this.texto.width/2);
  this.texto.y=(this.h/2)-(this.texto.height/2)+4;
  //this.texto.cacheAsBitmap=true;

  this.addChild(this.texto);
  
}
GBoton.prototype = Object.create( GContainer.prototype );
GBoton.prototype.constructor = GBoton;

GBoton.prototype.doClick = function(){
  this.clickfn();
}

GBoton.prototype.setEnabled = function(on){
  this.interactive=on;
  this.texto.style=on?this.formato:this.formatoOff;
  this.alpha=on?1:0.45;
}

/**************************************************************************/

function GSelect(width,height,texto,clickfn=function(){},data=null,selected=0){
  GContainer.call(this,width,height,"");
  this.interactive = true;
  this.clickfn=clickfn;
  this.on('mousedown', this.doClick);
  this.on('touchstart', this.doClick);
  this.data=data;
  this.selected=selected;

  this.formato={font : '22px '+config.base.fontFamily, fill : 0xb9b53d, stroke : 0x000000, strokeThickness : 1, align : 'center'};
  this.formatoOff={font : '22px '+config.base.fontFamily, fill : 0x68674a, stroke : 0x000000, strokeThickness : 1, align : 'center'};
  this.formatoOption={font : '22px '+config.base.fontFamily, fill : 0xd2551a, stroke : 0x000000, strokeThickness : 1, align : 'center'};
  this.texto = new PIXI.Text(texto,this.formato);
  this.texto.x=10;
  this.texto.y=(this.h/2)-(this.texto.height/2)+4;
  this.addChild(this.texto);

  this.textoOption = new PIXI.Text(this.data[this.selected],this.formatoOption);
  this.textoOption.x=(this.w)-(this.textoOption.width)-10;
  this.textoOption.y=(this.h/2)-(this.texto.height/2)+4;
  this.addChild(this.textoOption);

}
GSelect.prototype = Object.create( GContainer.prototype );
GSelect.prototype.constructor = GBoton;

GSelect.prototype.setSelected = function(n){
  this.selected=n;
  this.textoOption.text=this.data[this.selected];
  this.textoOption.x=(this.w)-(this.textoOption.width)-10;
  this.textoOption.y=(this.h/2)-(this.texto.height/2)+4;
}

GSelect.prototype.doClick = function(){
  var n=this.selected+1;
  if(n>=this.data.length)n=0;
  this.setSelected(n);
  this.clickfn(this);
}
