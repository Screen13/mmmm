
function Text(text, style, styleHI, maxLenght) {
    maxLenght=(typeof(maxLenght)=='undefined')?0:maxLenght;
    this.text=text;
    this.style=style;
    this.styleLO=style;
    this.styleHI=style;
    this.total_text=text;
    this.maxLenght=maxLenght;
    this.stringindex=0;
    this.style.padding=10;
    this.styleLO.padding=10;
    if(this.maxLenght>0){
        this.text=truncateWidth(text.substring(this.stringindex),this.maxLenght);
    }
    PIXI.Text.call(this,this.text,this.style);
    this.resolution=5;
    //this.height=200; /* deberia venir en el style */
    if(styleHI){
    	this.styleHI=styleHI;
        this.styleHI.padding=10;
    	this.interactive=true;

    	this.mouseover=this.lon;
    	this.mouseout=this.loff;
    }


}
Text.prototype = Object.create( PIXI.Text.prototype );
Text.prototype.constructor = Text;
//OJO, con este truco el texto no se corta, pero el tamaño de la fuente está hardcoded
Text.prototype.determineFontProperties = function(fontStyle){  var properties = PIXI.Text.fontPropertiesCache[fontStyle];  if(properties){     return properties;  }   properties =  {     ascent: 12,     descent: 10,        fontSize: 22    };  PIXI.Text.fontPropertiesCache[fontStyle] = properties;  return properties;};


Text.prototype.lon = function(mouseData){
   mouseData.target.style=mouseData.target.styleHI;
}
Text.prototype.loff = function(mouseData){
   mouseData.target.style=mouseData.target.styleLO;
}
