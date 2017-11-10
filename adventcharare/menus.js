module.exports = function(){
	var module = {}

	module.checkUser = function(user) {
		var msg = 'You check yourself and find:\r\n';
		
		msg += '*health* - ' +user.health+'\r\n';
		msg += '*walk distance* - ' +user.walked+'\r\n';
		msg += '*'+sys.libRng(library.money)+'* - ' +user.money+'\r\n';
		msg += this.addInvToList(user.inventory);
		return msg;
	};
	
	module.checkInventory = function(user) {
		var msg = 'You check your inventory and find:\r\n';
		
		msg += this.addInvToList(user.inventory.items);
		return msg;
	};

	module.addInvToList = function(arr) {
		var msg = '';
		for (var i in arr)
			if(arr[i].count > 0 )
				msg+= ('*'+arr[i].name + '* - ' + (arr[i].procType ? arr[i].procType.durability : arr[i].count) + ' \r\n');

		return msg;
	};
	
	module.checkCrafts = function(item) {
		var msg = 'From deep within your mind you bring forth the plans for ' + (item ? item : '') + ':\r\n';
		
		if (item) {
			if (Crafts[item])
				var toShare = item;
			else
				msg = 'Sadly you don\'t know if you actually know how to put together a ' + item;
		} else
			var toShare = Object.keys(Crafts);
		
		msg += this.craftingMenu('Ingredients', 'ingredients', toShare);
		msg += this.craftingMenu('Tools', 'tool', toShare);
		msg += this.craftingMenu('Weapons', 'weapon', toShare);
		msg += this.craftingMenu('Crafting', 'crafting', toShare);
		msg += this.craftingMenu('Cooking', 'food', toShare);
		
		return msg;
	};
	
	module.craftingMenu = function(Title, type, toShare) {
		var msg = '*_' + Title + ':_*\r\n';
		for (var i in toShare)
			if (Crafts[toShare[i]].menu == type)
				msg += this.getCraftingPrintout(toShare, i);
			
		msg += '\r\n'
		return msg;
	};
	
	module.getCraftingPrintout = function (toShare, i) {
		var craftItem = Crafts[toShare[i]];
		var msg = '*'+toShare[i] + (craftItem.output > 1 ? (' x'+craftItem.output ) : '')+'*:\r\n';
		if (craftItem.procType) {
			msg += '_gives:_ lvl-'+craftItem.procType.level+' '+craftItem.procType.type+'\r\n';
		}
		if (craftItem.procReq) {
			msg += '_requires:_ lvl-'+craftItem.procReq.level+' '+craftItem.procReq.type+'\r\n';
		}
		var ingr = craftItem.recipe.ingredients;
		if (ingr) {
			var myIng = Object.keys(ingr);
			for (var j in myIng) {
				msg += myIng[j]+'-'+ingr[myIng[j]]+'\r\n';
			}
		}
		return msg
	};
	

	module.checkHelp = function () {
		var msg = 'After several minutes of contemplation, you realize that you could probably:\r\n';
		
		msg += '*move* _(u)p_, _(d)own_, _(l)eft_, or _(r)ight_\r\n';
		msg += '*dig*\r\n';
		msg += '*chop*\r\n';
		msg += '*search*,*take*, or *forage*\r\n';
		msg += '*equip* _something_\r\n';
		msg += '*eat* *#* _something_\r\n';
		msg += '*craft* _something_\r\n';
		msg += '*drop* *#* _something_\r\n';
		msg += '*find* or *call* _someone_\r\n';
		msg += '*fight* or *attack* _someone_\r\n';
		msg += '*insult* _someone_ or _something_\r\n';
		msg += '*check myself*\r\n';
		msg += '*check crafts*\r\n';
		msg += '*check crafts* _something_\r\n';	
		return msg;
	};
	return module;
}