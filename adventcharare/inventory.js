module.exports = function(root) {
	var module = {};
	
	module.addToInventory = function (inventory, item) {
		for (var i in inventory) {
			if (!item.guid && inventory[i].name == item.name) {
				inventory[i].count += item.count;
				return;
			}
		}
		inventory.push(item);
	};

	module.removeFromInventory = function (inventory, item) {
		for (var i in inventory) {
			if (item.guid && inventory[i].guid == item.guid) {
				inventory.splice(i, 1);
				return true;
			} else if (inventory[i].name == item.name) {
				inventory[i].count -= item.count;
				return;
			}
		}
	};

	module.transferItem = function (toInventory, fromInventory, item) {
		for (var i in fromInventory) {
			if ((item.guid && fromInventory[i].guid == item.guid) || fromInventory[i].name == item.name) {

				if (fromInventory[i].procType)
					item.procType = fromInventory[i].procType;
					
				module.removeFromInventory(fromInventory, item);
				module.addToInventory(toInventory, item);
			}
		}
	};


	module.transferInventory = function (toInventory, fromInventory) {
		for (var i = 0 ; i < fromInventory.length; i++) {
			
			var item = {
				name: fromInventory[i].name,
				count: fromInventory[i].count,
				guid: fromInventory[i].guid
			};
			
			if (fromInventory[i].procType)
				item.procType = fromInventory[i].procType;

			if (module.removeFromInventory(fromInventory, item))
				i--;
			
			module.addToInventory(toInventory, item);
		}
	};


	module.getInventoryItemCount = function (inventory, name) {
		for (var i in inventory)
			if (inventory[i].name == name)
				return inventory[i].guid ? 1 : inventory[i].count;
			
		return 0;
	};

	return module;
}