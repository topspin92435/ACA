/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
           ______     ______     ______   __  __     __     ______
          /\  == \   /\  __ \   /\__  _\ /\ \/ /    /\ \   /\__  _\
          \ \  __<   \ \ \/\ \  \/_/\ \/ \ \  _"-.  \ \ \  \/_/\ \/
           \ \_____\  \ \_____\    \ \_\  \ \_\ \_\  \ \_\    \ \_\
            \/_____/   \/_____/     \/_/   \/_/\/_/   \/_/     \/_/


This is a sample Slack bot built with Botkit.
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
const root = 'libFiles';

var Botkit = require("../lib/Botkit.js");
var tok = require("../token.js")

var os = require('os');
var _ = require('lodash');
var uuid = require('node-uuid');

var sys = require("./sys.js")(root);
var setup = require("./listeners.js");
var util = require("./util.js");
var grammar = require("./grammar.js");

var controller = Botkit.slackbot({
    debug: false
});
bot = controller.spawn({
    token: tok.getTok()
}).startRTM();

var library = [], listeners = {};

map = util.readMap('map3');
usermap = sys.loadJSON('usermap');
noun = sys.loadJSON('noun');
verb = sys.loadJSON('verb');
adj = sys.loadJSON('adj');
adv = sys.loadJSON('adv');
ref = sys.loadJSON('ref');
libMonsters = sys.loadJSON('monsters');
libParts = sys.loadJSON('parts');
linsibMonsters = sys.loadJSON('monsters');
libCrafts = sys.loadJSON('crafts');
storage= sys.loadJSON('storage');
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
setupInstance.setGenericListeners(controller,util.createUser,util.smartReply, library);

var loadDependantListeners = function() {
	controller.hears(grammar.parseStringArray(library.hello), 'direct_message,direct_mention,mention', function(bot, message) {
		listeners.hello(bot, message);
	});
}

loadDependantListeners();


var getCords = function (y,x) {
	return (y + height).toString() + '-' + (x + width).toString();
}

var getBuildMap = function(user) {
	return buildmap[getCords(user.y, user.x)];
}


var getItemGuidFromName = function (inventory, name) {
	for (var i of inventory) 
		if (i.name == name)
			return i.guid;
	
	return null;
}

var addToInventory = function (inventory, item) {
	for (var i of inventory) {
		if (!item.guid && i.name == item.name) {
			i.count += item.count;
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

controller.hears(['settings (.*)'], 'direct_message,direct_mention,mention', function(bot, message) {
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

var getCount = function(item) {
	var count = 1;
	if (parseInt(item) > 0) {
		count = parseInt(item);
		count = count > 0 ? count : 0;
		var split = item.split(" ");
		if (split.length > 0) {
			item = split[1];
		}
	}
	return count;
}

var dropStuff = function(user) {
	var ground = getBuildMap(user).ground;
	transferInventory(ground, user.inventory)
	sys.saveJSON('buildmap', buildmap);
	util.saveUser(user.id, storage[user.id]);
}


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
			usermap[user.id][user.y+height+y-size][user.x+width+x-size] = map[user.y+height+y-size][user.x+width+x-size];
		}
	}
	sys.saveJSON('usermap', usermap);
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

controller.hears(['\\bhelp\\b'], 'direct_message,direct_mention,mention', function(bot, message) {

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

controller.hears(['check myself'], 'direct_message,direct_mention,mention', function(bot, message) {
	var user = util.createUser(message.user);	

	var msg = 'You check yourself and find:\r\n';
	msg += '*health* - ' +user.health+'\r\n';
	msg += '*hunger* - ' +user.hunger+'\r\n';
	msg += '*walk distance* - ' +user.walked+'\r\n';
	msg += '*'+sys.libRng(library.money)+'* - ' +user.money+'\r\n';
	msg += addToInvList(user.inventory);
	util.smartReply(message, msg);
});

controller.hears(['check inventory'], 'direct_message,direct_mention,mention', function(bot, message) {
	var user = util.createUser(message.user);	

	var msg = 'You check your inventory and find:\r\n';
	msg += addToInvList(user.inventory);
	util.smartReply(message, msg);
});
controller.hears(['check map'], 'direct_message,direct_mention,mention', function(bot, message) {
	var user = util.createUser(message.user);	
	var msg = util.printLocalMap(user, 5, true);
	util.smartReply(message, msg);
});

/*controller.hears(['check full map'], 'direct_message,direct_mention,mention', function(bot, message) {
	var user = util.createUser(message.user);	
	var msg = util.printLocalMap(user, 101);
	util.smartReply(message, msg);
});*/

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

controller.hears(['check crafts(.*)'], 'direct_message,direct_mention,mention', function(bot, message) {
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


controller.hears(['\\blook\\b','\\bmove(.*)'], 'direct_message,direct_mention,mention', function(bot, message) {

	var direction = grammar.parseAAn(message.match[1]);
	var msg ="";
	var user = util.createUser(message.user);
	if (direction && checkBounds(direction, user)) {
		if (sys.libCheck(library.north, direction)) {
			user.y++;
			user.walked++;
		} else if (sys.libCheck(library.south, direction)) {
			user.y--;
			user.walked++;
		} else if (sys.libCheck(library.east, direction)) {
			user.x++;
			user.walked++;
		} else if (sys.libCheck(library.west, direction)) {
			user.x--;
			user.walked++;
		} else {
			msg += ('Lost in confusion, you move nowhere. ');
		}
	} else if (direction) {
		util.smartReply(message, 'You bump against an invisible wall and grumble bitterly');
	}
	
	console.log(user.slackname , '(y:' + user.y, 'x:' + user.x+')');
	/*if (user.hunger <= 0) {
		msg+= ' Oh no! You\'ve starved to death :rip:';
		dropStuff(user);
		util.resetUser(user.id);;
		
	} else */
	if (user.verbose) {
		var myMap = getBuildMap(user);
		msg += 'You look around and ';
		if (myMap.building.name) {
			if (myMap.building.type == 'static')
				msg += 'see a ' + myMap.building.name + ' laying about.';
			else if (myMap.building.type == 'building') {
				msg += 'find yourself '+(myMap.building.name == 'path' ? 'on':'in')+' ';
				if (myMap.building.title)
					msg += myMap.building.title;
				else
					msg += 'a ' + myMap.building.name;
				msg += '.';
			}
		}
		else {
			msg += "see "
			switch (map[user.y + height][user.x + width]) {
				case '0':
					msg += 'an empty plains.'
					break;
					
				case '1':
					msg += 'a sparse gathering of trees.'
					break;
				
				case '2':
					msg += 'a rolling mountain.'
					break;
					
					
				case '3':
					msg += 'a raging river.'
					break;
				
			}
		}

		var found = 0;
		if (myMap.ground.length > 0) {
			var findmsg = ''
			
			for (var i in myMap.ground) {
				if (myMap.ground[i].count > 0) {
					found ++;
					findmsg += myMap.ground[i].count + ' ' + (myMap.ground[i].count > 1 ? grammar.singularToPlural(myMap.ground[i].name) : myMap.ground[i].name) + ', ';
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
	
	updateUserMap(user, 2);
	//if (message.channel == 'D262RMS92') {
		msg += util.printLocalMap(user, 5, false);
	//}
	util.smartReply(message, msg);
    

	util.saveUser(message.user, storage[message.user]);
});

var getLibThing = function(item, thing) {	
	if (libCrafts[item])
		return libCrafts[item][thing]
	
	if (libParts[item])
		return libParts[item][thing]
	return 0;
}


controller.hears(['set home'],'direct_message,direct_mention,mention', function(bot, message) {
	var user = util.createUser(message.user);
	user.home = {
		x: user.x,
		y: user.y
	}
	util.saveUser(message.user, storage[message.user]);
	util.smartReply(message,'You feel a growing sense of warmth as you find home');
});

controller.hears(['find (.*)'], 'direct_message,direct_mention,mention', function(bot, message) {
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

controller.hears(['equip (.*)'], 'direct_message,direct_mention,mention', function(bot, message) {
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


controller.hears(['drop (.*)'], 'direct_message,direct_mention,mention', function(bot, message) {
    var item = grammar.parseAAn(message.match[1]);
	var user = util.createUser(message.user);
	var count = getCount(item);
	
	if (count >= 1 && getInventoryItemCount(user.inventory, item) > 0) {
		util.smartReply(message, 'You accidentally drop '+ (count > 1 ? (count +' of your ' + grammar.singularToPlural(item)):('your ' + item )) + ', but thankfully nobody noticed');
		var guid = getItemGuidFromName(user.inventory, item);
		transferItem(getBuildMap(user).ground, user.inventory, {name: item, guid: guid, count:count});
		if (user.equiped.guid && user.equiped.guid == guid) {
			user.equiped = {
				weapon: 'fist',
				damage: 1,
				reusable: true
			}
		}
		util.saveUser(message.user, storage[message.user]);
		sys.saveJSON('buildmap', buildmap);
	} else
		util.smartReply(message, 'Oh no! You seem to have misplaced your ' + item + '!' );
});

controller.hears(['smash (.*)'], 'direct_message,direct_mention,mention', function(bot, message) {
    var item = grammar.parseAAn(message.match[1]);
	var user = util.createUser(message.user);
	var myMap = getBuildMap(user);
	
	if (user.equiped.procType == 'hammer') {
		if(myMap.building.name == item) {
			util.smartReply(message, 'You bring your '+ user.equiped.weapon +' thundering down upon the unsuspecting ' + item + ', smashing it to pieces' );
			buildmap[getCords(user.y,user.x, height,width)].building = {};
			sys.saveJSON('buildmap', buildmap);
			
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


controller.hears(['fight (.*)','attack (.*)'], 'direct_message,direct_mention,mention', function(bot, message) {
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
		var cords = getCords(y,x,height,width);
		building = buildmap[cords].building;

		if (building.procType)
			 return building.procType.type == process && building.procType.level >= level;
	}
	return false;
}

controller.hears(['\\bcraft (.*)\\b'], 'direct_message,direct_mention,mention', function(bot, message) {
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
	var mybuilding = buildmap[getCords(user.y,user.x, height,width)].building;
	if (mybuilding.name && libCrafts[toCraft].size && libCrafts[toCraft].size > 0) {
		util.smartReply(message, 'It might be a bit crowded here with the '+ mybuilding.name +' and all');	
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
		 buildmap[getCords(user.y,user.x, height,width)].building = {
			name: toCraft,
			type: libCrafts[toCraft].type,
			procType: libCrafts[toCraft].procType
		};
		sys.saveJSON('buildmap', buildmap);
		
	// Add to crafting que
	} else if (libCrafts[toCraft].time > 1) {
		if (!buildmap[getCords(user.y,user.x, height,width)].building.procType.inUse) {
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
			buildmap[getCords(user.y,user.x, height,width)].building.procType.inUse = true;
			sys.saveJSON('buildmap', buildmap);
			craftQue.push(newCraft);
		} else {
			util.smartReply(message, 'Your ' + buildmap[getCords(user.y,user.x, height,width)].building.name + ' seems to be in use');
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

controller.hears(['\\bsearch\\b','\\bforage\\b', '\\btake\\b'], 'direct_message,direct_mention,mention', function(bot, message) {

	var user = util.createUser(message.user);
	var myground = getBuildMap(user).ground;
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
		sys.saveJSON('buildmap', buildmap);
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


/*
controller.hears(['\\bplant tuber\\b'], 'direct_message,direct_mention,mention', function(bot, message) {
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
	buildmap[getCords(user.y,user.x, height,width)].building.procType.inUse = true;
	sys.saveJSON('buildmap', buildmap);
	craftQue.push(newCraft);
}*/



var eatItem = function(usr, msg, toEat, cnt, lib) {
	if (lib[toEat]) {
		var guid = getItemGuidFromName(usr, toEat);
		if (getInventoryItemCount(usr.inventory, toEat)) {
			if (!lib[toEat].heal && !lib[toEat].hunger)
				return false;
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

controller.hears(['\\bname building (.*)'], 'direct_message,direct_mention,mention', function(bot, message) {
    var title = grammar.parseAAn(message.match[1]);
	var user = util.createUser(message.user);
	var building = getBuildMap(user).building;

	if (building && building.name) {
		building.title = title;
		util.smartReply(message, 'Upon further contemplation, you discover your '+building.name+' is actually called ' + building.title);
	}
});

controller.hears(['\\beat (.*)', '\\beat my (.*)'], 'direct_message,direct_mention,mention', function(bot, message) {
    var food = grammar.parseAAn(message.match[1]);
	var user = util.createUser(message.user);
	var otherUser = util.getUserByName(food);
	var count = getCount(food);

	if (otherUser) {
		otherUser.health += 5;
		user.health += 5;
		util.smartReply(message, 'You eat '+food+' and find yourself at '+user.health+' health. It tastes like chicken.');
		util.saveUser(message.user, storage[message.user]);
		util.saveUser(otherUser.user, storage[otherUser.user]);
	} else {
		if (eatItem(user, message, food, count, libCrafts)) {
			return 1;
		} else {
			util.smartReply(message, 'You find yourself unable to eat any more '+food+'.');
		}
	}
});

controller.hears(['call me (.*)'], 'direct_message,direct_mention,mention', function(bot, message) {
    var name = message.match[1];
	user = util.createUser(message.user);
	
	user.name = name;
	util.saveUser(message.user, storage[message.user]);
	util.smartReply(message, 'Got it. I will call you ' + name + ' from now on.');

});

controller.tick = function() {
	// Handel craft que
	for (i in craftQue) {
		if (craftQue[i].countdown > 0) {
			if (craftQue[i].countdown % 30 == 0)
				console.log('processing '+craftQue[i].item.name + '-'+ craftQue[i].countdown +' (' + craftQue[i].y+'-'+craftQue[i].x+')')
			craftQue[i].countdown--;
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
				
				sys.saveJSON('buildmap', buildmap);
				craftQue.splice(i, 1);
			}
			sys.saveJSON('craftQue',craftQue);
		}
	}
};