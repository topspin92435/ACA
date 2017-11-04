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

sys = require("./sys.js")(root);
setup = require("./listeners.js");
util = require("./util.js")();
grammar = require("./grammar.js");
invt = require("./inventory.js")();


User = require('./types/user.js');
Recipe = require('./types/recipe.js');
ProcType = require('./types/proctype.js');
ProcReq = require('./types/procreq.js');
Item = require('./types/item.js');
Crafts = require('./types/crafts.js')();

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
storage= sys.loadJSON('storage');
plurals = sys.loadJSON('plurals');
library = sys.loadJSON('library');
craftQue = sys.loadJSON('craftQue');
monsterQue = sys.loadJSON('monsterQue');
buildmap = sys.loadJSON('buildmap');



listeners.hello = function(bot, message) {
	var user = util.getUser(message.user);

	if (user && user.name) {
	    if (user.name === 'dragon')
			util.smartReply(message, 'Dragons are ' + sys.libRng(library.dragon) +'!!');
		
		else if (user.name === 'maybe' || user.name === 'Maybe')
			util.smartReply(message, 'https://www.youtube.com/watch?v=fWNaR-rxAic');
			
		else
			util.smartReply(message, sys.libRng(library.hello) + ' ' + user.name + ', you '+ sys.libRng(library.insultAdj) + ' ' + sys.libRng(library.insultNoun) +'!!');
		
	} else {
		util.smartReply(message, sys.libRng(library.hello) + ', you ' + sys.libRng(library.insultAdj) + ' ' + sys.libRng(library.insultNoun) +'!!');
	}
}

var setupInstance = new setup();
setupInstance.setGenericListeners(controller,util.getUser,util.smartReply, library);

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
	for (var i in inventory) 
		if (inventory[i].name == name)
			return inventory[i].guid;
	
	return null;
}



var checkCraftInventory = function (inventory, ingredients) {
	var mats = Object.keys(ingredients);
	for (var i in mats)
		if (invt.getInventoryItemCount(inventory, mats[i]) < ingredients[mats[i]])
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
	user = util.getUser(message.user);
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

	util.saveStorage();
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
	invt.transferInventory(ground, user.inventory)
	sys.saveJSON('buildmap', buildmap);
	util.saveStorage();
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
	var user = util.getUser(message.user);	

	var msg = 'You check yourself and find:\r\n';
	msg += '*health* - ' +user.health+'\r\n';
	msg += '*hunger* - ' +user.hunger+'\r\n';
	msg += '*walk distance* - ' +user.walked+'\r\n';
	msg += '*'+sys.libRng(library.money)+'* - ' +user.money+'\r\n';
	msg += addToInvList(user.inventory);
	util.smartReply(message, msg);
});

controller.hears(['check inventory'], 'direct_message,direct_mention,mention', function(bot, message) {
	var user = util.getUser(message.user);	

	var msg = 'You check your inventory and find:\r\n';
	msg += addToInvList(user.inventory);
	util.smartReply(message, msg);
});
controller.hears(['check map'], 'direct_message,direct_mention,mention', function(bot, message) {
	var user = util.getUser(message.user);	
	var msg = util.printLocalMap(user, 5, true);
	util.smartReply(message, msg);
});

/*controller.hears(['check full map'], 'direct_message,direct_mention,mention', function(bot, message) {
	var user = util.getUser(message.user);	
	var msg = util.printLocalMap(user, 101);
	util.smartReply(message, msg);
});*/

var getCraftingPrintout = function (toShare, i) {
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
}

var craftingMenu = function(Title, type, toShare) {
	var msg = '*_' + Title + ':_*\r\n';
	for (var i in toShare)
		if (Crafts[toShare[i]].menu == type)
			msg += getCraftingPrintout(toShare, i);
	msg += '\r\n'
	return msg;
}

controller.hears(['check crafts(.*)'], 'direct_message,direct_mention,mention', function(bot, message) {
	var user = util.getUser(message.user);	
    var thing = message.match[1] ? grammar.parseAAn(message.match[1]) : null;
	var msg = 'From deep within your mind you bring forth the plans for ' + (thing ? thing : '') + ':\r\n';
	
	if (thing) {
		if (Crafts[thing]) {
			var toShare = thing;
		} else {
			msg = 'Sadly you don\'t know if you actually know how to put together a ' + thing;
		}
	} else {
		var toShare = Object.keys(Crafts);
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
	var user = util.getUser(message.user);
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
	
	/*if (user.hunger <= 0) {
		msg+= ' Oh no! You\'ve starved to death :rip:';
		dropStuff(user);
		util.createUser(user.id);;
		
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
		msg += util.printLocalMap(user, 5, false);
		
	util.smartReply(message, msg);
	util.saveStorage();
});

var getLibThing = function(item, thing) {	
	if (Crafts[item])
		return Crafts[item][thing]
	
	if (libParts[item])
		return libParts[item][thing]
	return 0;
}


controller.hears(['set home'],'direct_message,direct_mention,mention', function(bot, message) {
	var user = util.getUser(message.user);
	user.home = {
		x: user.x,
		y: user.y
	}
	util.smartReply(message,'You feel a growing sense of warmth as you find home');
	util.saveStorage();
});

controller.hears(['find (.*)'], 'direct_message,direct_mention,mention', function(bot, message) {
    var person = grammar.parseAAn(message.match[1]);
	var msg = '';
	var user = util.getUser(message.user);
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
	var user = util.getUser(message.user);
	if (invt.getInventoryItemCount(user.inventory, item) > 0) {
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
		util.saveStorage();
	} else
		util.smartReply(message, 'Oh no! You seem to have misplaced your ' + item + '!' );
});


controller.hears(['drop (.*)'], 'direct_message,direct_mention,mention', function(bot, message) {
    var item = grammar.parseAAn(message.match[1]);
	var user = util.getUser(message.user);
	var count = getCount(item);
	
	if (count >= 1 && invt.getInventoryItemCount(user.inventory, item) > 0) {
		util.smartReply(message, 'You accidentally drop '+ (count > 1 ? (count +' of your ' + grammar.singularToPlural(item)):('your ' + item )) + ', but thankfully nobody noticed');
		var guid = getItemGuidFromName(user.inventory, item);
		invt.transferItem(getBuildMap(user).ground, user.inventory, {name: item, guid: guid, count:count});
		if (user.equiped.guid && user.equiped.guid == guid) {
			user.equiped = {
				weapon: 'fist',
				damage: 1,
				reusable: true
			}
		}
		util.saveStorage();
		sys.saveJSON('buildmap', buildmap);
	} else
		util.smartReply(message, 'Oh no! You seem to have misplaced your ' + item + '!' );
});

controller.hears(['smash (.*)'], 'direct_message,direct_mention,mention', function(bot, message) {
    var item = grammar.parseAAn(message.match[1]);
	var user = util.getUser(message.user);
	var myMap = getBuildMap(user);
	
	if (user.equiped.procType == 'hammer') {
		if(myMap.building.name == item) {
			util.smartReply(message, 'You bring your '+ user.equiped.weapon +' thundering down upon the unsuspecting ' + item + ', smashing it to pieces' );
			buildmap[getCords(user.y,user.x, height,width)].building = {};
			sys.saveJSON('buildmap', buildmap);
			
			if (removeItemDurability(user.inventory,{name:user.equiped.weapon}, sys.rng(4,5)) <= 0) {
			
				util.smartReply(message, 'Oh no! Your ' + user.equiped.weapon + ' was detroyed in the process');	
				invt.removeFromInventory(user.inventory,{name:user.equiped.weapon, guid:user.equiped.guid, procType: "removed"});
				user.equiped = {
					weapon: 'fist',
					damage: 1,
					reusable: true
				}
			}
			
			util.saveStorage();
		} else {
			util.smartReply(message, 'You swing your mighty hammer at the ground in a show manly rage' );	
		}
	} else
		util.smartReply(message, 'You smash your head against the '+item+' until you realize a hammer might be helpful' );
});


controller.hears(['fight (.*)','attack (.*)'], 'direct_message,direct_mention,mention', function(bot, message) {
    var otherUserName = grammar.parseAAn(message.match[1]);
	var otherUser = util.getUserByName(otherUserName);
	var user = util.getUser(message.user);
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
					otherUser = util.createUser(otherUser.id, true);
				}
				if (!user.equiped.reusable) {
					invt.removeFromInventory(user.inventory, {name:user.equiped.weapon, count:1});
					
					if (invt.getInventoryItemCount(user.inventory, user.equiped.weapon) <= 0) {
						util.smartReply(message, 'Oh no! Youve run out of your last ' + user.equiped.weapon + '!!');
						user.equiped ={
							weapon: 'fist',
							damage: 1,
							reusable: true
						};
					}
				}

			}
			util.saveStorage();
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
	var user = util.getUser(message.user);
	var toCraft = grammar.parseAAn(message.match[1]);
	var craftItem =  Crafts[toCraft];
	// Check not in river
	if (checkTile(user) == 3) {
		util.smartReply(message, 'You find it hard to craft anything in the middle of a river');
		return 1;
	}
	
	// Check recipie
	if (!craftItem) {
		util.smartReply(message, 'You decide that it probably isn\'t even worth the effort to craft a '+ toCraft + ' and give up');
		return 1;
	}
	
	// Check space free
	var mybuilding = buildmap[getCords(user.y,user.x, height,width)].building;
	if (mybuilding.name && craftItem.size && craftItem.size > 0) {
		util.smartReply(message, 'It might be a bit crowded here with the '+ mybuilding.name +' and all');	
		return 1;
	}

	// Check materials
	var materials = Object.keys(craftItem.recipe.ingredients);
	var matNeeded = checkCraftInventory(user.inventory, craftItem.recipe.ingredients, toCraft)
	if (matNeeded) {
		util.smartReply(message, 'You seem not to have enough ' + grammar.singularToPlural(matNeeded) + ' for a '+ toCraft);
		return 1;
	} 
	
	// Check processors
	if (!(!craftItem.procReq || (user.equiped.procLevel >= craftItem.procReq.level && user.equiped.procType == lCrafts[toCraft].procReq.type ) || checkBuildMapProc(user.x,user.y,craftItem.procReq.type,craftItem.procReq.level))) {
		util.smartReply(message, 'You seem not to have all the processors to make '+ craftItem.recipe.output + ' ' + toCraft);	
		return 1;
	}
	

	// Add building
	if (craftItem.size > 0) {
		 buildmap[getCords(user.y,user.x, height,width)].building = {
			name: toCraft,
			type: craftItem.type,
			procType: craftItem.procType
		};
		sys.saveJSON('buildmap', buildmap);
		
	// Add to crafting que
	} else if (craftItem.recipe.time > 1) {
		if (!buildmap[getCords(user.y,user.x, height,width)].building.procType.inUse) {
			var newCraft = {
				x: user.x + width,
				y: user.y + height,
				message: message,
				item: {
					name: toCraft,
					count: craftItem.recipe.output,
				},
				countdown: craftItem.recipe.time * 60
			}
			if (craftItem.procType)
				newCraft.procType = craftItem.procType;
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
		invt.addToInventory(user.inventory, {name: toCraft, guid: uuid.v4(), count: craftItem.recipe.output, procType: craftItem.procType});
	}
	
	// Remove equiped processor durability
	if (craftItem.procReq && (user.equiped.procLevel >= craftItem.procReq.level && user.equiped.procType == craftItem.procReq.type )) {
		useEquipedItem(user, sys.rng(2,3))
	} 
	
	// Remove materials from inventory
	for (var i in materials) 
		invt.removeFromInventory(user.inventory, {name:materials[i], count:craftItem.recipe.ingredients[materials[i]]});
	
	
	// Reply
	if (craftItem.recipe.time > 1)
		util.smartReply(message, 'Hurray! You\'ve started processing ' + craftItem.recipe.output + ' '+ toCraft+'. It will be ready in '+ craftItem.recipe.time +' minutes');
	else
		util.smartReply(message, 'Hurray! You\'ve sucessfully crafted ' + craftItem.recipe.output + ' '+ toCraft);
	
	util.saveStorage();
});

controller.hears(['\\bsearch\\b','\\bforage\\b', '\\btake\\b'], 'direct_message,direct_mention,mention', function(bot, message) {

	var user = util.getUser(message.user);
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
		invt.transferInventory(user.inventory, myground);
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
	
	util.saveStorage();
});

var useEquipedItem  = function(user,damage) {
	var msg;
	if (user.equiped.reusable == false) {
		invt.removeFromInventory(user.inventory, {name: user.equiped.weapon, count:1});
		if (invt.getInventoryItemCount(user.inventory, user.equiped.weapon) <= 0) {
			msg = 'Oh no! Youve run out of your last ' + user.equiped.weapon + '!!';
			user.equiped ={
				weapon: 'fist',
				damage: 1,
				reusable: true
			};
		}
	} else if (removeItemDurability(user.inventory, {name: user.equiped.weapon}, damage) <=0) {
		util.smartReply(message, 'Oh no! Your ' + user.equiped.weapon + ' was detroyed in the process');
		invt.removeFromInventory(user.inventory,{name:user.equiped.weapon, guid:user.equiped.guid, procType: "removed"});
		user.equiped = {
			weapon: 'fist',
			damage: 1,
			reusable: true
		}
	}
	return msg
}

var checkEquipProc = function(user, type) {
	return Crafts[user.equiped.weapon] && Crafts[user.equiped.weapon].procType && Crafts[user.equiped.weapon].procType.type == type;
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
		if (invt.getInventoryItemCount(usr.inventory, toEat)) {
			if (!lib[toEat].heal && !lib[toEat].hunger)
				return false;
			invt.removeFromInventory(usr.inventory, {name: toEat, count: cnt});
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
				usr = util.createUser(usr.id, true);
				
			}
			
			util.saveStorage();
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
	var user = util.getUser(message.user);
	var building = getBuildMap(user).building;

	if (building && building.name) {
		building.title = title;
		util.smartReply(message, 'Upon further contemplation, you discover your '+building.name+' is actually called ' + building.title);
	}
});

controller.hears(['\\beat (.*)', '\\beat my (.*)'], 'direct_message,direct_mention,mention', function(bot, message) {
    var food = grammar.parseAAn(message.match[1]);
	var user = util.getUser(message.user);
	var otherUser = util.getUserByName(food);
	var count = getCount(food);

	if (otherUser) {
		otherUser.health += 5;
		user.health += 5;
		util.smartReply(message, 'You eat '+food+' and find yourself at '+user.health+' health. It tastes like fish.');
		
		util.saveStorage();
	} else {
		if (eatItem(user, message, food, count, Crafts)) {
			return 1;
		} else {
			util.smartReply(message, 'You find yourself unable to eat any more '+food+'.');
		}
	}
});

controller.hears(['call me (.*)'], 'direct_message,direct_mention,mention', function(bot, message) {
    var name = message.match[1];
	user = util.getUser(message.user);
	
	user.name = name;
	util.smartReply(message, 'Got it. I will call you ' + name + ' from now on.');
	util.saveStorage();

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
				invt.addToInventory(buildmap[craftQue[i].y+'-'+craftQue[i].x].ground, craftQue[i].item)
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