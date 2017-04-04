/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
           ______     ______     ______   __  __     __     ______
          /\  == \   /\  __ \   /\__  _\ /\ \/ /    /\ \   /\__  _\
          \ \  __<   \ \ \/\ \  \/_/\ \/ \ \  _"-.  \ \ \  \/_/\ \/
           \ \_____\  \ \_____\    \ \_\  \ \_\ \_\  \ \_\    \ \_\
            \/_____/   \/_____/     \/_/   \/_/\/_/   \/_/     \/_/


This is a sample Slack bot built with Botkit.
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/


var Botkit = require('../node_modules/botkit/lib/Botkit.js');
var os = require('os');
var _ = require('lodash');
var uuid = require('node-uuid');
//var Promise = require('promise');

controller = Botkit.slackbot({
    debug: false
});
bot = controller.spawn({
    token: 'xoxb-74107224273-qTN33xkb2R9zy9bG5g1lMkSt'
}).startRTM();

setup = require("./listeners.js");
sys = require("./sys.js");
util = require("./util.js");
grammar = require("./grammar.js");
root = 'libFiles';

var library = [], listeners = {};
map = util.readMap('map3');
usermap = sys.loadJSON('usermap');
noun = sys.loadJSON('noun');
verb = sys.loadJSON('verb');
adj = sys.loadJSON('adj');
adv = sys.loadJSON('adv');
ref = sys.loadJSON('ref');
libFood = sys.loadJSON('food');
libMonsters = sys.loadJSON('monsters');
libWeapons = sys.loadJSON('weapons');
libTools = sys.loadJSON('tools');
libParts = sys.loadJSON('parts');
linsibMonsters = sys.loadJSON('monsters');
libCrafts = sys.loadJSON('crafts');
storage = sys.loadJSON('storage');
plurals = sys.loadJSON('plurals');
library = sys.loadJSON('library');
craftQue = sys.loadJSON('craftQue');
monsterQue = sys.loadJSON('monsterQue');
buildmap = sys.loadJSON('buildmap');

listeners.hello = function(bot, message) {
	var user = util.createUser(message.user);

	if (user && user.name) {
		if (user.name === 'crazy')
			util.smartReply(message, 'I dont talk to crazy people');
		
		else if (user.name === 'stupid')
			util.smartReply(message, 'Stupid is as stupid does.');
		
		else if (user.name === 'dragon')
			util.smartReply(message, 'Dragons are ' + sys.libRng(library.dragon) +'!!');
			
		else if (user.name === 'God, I love what')
			util.smartReply(message, 'Cheat!');
		
		else if (user.name === 'maybe' || user.name === 'Maybe')
			util.smartReply(message, 'https://www.youtube.com/watch?v=fWNaR-rxAic');
			
		else
			util.smartReply(message, sys.libRng(library.hello) + ' ' + user.name + ', you '+ sys.libRng(library.insultAdj) + ' ' + sys.libRng(library.insultNoun) +'!!');
		
	} else {
		util.smartReply(message, sys.libRng(library.hello) + ', you ' + sys.libRng(library.insultAdj) + ' ' + sys.libRng(library.insultNoun) +'!!');
	}
}

var setupInstance = new setup();
setupInstance.setGenericListeners(controller,util.createUser,util.smartReply);

var loadDependantListeners = function() {
	controller.hears(grammar.parseStringArray(library.hello), 'direct_message,direct_mention,mention', function(bot, message) {
		listeners.hello(bot, message);
	});
}

loadDependantListeners();

var getItemGuidFromName = function (inventory, name) {
	for (var i in inventory) 
		if (inventory[i].name == name)
			return inventory[i].guid;
	
	return null;
}

var addToInventory = function (inventory, item) {
	for (var i in inventory) {
		if (!item.guid && inventory[i].name == item.name) {
			inventory[i].count += item.count;
			return;
		}
	}
	inventory.push(item);
}

var removeFromInventory = function (inventory, item) {
	for (var i in inventory) {
		if (item.guid && inventory[i].guid == item.guid) {
			inventory.splice(i, 1);
			return true;
		} else if (inventory[i].name == item.name) {
			inventory[i].count -= item.count;
			return;
		}
	}
}

var transferItem = function (toInventory, fromInventory, item) {
	for (var i in fromInventory) {
		if ((item.guid && fromInventory[i].guid == item.guid) || fromInventory[i].name == item.name) {
		
			if (fromInventory[i].procType) {
				item.procType = fromInventory[i].procType;
			}
			removeFromInventory(fromInventory, item);
			addToInventory(toInventory, item);
		}
	}
}


var transferInventory = function (toInventory, fromInventory) {
	for (var i = 0 ; i < fromInventory.length; i++) {
		var item = {
			name: fromInventory[i].name,
			count: fromInventory[i].count,
			guid: fromInventory[i].guid
		};
		if (fromInventory[i].procType) {
			item.procType = fromInventory[i].procType;
		}
		if (removeFromInventory(fromInventory, item))
			i--;
		addToInventory(toInventory, item);
	}
}


var getInventoryItemCount = function (inventory, name) {
	for (var i in inventory)
		if (inventory[i].name == name)
			return inventory[i].guid ? 1 : inventory[i].count;
		
	return 0;
}

var checkCraftInventory = function (inventory, ingredients) {
	mats = Object.keys(ingredients);
	for (var i in mats)
		if (getInventoryItemCount(inventory, mats[i]) < ingredients[mats[i]])
			return mats[i];

	return false;
}

var removeItemDurability = function(inventory, item, reduction) {
	for (var i in inventory) {
		if ((item.guid && inventory[i].guid == item.guid) || inventory[i].name == item.name) {
			inventory[i].procType.durability -= reduction;
			return inventory[i].procType.durability;
		} 
	}
}

controller.hears(['settings (.*)'], 'ambient,direct_message,direct_mention,mention', function(bot, message) {
	var command = message.match[1];
	user = util.createUser(message.user);
	switch (command) {
		case 'silent':
			util.smartReply(message, 'A silence falls over the land as you fade away to sleep');
			user.inactive = true;
			break;
			
		case 'loud':
			user.inactive = false;
			util.smartReply(message, 'You wake up from your restless slumber');
			break;
			
		case 'verbose':
			user.verbose = true;
			util.smartReply(message, 'You decide to take life as it comes, and begin to see the beauty surrounding you.');
			break;
	
		case 'quick':
			user.verbose = false;
			util.smartReply(message, 'You move through life with blinders on, ignoring the mundane, but missing the beauty surrounding you');
			break;
			
	}

	util.saveUser(message.user, storage[message.user]);
});


var checkTile = function (usr, type) {
	return map[usr.y + height][usr.x + width] == type;
}

var getCount = function(toBuy) {
	var count = 1;
	if (parseInt(toBuy) > 0) {
		count = parseInt(toBuy);
		count = count > 0 ? count : 0;
		var split = toBuy.split(" ");
		if (split.length > 0) {
			toBuy = split[1];
		}
	}
	return count;
}

var dropStuff = function(user) {
	myground = buildmap[(user.y+height)+'-'+(user.x+width)].ground;
	transferInventory(myground, user.inventory)
	sys.saveJson('buildmap', buildmap);
	util.saveUser(user.id, storage[user.id]);
}

/*
var buyItem = function(usr, msg, toBuy, cnt, lib) {
	if (lib[toBuy]) {
		if (usr.money >= lib[toBuy].cost * cnt) {
			if(!usr.inventory[toBuy])
				usr.inventory[toBuy] = 0;
			usr.inventory[toBuy] += cnt
			usr.money -= lib[toBuy].cost * cnt;
			util.smartReply(msg, 'Hurray you bought ' + cnt + ' ' + (cnt > 1 ? grammar.singularToPlural(toBuy) : toBuy) + '! You now have ' + usr.inventory[toBuy] + ' ' + (usr.inventory[toBuy] > 1 ? grammar.singularToPlural(toBuy) : toBuy) +' and ' + usr.money + ' ' + sys.libRng(library.money) + '!');
			return true;
		} else {
			var reply = 'You think I would take ' + usr.money + ' for ';
			reply += (cnt > 1) ? ((lib[toBuy].cost * cnt) + ' ' + sys.libRng(library.money) + ' worth of ' + grammar.singularToPlural(toBuy)) : ('a ' + origonal + ' worth ' + (lib[toBuy].cost * cnt) + ' ' + sys.libRng(library.money));
			reply += '?! Come back when youre not a broke ' + sys.libRng(library.insultNoun)+'!';
			util.smartReply(msg, reply);
			return true;
		}
	}
	return false;
}

controller.hears(['\\bbuy (.*)','\\bbuy me (.*)'], 'ambient,direct_message,direct_mention,mention', function(bot, message) {
	var purchase = grammar.parseAAn(message.match[1]);
	var user = util.createUser(message.user);	
	var count = 1;
		
	if (parseInt(purchase) > 0) {
		count = parseInt(purchase);
		count = count > 0 ? count : 0;
		var split = purchase.split(" ");
		if (split.length > 0) {
			purchase = split[1];
		}
	}
	if (purchase.length < 15) {
		if (checkTile(user,'C')) {
			if (buyItem(user, message, purchase, count, libWeapons)) {
				return 1;
			} else if (buyItem(user, message, purchase, count, libFood)) {
				return 1;
			} else if (buyItem(user, message, purchase, count, libTools)) {
				return 1;
			} else if (buyItem(user, message, purchase, count, libParts)) {
				return 1;
			} else {
				util.smartReply(message, 'I dont have ' + (grammar.checkPlural(purchase) ? purchase : grammar.singularToPlural(purchase)) + ' silly!');
			}
		} else {
			util.smartReply(message, 'You realize it might be hard to buy'+ (count == 1 ? ' a ':' ') + purchase + ' out in the wilderness');
		}
	}
	util.saveUser(message.user, storage[message.user]);
});*/

var updateUserMap = function(user, size) {
	if(!usermap[user.id]) {
		usermap[user.id] = new Array(101);
		for (var y = 0; y < 101; y++){
			usermap[user.id][y] = new Array(101);
			for (var x = 0; x < 101; x++){
				usermap[user.id][y][x] ='-';
			}
		}
	}
	
	for (var y = size * 2 ; y >= 0; y--) {
		for (var x = 0; x < size * 2 + 1; x++) {
			usermap[user.id][user.y+50+y-size][user.x+50+x-size] = map[user.y+50+y-size][user.x+50+x-size];
		}
	}
	sys.saveJson('usermap', usermap);
};

var addToList = function(lib) {
	var reply = '';
	var tempLib =Object.keys(lib)
	for (var i in tempLib) {
		reply+= (tempLib[i] + ' - ' + lib[tempLib[i]].cost + ' \r\n');
	}
	return reply;
}

var addToInvList = function(arr) {
	var reply = '';
	for (var i in arr) {
		if(arr[i].count > 0 )
			reply+= ('*'+arr[i].name + '* - ' + (arr[i].procType ? arr[i].procType.durability : arr[i].count) + ' \r\n');
	}
	return reply;
}

controller.hears(['\\bhelp\\b'], 'ambient,direct_message,direct_mention,mention', function(bot, message) {

	var reply = 'After several minutes of contemplation you realize that you could probably:\r\n';
	reply += '*move* _(u)p_, _(d)own_, _(l)eft_, or _(r)ight_\r\n';
	reply += '*dig*\r\n';
	reply += '*chop*\r\n';
	reply += '*search*,*take*, or *forage*\r\n';
	reply += '*equip* _something_\r\n';
	reply += '*eat* *#* _something_\r\n';
	reply += '*craft* _something_\r\n';
	reply += '*drop* *#* _something_\r\n';
	reply += '*find* or *call* _someone_\r\n';
	reply += '*fight* or *attack* _someone_\r\n';
	reply += '*insult* _someone_ or _something_\r\n';
	reply += '*check myself*\r\n';
	reply += '*check crafts*\r\n';
	reply += '*check crafts* _something_\r\n';
	util.smartReply(message, reply);
});

controller.hears(['check myself'], 'ambient,direct_message,direct_mention,mention', function(bot, message) {
	var user = util.createUser(message.user);	

	var msg = 'You check yourself and find:\r\n';
	msg += '*health* - ' +user.health+'\r\n';
	msg += '*hunger* - ' +user.hunger+'\r\n';
	msg += '*walk distance* - ' +user.walked+'\r\n';
	msg += '*'+sys.libRng(library.money)+'* - ' +user.money+'\r\n';
	msg += addToInvList(user.inventory);
	util.smartReply(message, msg);
});

controller.hears(['check inventory'], 'ambient,direct_message,direct_mention,mention', function(bot, message) {
	var user = util.createUser(message.user);	

	var msg = 'You check your inventory and find:\r\n';
	msg += addToInvList(user.inventory);
	util.smartReply(message, msg);
});
controller.hears(['check map'], 'ambient,direct_message,direct_mention,mention', function(bot, message) {
	var user = util.createUser(message.user);	
	var msg = util.printLocalMap(user, 5);
	util.smartReply(message, msg);
});

controller.hears(['check full map'], 'ambient,direct_message,direct_mention,mention', function(bot, message) {
	var user = util.createUser(message.user);	
	var msg = util.printLocalMap(user, 101);
	util.smartReply(message, msg);
});

var getCraftingPrintout = function (toShare, i) {
	var msg = '*'+toShare[i] + (libCrafts[toShare[i]].output > 1 ? (' x'+libCrafts[toShare[i]].output ) : '')+'*:\r\n';
	if (libCrafts[toShare[i]].procType) {
		msg += '_gives:_ lvl-'+libCrafts[toShare[i]].procType.level+' '+libCrafts[toShare[i]].procType.type+'\r\n';
	}
	if (libCrafts[toShare[i]].procReq) {
		msg += '_requires:_ lvl-'+libCrafts[toShare[i]].procReq.level+' '+libCrafts[toShare[i]].procReq.type+'\r\n';
	}
	var ingr = libCrafts[toShare[i]].ingredients;
	if (ingr) {
		var myIng = Object.keys(ingr);
		for (var j in myIng) {
			msg += myIng[j]+'-'+ingr[myIng[j]]+'\r\n';
		}
	}
	return msg
}

var craftingMenu = function(Title, type, toShare) {
	var msg = '*_' + Title + ':_*\r\n';
	for (var i in toShare)
		if (libCrafts[toShare[i]].menu == type)
			msg += getCraftingPrintout(toShare, i);
	msg += '\r\n'
	return msg;
}

controller.hears(['check crafts(.*)'], 'ambient,direct_message,direct_mention,mention', function(bot, message) {
	var user = util.createUser(message.user);	
    var thing = message.match[1] ? grammar.parseAAn(message.match[1]) : null;
	var msg = 'From deep within your mind you bring forth the plans for ' + (thing ? thing : '') + ':\r\n';
	
	if (thing) {
		if (libCrafts[thing]) {
			var toShare = thing;
		} else {
			msg = 'Sadly you don\'t know if you actually know how to put together a ' + thing;
		}
	} else {
		var toShare = Object.keys(libCrafts);
	}
	
	msg += craftingMenu('Ingredients', 'ingredients', toShare);
	msg += craftingMenu('Tools', 'tool', toShare);
	msg += craftingMenu('Weapons', 'weapon', toShare);
	msg += craftingMenu('Crafting', 'crafting', toShare);
	msg += craftingMenu('Cooking', 'food', toShare);
		
	util.smartReply(message, msg);
});



/*
controller.hears(['check goods'], 'ambient,direct_message,direct_mention,mention', function(bot, message) {
	var user = util.createUser(message.user);	
	
	if (checkTile(user,'C')) {
		var reply = 'Heres what we have today!\r\n';
		reply += '--food--\r\n';
		reply += addToList(libFood);
		reply += '--weapons--\r\n';
		reply += addToList(libWeapons);
		reply += '--tools--\r\n';
		reply += addToList(libTools);
		reply += '--building--\r\n';
		reply += addToList(libParts);
		util.smartReply(message, reply);
	} else {
		util.smartReply(message, 'You realize it might be hard to buy things out in the wilderness');
	}
});*/


var checkBounds = function(direction, user) {
	if (sys.libCheck(library.north, direction)) {
		return user.y < height;
	} else if (sys.libCheck(library.south, direction) ) {
		return user.y > -height;
	} else if (sys.libCheck(library.east, direction) ) {
		return user.x < width;
	} else if (sys.libCheck(library.west, direction) ) {
		return user.x > -width;
	}
	return true;
}


controller.hears(['\\blook\\b','\\bmove(.*)'], 'ambient,direct_message,direct_mention,mention', function(bot, message) {
	var direction = message.match[1] ? grammar.parseAAn(message.match[1]) : null;
	var msg ="";
	
	user = util.createUser(message.user);
	if (direction && checkBounds(direction, user)) {
		if (sys.libCheck(library.north, direction)) {
			user.y++;
			user.walked++;
			if (user.walked % 5 == 0) {
				msg+= 'Your stomache rumbles lightly as you lose 1 point of hunger. '
				user.hunger--;
			}
		} else if (sys.libCheck(library.south, direction)) {
			user.y--;
			user.walked++;
			if (user.walked % 5 == 0) {
				msg+= 'Your stomache rumbles lightly as you lose 1 point of hunger. '
				user.hunger--;
			}
		} else if (sys.libCheck(library.east, direction)) {
			user.x++;
			user.walked++;
			if (user.walked % 5 == 0) {
				msg+= 'Your stomache rumbles lightly as you lose 1 point of hunger. '
				user.hunger--;
			}
		} else if (sys.libCheck(library.west, direction)) {
			user.x--;
			user.walked++;
			if (user.walked % 5 == 0) {
				msg+= 'Your stomache rumbles lightly as you lose 1 point of hunger. '
				user.hunger--;
			}
		} else {
			msg += ('Lost in confusion, you move nowhere. ');
		}
	} else if (direction) {
		util.smartReply(message, 'You bump against an invisible wall and grumble bitterly');
	}
	if (user.hunger <= 0) {
		msg+= ' Oh no! You\'ve starved to death :rip:';
		dropStuff(user);
		util.resetUser(user.id);;
		
	} else if (user.verbose) {
		var myground = buildmap[(user.y+height)+'-'+(user.x+width)].ground;
		msg += 'You look around and see ';
		switch (map[user.y + height][user.x + width]) {
			case '0':
				msg += 'an empty plains'
				break;
				
			case '1':
				msg += 'a sparse gathering of trees'
				break;
			
			case '2':
				msg += 'a rolling mountain'
				break;
				
				
			case '3':
				msg += 'a raging river.'
				break;
			
		}
		
		if (buildmap[(user.y+height)+'-'+(user.x+width)].building.name)
			msg += ' with a ' + buildmap[(user.y+height)+'-'+(user.x+width)].building.name + ' laying about'

		msg += '.';
		var found = 0;
		if (myground.length > 0) {
			var findmsg = ''
			
			for (var i in myground) {
				if (myground[i].count > 0) {
					found ++;
					findmsg += myground[i].count + ' ' + (myground[i].count > 1 ? grammar.singularToPlural(myground[i].name) : myground[i].name) + ', ';
				}
			}
			if (found > 0) {
				msg += ' You also see ' + findmsg;
				
				msg = msg.substr(0,msg.length - 2);
				msg = msg.replace(/,(?=[^,]*$)/, ' and')
				msg += '.';
			}
		}
	}
	util.smartReply(message, msg);
    updateUserMap(user, 2);
	util.saveUser(message.user, storage[message.user]);
});

var getLibThing = function(item, thing) {	
	if (libCrafts[item])
		return libCrafts[item][thing];
	if (libFood[item])
		return libFood[item][thing];
	if (libWeapons[item])
		return libWeapons[item][thing];
	if (libTools[item])
		return libTools[item][thing];
	
	if (libParts[item])
		return libParts[item][thing];
	
	return 0;
}


controller.hears(['set home'],'ambient,direct_message,direct_mention,mention', function(bot, message) {
	var user = util.createUser(message.user);
	user.home = {
		x: user.x,
		y: user.y
	}
	util.saveUser(message.user, storage[message.user]);
	util.smartReply(message,'You feel a growing sense of warmth as you find home');
});

controller.hears(['find (.*)','call (.*)'], 'ambient,direct_message,direct_mention,mention', function(bot, message) {
    var person = grammar.parseAAn(message.match[1]);
	var msg = '';
	var user = util.createUser(message.user);
	var otherUser = util.getUserByName(person);
	if (otherUser) {
		var ns = user.y - otherUser.y;
		var ew = user.x - otherUser.x;
		var dist = Math.sqrt(Math.pow(Math.abs(ns),2) + Math.pow(Math.abs(ew),2));
		
	}
	if (person == 'home') {
		msg += 'You get this distinct feeling that home is to the ';
		otherUser = {
			x:user.home.x,
			y: user.home.y
		};
	} else if (otherUser) {
		
		msg += 'You hear a ';
		if (dist >= 30) {
			msg += 'distant ';
		} else {
			msg += 'nearby ';
		}
		msg += 'shout from the ';
	}
	if (otherUser && otherUser.x == user.x && otherUser.y == user.y) {
		msg = 'You have a nice friendly chat with ' + (user.slackname == person ? 'yourself' : person);
		util.smartReply(message, msg);
		
	} else if (otherUser) {

		if (ns < 0) {
			msg += '*north';
		} else if (ns > 0) {
			msg += '*south';
		} 
		
		if (ew < 0) {
			msg += 'east';
		} else if (ew > 0) {
			msg += 'west';
		}
		msg += '*.';
		util.smartReply(message, msg);
	} else {
		msg = 'Oh no! It seems that ' + person + ' can\'t quite here you';
		util.smartReply(message,msg );
	}
});

controller.hears(['equip (.*)'], 'ambient,direct_message,direct_mention,mention', function(bot, message) {
    var item = grammar.parseAAn(message.match[1]);	
	var user = util.createUser(message.user);
	if (getInventoryItemCount(user.inventory, item) > 0) {
		util.smartReply(message, 'You gracefully equip your ' + item + ' in preparation for battle!');
		user.equiped = {};
		user.equiped['weapon'] = item;
		user.equiped['damage'] = getLibThing(item, 'damage');
		user.equiped['reusable'] = getLibThing(item, 'reusable');
		user.equiped['guid'] = getItemGuidFromName(user.inventory, item);
		var proc = getLibThing(item, 'procType')
		if (proc) {
			user.equiped['procLevel'] = proc.level;
			user.equiped['procType'] = proc.type;
		}
		util.saveUser(message.user, storage[message.user]);
	} else
		util.smartReply(message, 'Oh no! You seem to have misplaced your ' + item + '!' );
});


controller.hears(['drop (.*)'], 'ambient,direct_message,direct_mention,mention', function(bot, message) {
    var item = grammar.parseAAn(message.match[1]);
	var user = util.createUser(message.user);
	var count = 1;
	if (parseInt(item) > 0) {
		count = parseInt(item);
		count = count > 0 ? count : 0;
		var split = item.split(" ");
		if (split.length > 0) {
			item = split[1];
		}
	}
	
	if (count >= 1 && getInventoryItemCount(user.inventory, item) > 0) {
		util.smartReply(message, 'You accidentally drop '+ (count > 1 ? (count +' of your ' + grammar.singularToPlural(item)):('your ' + item )) + ', but thankfully nobody noticed');
		var guid = getItemGuidFromName(user.inventory, item);
		transferItem(buildmap[(user.y + height) + '-' + (user.x + width)].ground, user.inventory, {name: item, guid: guid, count:count});
		if (user.equiped.guid && user.equiped.guid == guid) {
			user.equiped = {
				weapon: 'fist',
				damage: 1,
				reusable: true
			}
		}
		util.saveUser(message.user, storage[message.user]);
		sys.saveJson('buildmap', buildmap);
	} else
		util.smartReply(message, 'Oh no! You seem to have misplaced your ' + item + '!' );
});

controller.hears(['smash (.*)'], 'ambient,direct_message,direct_mention,mention', function(bot, message) {
    var item = grammar.parseAAn(message.match[1]);
	var user = util.createUser(message.user);
	
	if (user.equiped.procType == 'hammer') {
		if(buildmap[(user.y + height) + '-' + (user.x + width)].building.name == item) {
			util.smartReply(message, 'You bring your '+ user.equiped.weapon +' thundering down upon the unsuspecting ' + item + ', smashing it to pieces' );
			buildmap[(user.y + height) + '-' + (user.x + width)].building = {};
			sys.saveJson('buildmap', buildmap);
			
			if (removeItemDurability(user.inventory,{name:user.equiped.weapon}, sys.rng(4,5)) <= 0) {
			
				util.smartReply(message, 'Oh no! Your ' + user.equiped.weapon + ' was detroyed in the process');	
				removeFromInventory(user.inventory,{name:user.equiped.weapon, guid:user.equiped.guid, procType: "removed"});
				user.equiped = {
					weapon: 'fist',
					damage: 1,
					reusable: true
				}
			}
			
			util.saveUser(message.user, storage[message.user]);
		} else {
			util.smartReply(message, 'You swing your mighty hammer at the ground in a show manly rage' );	
		}
	} else
		util.smartReply(message, 'You smash your head against the '+item+' until you realize a hammer might be helpful' );
});


controller.hears(['fight (.*)','attack (.*)'], 'ambient,direct_message,direct_mention,mention', function(bot, message) {
    var otherUserName = grammar.parseAAn(message.match[1]);
	var otherUser = util.getUserByName(otherUserName);
	var user = util.createUser(message.user);
	if (otherUser) {
		if (otherUser.x == user.x && otherUser.y == user.y) {
			if(user.health < 0)
				util.smartReply(message, 'You find yourself unable to fight, as you are a dead '+ sys.libRng(library.insultNoun) +'!' );
			else if (otherUser.health < 0)
				util.smartReply(message, 'You smack ' +otherUserName+'s dead body to wild applause! \\o/' );
			 
			else {
				otherUser.health -= user.equiped.damage;
				
				util.smartReply(message, 'You fight ' + otherUser.slackname + ' in mortal combat with your trusty '+ user.equiped.weapon +'!!');

				util.smartReply(message, otherUser.slackname + ' now has ' + otherUser.health + ' health!');
				
				if (otherUser.health <= 0) {
					
					
					util.smartReply(message, 'Oh no! Youve killed ' + otherUser.slackname +'! You ba$@*&d!');
					otherUser = util.resetUser(otherUser.id, true);
				}
				if (!user.equiped.reusable) {
					removeFromInventory(user.inventory, {name:user.equiped.weapon, count:1});
					
					if (getInventoryItemCount(user.inventory, user.equiped.weapon) <= 0) {
						util.smartReply(message, 'Oh no! Youve run out of your last ' + user.equiped.weapon + '!!');
						user.equiped ={
							weapon: 'fist',
							damage: 1,
							reusable: true
						};
					}
				}

			}
			util.saveUser(message.user, storage[message.user]);
			util.saveUser(otherUser.id, storage[otherUser.id]);

		} else {
			util.smartReply(message, 'You attempt to throw your ' + user.equiped.weapon + ' at '+otherUserName+', but find you arent quite strong enough' );
		}
	} else
		util.smartReply(message, otherUserName + ' has run away like a '+ sys.libRng(library.insultAdj) +' coward!' );
});

var checkBuildMapProc = function(x,y,process,level) {
	if (checkBounds(x,y)) {
		var cords = (y + height) + '-' + (x + width);
		building = buildmap[cords].building;

		if (building.procType)
			 return building.procType.type == process && building.procType.level >= level;
	}
	return false;
}

controller.hears(['\\bcraft (.*)\\b'], 'ambient,direct_message,direct_mention,mention', function(bot, message) {
	var user = util.createUser(message.user);
	var toCraft = grammar.parseAAn(message.match[1]);
	
	// Check not in river
	if (checkTile(user) == 3) {
		util.smartReply(message, 'You find it hard to craft anything in the middle of a river');
		return 1;
	}
	
	// Check recipie
	if (!libCrafts[toCraft]) {
		util.smartReply(message, 'You decide that it probably isn\'t even worth the effort to craft a '+ toCraft + ' and give up');
		return 1;
	}
	
	// Check space free
	var mybuilding = buildmap[(user.y + height) + '-' + (user.x + width)].building;
	if (mybuilding.name && libCrafts[toCraft].size && libCrafts[toCraft].size > 0) {
		util.smartReply(message, 'It might be a bit crowded here with the '+ buildmap[(user.y + height) + '-' + (user.x + width)].building.item +' and all');	
		return 1;
	}

	// Check materials
	var materials = Object.keys(libCrafts[toCraft].ingredients);
	var matNeeded = checkCraftInventory(user.inventory, libCrafts[toCraft].ingredients, toCraft)
	if (matNeeded) {
		util.smartReply(message, 'You seem not to have enough ' + grammar.singularToPlural(matNeeded) + ' for a '+ toCraft);
		return 1;
	} 
	
	// Check processors
	if (!(!libCrafts[toCraft].procReq || (user.equiped.procLevel >= libCrafts[toCraft].procReq.level && user.equiped.procType == libCrafts[toCraft].procReq.type ) || checkBuildMapProc(user.x,user.y,libCrafts[toCraft].procReq.type,libCrafts[toCraft].procReq.level))) {
		util.smartReply(message, 'You seem not to have all the processors to make '+ libCrafts[toCraft].output + ' ' + toCraft);	
		return 1;
	}
	

	// Add building
	if (libCrafts[toCraft].size > 0) {
		 buildmap[(user.y + height) + '-' + (user.x + width)].building = {
			name: toCraft,
			procType: libCrafts[toCraft].procType
		};
		sys.saveJson('buildmap', buildmap);
		
	// Add to crafting que
	} else if (libCrafts[toCraft].time > 1) {
		if (!buildmap[(user.y + height) + '-' + (user.x + width)].building.procType.inUse) {
			var newCraft = {
				x: user.x + width,
				y: user.y + height,
				message: message,
				item: {
					name: toCraft,
					count: libCrafts[toCraft].output,
				},
				countdown: libCrafts[toCraft].time * 60
			}
			if (libCrafts[toCraft].procType)
				newCraft.procType = libCrafts[toCraft].procType;
		    newCraft.durability = -sys.rng(2,3);
			console.log(newCraft);
			buildmap[(user.y + height) + '-' + (user.x + width)].building.procType.inUse = true;
			sys.saveJson('buildmap', buildmap);
			craftQue.push(newCraft);
		} else {
			util.smartReply(message, 'Your ' + buildmap[(user.y + height) + '-' + (user.x + width)].building.name + ' seems to be in use');
			return 1;
		}
			
		
	} else {
	
	// Add to inventory
		addToInventory(user.inventory, {name: toCraft, guid: uuid.v4(), count: libCrafts[toCraft].output, procType: libCrafts[toCraft].procType});
	}
	
	// Remove equiped processor durability
	if (libCrafts[toCraft].procReq && (user.equiped.procLevel >= libCrafts[toCraft].procReq.level && user.equiped.procType == libCrafts[toCraft].procReq.type )) {
		useEquipedItem(user, sys.rng(2,3))
	} 
	
	// Remove materials from inventory
	for (var i in materials) 
		removeFromInventory(user.inventory, {name:materials[i], count:libCrafts[toCraft].ingredients[materials[i]]});
	
	
	// Reply
	if (libCrafts[toCraft].time > 1)
		util.smartReply(message, 'Hurray! You\'ve started processing ' + libCrafts[toCraft].output + ' '+ toCraft+'. It will be ready in '+ libCrafts[toCraft].time +' minutes');
	else
		util.smartReply(message, 'Hurray! You\'ve sucessfully crafted ' + libCrafts[toCraft].output + ' '+ toCraft);
	util.saveUser(message.user, storage[message.user]);
});

controller.hears(['\\bsearch\\b','\\bforage\\b', '\\btake\\b'], 'ambient,direct_message,direct_mention,mention', function(bot, message) {

	var user = util.createUser(message.user);
	var myground = buildmap[(user.y+height)+'-'+(user.x+width)].ground;
	var found = 0;
	
	if (myground.length > 0) {
		var addMsg = '';
		for (var i in myground) {
			if (myground[i].guid || myground[i].count > 0) {
				found++;
				addMsg += myground[i].count + ' ' + (myground[i].count > 1 ? grammar.singularToPlural(myground[i].name) : myground[i].name) + ', ';
			}
		}
		transferInventory(user.inventory, myground);
		if (found >= 1 ) {
			var msg = 'You scour the ground and gather ' + addMsg;
			msg = msg.substr(0,msg.length - 2);
			if (found > 1)
				msg = msg.replace(/,(?=[^,]*$)/, ' and')
		}
	}
	
	util.smartReply(message, found > 0 ? msg : 'Due to your greedy nature, you have exhausted the resources at this location');
	
	if (found > 0)
		sys.saveJson('buildmap', buildmap);
	util.saveUser(message.user, storage[message.user]);
});

var useEquipedItem  = function(user,damage) {
	var msg;
	if (user.equiped.reusable == false) {
		removeFromInventory(user.inventory, {name: user.equiped.weapon, count:1});
		if (getInventoryItemCount(user.inventory, user.equiped.weapon) <= 0) {
			msg = 'Oh no! Youve run out of your last ' + user.equiped.weapon + '!!';
			user.equiped ={
				weapon: 'fist',
				damage: 1,
				reusable: true
			};
		}
	} else if (removeItemDurability(user.inventory, {name: user.equiped.weapon}, damage) <=0) {
		util.smartReply(message, 'Oh no! Your ' + user.equiped.weapon + ' was detroyed in the process');
		removeFromInventory(user.inventory,{name:user.equiped.weapon, guid:user.equiped.guid, procType: "removed"});
		user.equiped = {
			weapon: 'fist',
			damage: 1,
			reusable: true
		}
	}
	return msg
}

var checkEquipProc = function(user, type) {
	return libCrafts[user.equiped.weapon] && libCrafts[user.equiped.weapon].procType && libCrafts[user.equiped.weapon].procType.type == type;
}

controller.hears(['\\bchop\\b','\\bchop trees\\b'], 'ambient,direct_message,direct_mention,mention', function(bot, message) {
	var user = util.createUser(message.user);
	var tile = checkTile(user);
	var msg = '';
	var finalmsg;
	var toFindCount = {};
	hunger = sys.rng(8,10);
	
	var wood = sys.rng(50,100) * (tile == 1 ?  2: 1);
	
	if (checkEquipProc(user, 'axe')) {
		wood *= 3;
		finalmsg = useEquipedItem(user, sys.rng(2,3));
	}
	
	wood = Math.floor(wood/90);
	
	if (wood > 0)
		toFindCount['wood'] =  wood;
	
	
	toFind = Object.keys(toFindCount);
	
	if (wood > 0) {
		var msg = 'You thrust greatly at the tree with your mighty ' + user.equiped.weapon + ' and find ' + wood + ' wood';
		msg += ' but lose ';
	
	} else {
		msg += 'You ' + user.equiped.weapon + ' uselessly at a stuborn tree and lose ';
	}
	user.hunger -= hunger;
	user.hunger = user.hunger > 0 ? user.hunger : 0;
	msg += hunger + ' points of hunger. You find you have ' + user.hunger + ' points left';
	addToInventory(user.inventory, {name:'wood', count: wood});
	util.smartReply(message, msg);
	
	
	console.log(user.slackname + ' chops ('+user.x+':'+user.y+')')
	
	if (user.hunger <= 0) {
		msg = 'Oh no! You\'ve starved to death :rip:';
		dropStuff(user);
		util.resetUser(user.id);
		util.smartReply(message, msg);
		console.log(user.slackname + ' dies ('+user.x+':'+user.y+')')
		
	} else if (finalmsg) {
		util.smartReply(message, finalmsg);
	}
	
	util.saveUser(message.user, storage[message.user]);
});



controller.hears(['\\bdig\\b'], 'ambient,direct_message,direct_mention,mention', function(bot, message) {
	var user = util.createUser(message.user);
	var tile = checkTile(user);
	var msg = '';
	var finalmsg;
	var toFindCount = {};
	hunger = sys.rng(4,6);
	
	var mud = sys.rng(1,100) * (tile == 3 ? 4 : 1);
	var tuber = sys.rng(1,100) * (tile == 1 ? 4 : 1);
	var rock = sys.rng(1,100) * (tile == 2 ? 2 : 1);
	var iron = sys.rng(1,100) * (tile == 2 ? 3 : 1)
	
	if (checkEquipProc(user, 'shovel')) {
		hunger -= (user.equiped.procLevel * 2);
		if ( hunger < 0 )
			hunger = 0;
		mud *= 2;
		tuber *= 2;
		finalmsg = useEquipedItem(user, sys.rng(2,3));
	} else if (checkEquipProc(user, 'pickaxe')) {
		if ( hunger < 0 )
			hunger = 0;
		rock += (10 * user.equiped.procLevel);
		iron += (15 * user.equiped.procLevel);
		finalmsg = useEquipedItem(user, sys.rng(2,3));
	}
	
	mud = Math.floor(mud/80);
	rock = Math.floor(rock/50);
	tuber = Math.floor(tuber/50);
	iron = Math.floor(iron/70);
	
	if (mud > 0)
		toFindCount['mud'] =  mud;
	if (rock > 0)
		toFindCount['rock'] =  rock;
	if (tuber > 0)
		toFindCount['tuber'] =  tuber;
	if (iron > 0)
		toFindCount['iron ore'] =  iron;
	
	
	toFind = Object.keys(toFindCount);
	
	if (mud + rock + tuber + iron > 0) {
		var found = 0;
		var addMsg = '';
		for (var i in toFind) {
			found ++;
			addMsg += toFindCount[toFind[i]] + ' ' + (toFindCount[toFind[i]] > 1 ? grammar.singularToPlural(toFind[i]) : toFind[i]) + ', ';
			addToInventory(user.inventory, {name: toFind[i], count: toFindCount[toFind[i]]});
		}
		
		
		if (found >= 1 ) {
			var msg = 'You break the ground with all the migth behind your trusty ' + user.equiped.weapon + ' and find ' + addMsg;
			msg = msg.substr(0,msg.length - 2);
			if (found > 1)
				msg = msg.replace(/,(?=[^,]*$)/, ' and');
		}
		
		msg += ' but lose ';
	
	} else {
		msg += 'You pound your ' + user.equiped.weapon + ' uselessly at the ground and lose ';
	}
	user.hunger -= hunger;
	user.hunger = user.hunger > 0 ? user.hunger : 0;
	msg += hunger + ' points of hunger. You find you have ' + user.hunger + ' points left';
	util.smartReply(message, msg);
	
	if (user.hunger <= 0) {
		msg = 'Oh no! You\'ve starved to death :rip:';
		dropStuff(user);
		util.resetUser(user.id);
		util.smartReply(message, msg);
		console.log(user.slackname + ' dies ('+user.x+':'+user.y+')');
		
	} else if (finalmsg) {
		util.smartReply(message, finalmsg);
	}
	console.log(user.slackname + ' digs ('+user.x+':'+user.y+')')
	util.saveUser(message.user, storage[message.user]);
});


controller.hears(['check money'], 'ambient,direct_message,direct_mention,mention', function(bot, message) {

	var user= util.createUser(message.user);

	util.smartReply(message, 'You got ' + user.money + ' '+sys.libRng(library.money)+'!');	
});

controller.hears(['give me (.*)'], 'ambient,direct_message,direct_mention,mention', function(bot, message) {
    /*var money = grammar.parseAAn(message.match[1]);
	user= util.createUser(message.user);
	if (isNaN(user.money))
		user.money = 0;
	var toGain = parseInt(money) 
	if (isNaN(toGain))
		util.smartReply(message, 'Sadly I have lost all of my ' + money + ' ' + sys.sys.libRng(library.money) + ' D:');
	else if (toGain > 10000 || toGain < -10000)
		util.smartReply(message, 'I aint got that kinda money D:');	
	else {
		user.money += toGain;

		util.smartReply(message, 'Got it. I will give you ' + toGain + ' '+ sys.sys.libRng(library.money) +'!');

		util.smartReply(message, user.name + ', you now have ' + user.money + ' '+ sys.sys.libRng(library.money) +'!');

	}
	util.saveUser(message.user, storage[message.user]);*/
	util.smartReply(message, 'I aint got that kinda money D:');	
});

controller.hears(['insult (.*)'], 'direct_message,direct_mention,mention', function(bot, message) {
	var person = grammar.parseAAn(message.match[1]);
	
	user = util.createUser(message.user);
	if(person == 'someone' ) {
		var randId = Object.keys(storage)[sys.rng(0, Object.keys(storage).length-1)];
		var slackname = storage[randId] ? storage[randId].slackname : "my boy";

		bot.reply(message, slackname + ' is a ' + sys.libRng(library.insultAdj) + ' ' + sys.libRng(library.insultNoun) + '!');
	} else {
		person = grammar.parseAAn(person);
		person = grammar.checkPlural(person) ? person : grammar.singularToPlural(person);
		bot.reply(message, person + ' are wankers!');
	}

});

var eatItem = function(usr, msg, toEat, cnt, lib) {

	if (lib[toEat]) {
		var guid = getItemGuidFromName(usr, toEat);
		if (getInventoryItemCount(usr.inventory, toEat)) {
			removeFromInventory(usr.inventory, {name: toEat, count: cnt});
			var toheal = 0;
			if (lib[toEat].heal)
				toheal = (lib[toEat].heal + sys.rng(1,6) )* cnt;
			if (lib[toEat].hunger)
				tohunger = (lib[toEat].hunger + sys.rng(1,6) )* cnt;
			usr.health += toheal;
			usr.hunger += tohunger;
			console.log(usr.slackname + ' eats ' + toEat + ' for ' + tohunger+'/'+toheal + ' ('+usr.x+':'+usr.y+')')
			util.smartReply(msg, 'You eat ' + cnt + ' ' + (cnt > 1 ? grammar.singularToPlural(toEat) : toEat) + ' and find yourself at ' + usr.health + ' health and ' + usr.hunger + ' hunger. It tastes like chicken.');
			if (usr.health <= 0) {
				
				util.smartReply(msg, 'Oh no! Youve killed yourself with your '+(cnt > 1 ? grammar.singularToPlural(toEat) : toEat)+'! You ba$@*&d!');
				usr = util.resetUser(usr.id, true);
				
			}
			util.saveUser(msg.usr, storage[msg.usr]);
			return true;
		} else {
			util.smartReply(msg, 'Oh no! You can\'t find any more '+ grammar.singularToPlural(toEat)+'.');
			return true;
		}
	}
	return false;
}

controller.hears(['\\beat (.*)', '\\beat my (.*)'], 'ambient,direct_message,direct_mention,mention', function(bot, message) {
    var food = grammar.parseAAn(message.match[1]);
	var user = util.createUser(message.user);
	var otherUser = util.getUserByName(food);
	
	if (otherUser) {
		otherUser.health += 5;
		user.health += 5;
		util.smartReply(message, 'You eat '+food+' and find yourself at '+user.health+' health. It tastes like chicken.');
		util.saveUser(message.user, storage[message.user]);
		util.saveUser(otherUser.user, storage[otherUser.user]);
	} else {
		var count = 1;
		if (parseInt(food) > 0) {
			count = parseInt(food);
			count = count > 0 ? count : 0;
			var split = food.split(" ");
			if (split.length > 0) {
				food = split[1];
			}
		}
		
		if (eatItem(user, message, food, count, libFood)) {
			return 1;
		} else if (eatItem(user, message, food, count, libWeapons)) {
			return 1;
		} else if (eatItem(user, message, food, count, libTools)) {
			return 1;
		} else if (eatItem(user, message, food, count, libParts)) {
			return 1;
		} else {
			util.smartReply(message, 'You find yourself unable to eat any more '+food+'.');
		}
	}
});

controller.hears(['call me (.*)', 'my name is (.*)'], 'ambient,direct_message,direct_mention,mention', function(bot, message) {
    var name = message.match[1];
	user = util.createUser(message.user);
	
	user.name = name;
	util.saveUser(message.user, storage[message.user]);
	util.smartReply(message, 'Got it. I will call you ' + name + ' from now on.');

});

controller.hears(['what is my name', 'who am i'], 'ambient,direct_message,direct_mention,mention', function(bot, message) {

    controller.storage.users.get(message.user, function(err, user) {
        if (user && user.name) {
            util.smartReply(message, 'Your name is ' + user.name);
        } else {
            bot.startConversation(message, function(err, convo) {
                if (!err) {
                    convo.say('I do not know your name yet!');
                    convo.ask('What should I call you?', function(response, convo) {
                        convo.ask('You want me to call you `' + response.text + '`?', [
                            {
                                pattern: 'yes',
                                callback: function(response, convo) {
                                    // since no further messages are queued after this,
                                    // the conversation will end naturally with status == 'completed'
                                    convo.next();
                                }
                            },
                            {
                                pattern: 'no',
                                callback: function(response, convo) {
                                    // stop the conversation. this will cause it to end with status == 'stopped'
                                    convo.stop();
                                }
                            },
                            {
                                default: true,
                                callback: function(response, convo) {
                                    convo.repeat();
                                    convo.next();
                                }
                            }
                        ]);

                        convo.next();

                    }, {'key': 'nickname'}); // store the results in a field called nickname

                    convo.on('end', function(convo) {
                        if (convo.status == 'completed') {
                            util.smartReply(message, 'OK! I will update my dossier...');

                            controller.storage.users.get(message.user, function(err, user) {
                                if (!user) {
                                    user = {
                                        id: message.user,
                                    };
                                }
                                user.name = convo.extractResponse('nickname');
                                controller.storage.users.save(user, function(err, id) {
                                    util.smartReply(message, 'Got it. I will call you ' + user.name + ' from now on.');
                                });
                            });



                        } else {
                            // this happens if the conversation ended prematurely for some reason
                            util.smartReply(message, 'OK, nevermind!');
                        }
                    });
                }
            });
        }
    });
});


controller.hears(['shutdown'], 'ambient,direct_message,direct_mention,mention', function(bot, message) {

    bot.startConversation(message, function(err, convo) {

        convo.ask('Are you sure you want me to shutdown?', [
            {
                pattern: bot.utterances.yes,
                callback: function(response, convo) {
                    convo.say('Bye!');
                    convo.next();
                    setTimeout(function() {
                        process.exit();
                    }, 3000);
                }
            },
        {
            pattern: bot.utterances.no,
            default: true,
            callback: function(response, convo) {
                convo.say('*Phew!*');
                convo.next();
            }
        }
        ]);
    });
});


controller.hears(['uptime', 'identify yourself', 'who are you', 'what is your name'],
    'ambient,direct_message,direct_mention,mention', function(bot, message) {

        var hostname = os.hostname();
        var uptime = formatUptime(process.uptime());

        util.smartReply(message,
            ':robot_face: I am a bot named <@' + bot.identity.name +
             '>. I have been running for ' + uptime + ' on ' + hostname + '.');

    });

function formatUptime(uptime) {
    var unit = 'second';
    if (uptime > 60) {
        uptime = uptime / 60;
        unit = 'minute';
    }
    if (uptime > 60) {
        uptime = uptime / 60;
        unit = 'hour';
    }
    if (uptime != 1) {
        unit = unit + 's';
    }

    uptime = uptime + ' ' + unit;
    return uptime;
}

controller.hears(['such (.*)'], 'ambient,direct_message,direct_mention,mention', function(bot, message) {

	util.smartReply(message, 'much wow');
});

controller.hears(['dict (.*)'], 'ambient,direct_message,direct_mention,mention', function(bot, message) {
	var word = message.match[1];
	if (parseInt(ref[word]) > 0) {
		require('fs').readFile('heads/head'+ ref[word] +'.txt', 'ascii', function (err,data) {
			if (err) {
				console.log("Error: Storage failed to load");
				process.exit(1);
			}
			util.smartReply(message, data.toString());
		
		});
	}
});


controller.hears(['check (.*)'], 'ambient,direct_message,direct_mention,mention', function(bot, message) {
	var word = message.match[1];
	
	
	if (adj[word] || _.invert(adj)[word])
		util.smartReply(message, 'adj - ' + (adj[word] ? adj[word] : word ));
	else if (adv[word] || _.invert(adv)[word])
		util.smartReply(message, 'adv - ' + (adv[word] ? adv[word] : word ));
	else if (noun[word] || _.invert(noun)[word])
		util.smartReply(message, 'noun - ' + (noun[word] ? noun[word] : word ));
	else if (verb[word] || _.invert(verb)[word])
		util.smartReply(message, 'verb - ' + (verb[word] ? verb[word] : word));
	else
		util.smartReply(message, word + ' aint no thang');
});

	
controller.hears(['heyo'], 'ambient,direct_message,direct_mention,mention', function(bot, message) {
	
	util.smartReply(message, 'http://www.hiyoooo.com/');
});


controller.hears(['may is lame'], 'ambient,direct_message,direct_mention,mention', function(bot, message) {
	util.smartReply(message, 'true');
});

controller.hears(['\\bim (.*)',"\\bi'm (.*)", '\\bi am (.*)'], 'ambient,direct_message,direct_mention,mention', function(bot, message) {
	var user = util.createUser(message.user);
	
	var person = message.match[1];
	person = grammar.parseAAn(person);
	
	if (user.name == 'dad')
		util.smartReply(message, 'hi dad');
	
	else if (person == 'dad' || person == 'Dad')
		util.smartReply(message, 'no _im_ dad');
	
	else if (!person.match(/\w*ing\b/) && person.length < 20)
		util.smartReply(message, 'Hello ' + person + ', im dad');
});



controller.tick = function() {
	// Handel craft que
	for (i in craftQue) {
		if (craftQue[i].countdown > 0) {
			if (craftQue[i].countdown % 30 == 0)
				console.log('processing '+craftQue[i].item.name + '-'+ craftQue[i].countdown +' (' + craftQue[i].y+'-'+craftQue[i].x+')')
			craftQue[i].countdown -= 1;
			if (craftQue[i].countdown <= 0) {
				console.log(craftQue[i].item.name + ' finished crafting');
				util.smartReply(craftQue[i].message, 'Hurray! Your '+ craftQue[i].item.name +' is done');
				addToInventory(buildmap[craftQue[i].y+'-'+craftQue[i].x].ground, craftQue[i].item)
				if (craftQue[i] && buildmap[craftQue[i].y+'-'+craftQue[i].x].building && craftQue[i].durability) {
					buildmap[craftQue[i].y+'-'+craftQue[i].x].building.procType.inUse = false;
					buildmap[craftQue[i].y+'-'+craftQue[i].x].building.procType.durability += craftQue[i].durability;
					if (buildmap[craftQue[i].y+'-'+craftQue[i].x].building.procType.durability <= 0) {
						util.smartReply(craftQue[i].message, 'Oh no! Your ' + buildmap[craftQue[i].y+'-'+craftQue[i].x].building.name + ' was detroyed');	
						buildmap[craftQue[i].y+'-'+craftQue[i].x].building = {};
					}
				}
				
				sys.saveJson('buildmap', buildmap);
				craftQue.splice(i, 1);
			}
			sys.saveJson('craftQue',craftQue);
		}
	}
}