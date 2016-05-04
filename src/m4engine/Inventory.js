function Inventory() {
    inventory_self=this;
    PIXI.Sprite.call(this);
    this.items = [];

    this.verbs=[];
    for (var i = 0; i < inventory.length; i++) {
        this.addItem(new Item(inventory[i].name,inventory[i].images,inventory[i].loop,inventory[i].width,inventory[i].height, inventory[i].actions));
    }
}
Inventory.prototype = Object.create( PIXI.Sprite.prototype );
Inventory.prototype.constructor = Inventory;


Inventory.prototype.addItem = function(item){
    this.items.push(item);
    this.addChild(item);
}


