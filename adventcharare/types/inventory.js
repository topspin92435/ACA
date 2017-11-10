
module.exports = Inventory;

function Inventory(inventory) {
	this.items = inventory ? inventory : [];
};

Inventory.prototype.checkCraft = function (ingredients) {
	var mats = Object.keys(ingredients);
	for (var i in mats)
		if (this.getItemCount( mats[i]) < ingredients[mats[i]])
			return mats[i];

	return false;
}

Inventory.prototype.add = function (item) {
	for (var i in this.items) {
		if (!item.guid && this.items[i].name == item.name) {
			this.items[i].count += item.count;
			return;
		}
	}
	this.items.push(item);
};

Inventory.prototype.remove = function (item) {
	for (var i in this.items) {
		if (item.guid && this.items[i].guid == item.guid) {
			this.items.splice(i, 1);
			return this.items[i];
		} else if (this.items[i].name == item.name) {
			this.items[i].count -= item.count;
			return {"name":this.items[i], "count":1};
		}
	}
};

Inventory.prototype.transferItem = function (fromInventory, item) {
	for (var i in fromInventory) {
		if ((item.guid && fromInventory[i].guid == item.guid) || fromInventory[i].name == item.name) {

			if (fromInventory[i].procType)
				item.procType = fromInventory[i].procType;
				
			new Inventory(fromInventory).remove(item);
			this.add(item);
		}
	}
};


Inventory.prototype.transfer = function ( fromInventory) {
	for (var i = 0 ; i < fromInventory.length; i++) {
		
		var item = {
			name: fromInventory[i].name,
			count: fromInventory[i].count,
			guid: fromInventory[i].guid
		};
		
		if (fromInventory[i].procType)
			item.procType = fromInventory[i].procType;

		if (new Inventory(fromInventory).remove(item))
			i--;
		
		this.add(item);
	}
};


Inventory.prototype.getItemCount = function (name) {
	for (var i in this.items)
		if (this.items[i].name == name)
			return this.items[i].guid ? 1 : this.items[i].count;
		
	return 0;
};

Inventory.prototype.removeItemDurability = function(item, reduction) {
	for (var i in this.items) {
		if ((item.guid && this.items[i].guid == item.guid) || this.items[i].name == item.name) {
			this.items[i].procType.durability -= reduction;
			return this.items[i].procType.durability;
		} 
	}
}
