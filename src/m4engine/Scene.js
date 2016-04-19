function Scene(name, image, imagesBack, imagesFront) { //matt, cursor, osd????????????????????????????????????????????????

    scene_self = this;

	PIXI.Container.call(this);

    this.layer=0;
    this.layers=[];

    if(imagesBack){
        for(var i=0; i<imagesBack.length;i++){
            this.layers.push(new PIXI.Sprite.fromFrame(imagesBack[i]));
            this.addChild(this.layers[i]);
        }
        this.layer=i;
    }

    if(image){
        this.layers.push(new PIXI.Sprite.fromFrame(image));
    }else{
        this.layers.push(new PIXI.Sprite());
    }
    this.layers[this.layer].interactive=true;
    this.layers[this.layer].click = this.doClick;
    this.addChild(this.layers[this.layer]);

    if(imagesFront){
        for(var i=0; i<imagesFront.length;i++){
            this.layers.push(new PIXI.Sprite.fromFrame(imagesFront[i]));
            this.addChild(this.layers[this.layers.length-1]);
        }
    }
    
    this.dialogs=[];
    this.items=[];
    this.characters=[];
    this.areas=[];



    /*
    Scene.addArea([
        new PIXI.Point(49.77491961414791,42.82958199356913),
        new PIXI.Point(211.83279742765274,43.98713826366559),
        new PIXI.Point(251.18971061093248,200.2572347266881),
        new PIXI.Point(364.63022508038586,201.41479099678457),
        new PIXI.Point(408.61736334405145,47.459807073954984),
        new PIXI.Point(571.8327974276527,55.562700964630224),
        new PIXI.Point(553.3118971061093,313.6977491961415),
        new PIXI.Point(109.96784565916398,318.3279742765273),
        new PIXI.Point(50.93247588424437,210.67524115755626)
    ]);
    Scene.addArea([
        new PIXI.Point(439.87138263665594,125.016077170418),
        new PIXI.Point(439.87138263665594,167.84565916398714),
        new PIXI.Point(485.016077170418,173.63344051446944),
        new PIXI.Point(486.17363344051444,126.17363344051446)
    ]);*/
    /*
    this.graphics = new PIXI.Graphics();
    this.layers[4].addChild(this.graphics);
    this.point1=null;
    this.point2=null;
    */
}
Scene.prototype = Object.create( PIXI.Container.prototype );
Scene.prototype.constructor = Scene;


Scene.prototype.doClick = function(mouseData){
        //Ojo, no usar this dentro de un event handler
        if(core.osd.actionsPanel.visible==true){
            core.osd.hideActionsPanel();
        }else{
            var point1 = new PIXI.Point(core.mainCharacter.x, core.mainCharacter.y);
            var point2 = new PIXI.Point(mouseData.data.getLocalPosition(scene_self.layers[scene_self.layer]).x,mouseData.data.getLocalPosition(scene_self.layers[scene_self.layer]).y);
            var path = shortestPath(point1.x,point1.y,point2.x,point2.y,scene_self.areas);

            if(path.encontrado==false){
              //busca el punto mas cercano DENTRO del area
              point2=lineaMasCercana(point2.x,point2.y,scene_self.areas);
              //scene_self.graphics.lineStyle(1, 0xFF0000);
              //scene_self.graphics.drawCircle(point2.x,point2.y,10);
            }
            core.mainCharacter.walkTo(point2);
        }
}



Scene.prototype.addArea = function(area) {
    this.areas.push(area);
}

Scene.prototype.addCharacter = function(personaje,mcx,mcy) {
    if(mcx)personaje.x=mcx;
    if(mcy)personaje.y=mcy;
    this.layers[this.layer].addChild(personaje)
}

Scene.prototype.addItem = function(item,mcx,mcy,layer){
    //si se especifica "layer" (entre 3 y -3), el item se asigna a una de las capas de parallax.
    var layeri=0;
    if(mcx)item.x=mcx;
    if(mcy)item.y=mcy;
    if(layer)layeri=layer;
    this.items.push(item);
    this.layers[this.layer+layeri].addChild(item);
}

Scene.prototype.actualiza = function(camara){
    
    this.layers[this.layer].children.sort(core.depthCompare);

    if((camara.x>=0)&&(camara.y>=0)&&(camara.x<=this.layers[this.layer].width-config.width)&&(camara.y<=this.layers[this.layer].height-config.height)){
        for(var i=0; i<this.layer;i++){
            this.layers[i].x=((i/3)*camara.x*-1);
            this.layers[i].y=((i/3)*camara.y*-1);
        }
            this.layers[this.layer].x=camara.x*-1;
            this.layers[this.layer].y=camara.y*-1;

        for(var i=this.layer+1; i<this.layers.length;i++){
            this.layers[i].x=((i/3)*camara.x*-1);
            this.layers[i].y=((i/3)*camara.y*-1);
        }
    }

    //dibuja el area pisable
    /*
    this.graphics.lineStyle(1, 0x00FF00);
    for(var i=0; i<scene_self.areas.length; i++){
        this.graphics.drawPolygon(scene_self.areas[i]);
    }
    */

}











/*
Scene.prototype.clic = function(mouseData){
        //Ojo, no usar this dentro de un event handler
        //var point1 = new PIXI.Point(_mainchar.x, _mainchar.y);
        console.log("new PIXI.Point("+mouseData.data.getLocalPosition(scene_self.layers[scene_self.layer]).x+","+mouseData.data.getLocalPosition(scene_self.layers[scene_self.layer]).y+"),");

          if((scene_self.point1!=null)&&(scene_self.point2==null)){
            scene_self.point2 = mouseData.data.getLocalPosition(scene_self.layers[scene_self.layer]);
          }

          if((scene_self.point1==null)&&(scene_self.point2==null)){
            scene_self.point1 = mouseData.data.getLocalPosition(scene_self.layers[scene_self.layer]);
          }
          
          if((scene_self.point1!=null)&&(scene_self.point2!=null)){

          
                    var path = shortestPath(scene_self.point1.x,scene_self.point1.y,scene_self.point2.x,scene_self.point2.y,scene_self.areas);
                    
                    
                    scene_self.graphics.clear();
                    scene_self.graphics.lineStyle(1, 0x00FF00);
                    for(var i=0; i<scene_self.areas.length; i++){
                        scene_self.graphics.drawPolygon(scene_self.areas[i]);
                    }

                    
                    scene_self.graphics.lineStyle(1,0xFF0000);
                    scene_self.graphics.moveTo(scene_self.point1.x, scene_self.point1.y);
                    scene_self.graphics.lineStyle(1,0xFF00FF);
                    for(var i=0; i<path.solutionX.length; i++){
                      scene_self.graphics.lineStyle(1,0xFF00FF+i*5);
                        scene_self.graphics.lineTo(path.solutionX[i],path.solutionY[i]);
                    }
                    scene_self.graphics.lineStyle(1,0x0000FF);
                    scene_self.graphics.lineTo(scene_self.point2.x, scene_self.point2.y);
                    
                    scene_self.point1 = null;
                    scene_self.point2 = null;
          }

          //_mainchar.anda(mouseData.data.getLocalPosition(scene_self.layers[scene_self.layer]));
}
*/
