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
listeners = require("./listeners.js");
tick = require("./tick.js")();
grammar = require("./grammar.js");
util = require("./util.js")();
menus = require("./menus.js")();

Inventory = require("./types/inventory.js");
User = require('./types/user.js');
Recipe = require('./types/recipe.js');
ProcType = require('./types/proctype.js');
ProcReq = require('./types/procreq.js');
Item = require('./types/item.js');
Map = require('./types/map.js');
Crafts = require('./types/crafts.js')();

var controller = Botkit.slackbot({
    debug: false
});

bot = controller.spawn({
    token: tok.getTok()
}).startRTM();

noun = sys.loadJSON('noun');
verb = sys.loadJSON('verb');
adj = sys.loadJSON('adj');
adv = sys.loadJSON('adv');
ref = sys.loadJSON('ref');
storage= sys.loadJSON('storage');
plurals = sys.loadJSON('plurals');
library = sys.loadJSON('library');
map = new Map('map3', 'buildmap');

var craftQue = sys.loadJSON('craftQue');
var setup = new listeners();
setup.setGenericListeners(controller);

var getItemGuidFromName = function (inventory, name) {
	for (var i in inventory) 
		if (inventory[i].name == name)
			return inventory[i].guid;
	
	return null;
}

controller.hears(['settings (.*)'], 'direct_message,direct_mention,mention', function(bot, message) {
	var command = message.match[1];
	util.smartReply(message, new User(message.user).updateSettings(command));
});


controller.hears(['\\bhelp\\b'], 'direct_message,direct_mention,mention', function(bot, message) {
	util.smartReply(message, menus.checkHelp());
});

controller.hears(['check myself'], 'direct_message,direct_mention,mention', function(bot, message) {
	util.smartReply(message, menus.checkUser(new User(message.user)));
});

controller.hears(['check inventory'], 'direct_message,direct_mention,mention', function(bot, message) {
	util.smartReply(message, menus.checkInventory(new User(message.user)));
});

controller.hears(['check map'], 'direct_message,direct_mention,mention', function(bot, message) {
	util.smartReply(message, map.printLocalMap(new User(message.user), 5, true));
});

controller.hears(['check crafts(.*)'], 'direct_message,direct_mention,mention', function(bot, message) {
    var thing = message.match[1] ? grammar.parseAAn(message.match[1]) : null;
	util.smartReply(message, menus.checkCrafts(thing));
});

controller.hears(['\\blook\\b','\\bmove(.*)'], 'direct_message,direct_mention,mention', function(bot, message) {
	var direction = grammar.parseAAn(message.match[1]);
	var user = new User(message.user);
	var msg = user.move(direction);
	
	if (msg.length > 0)
		util.smartReply(message, msg);
	
	if (user.verbose) {
		var myMap = map.buildAt(user);
		msg = 'You look around and ';
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
			msg += "see " + map.descriptionAt(user);
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
	
	map.updateUserMap(user, 2);
	msg += map.printLocalMap(user, 5, false);
		
	util.smartReply(message, msg);
	user.save();
});

controller.hears(['set home'],'direct_message,direct_mention,mention', function(bot, message) {
	var user = new User(message.user);
	user.home = {
		x: user.x,
		y: user.y
	}
	util.smartReply(message,'You feel a growing sense of warmth as you find home');
	user.save();
});

controller.hears(['find (.*)'], 'direct_message,direct_mention,mention', function(bot, message) {
    var person = grammar.parseAAn(message.match[1]);
	var msg = '';
	var user = new User(message.user);
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
	var user = new User(message.user);
	if (user.inventory.getItemCount(item) > 0) {
		util.smartReply(message, 'You gracefully equip your ' + item + ' in preparation for battle!');
		user.equiped = {};
		user.equiped['weapon'] = item;
		user.equiped['damage'] = util.getLibThing(item, 'damage');
		user.equiped['reusable'] = util.getLibThing(item, 'reusable');
		user.equiped['guid'] = getItemGuidFromName(user.inventory, item);
		var proc = util.getLibThing(item, 'procType')
		if (proc) {
			user.equiped['procLevel'] = proc.level;
			user.equiped['procType'] = proc.type;
		}
		user.save();
	} else
		util.smartReply(message, 'Oh no! You seem to have misplaced your ' + item + '!' );
});


controller.hears(['drop (.*)'], 'direct_message,direct_mention,mention', function(bot, message) {
    var item = grammar.parseAAn(message.match[1]);
	var user = new User(message.user);
	var count = util.getCount(item);
	
	if (count >= 1 && user.inventory.getItemCount(item) > 0) {
		util.smartReply(message, 'You accidentally drop '+ (count > 1 ? (count +' of your ' + grammar.singularToPlural(item)):('your ' + item )) + ', but thankfully nobody noticed');
		var guid = getItemGuidFromName(user.inventory, item);
		user.inventory.transferItem(map.buildAt(user).ground, {name: item, guid: guid, count:count});
		if (user.equiped.guid && user.equiped.guid == guid) {
			user.equipFist();
		}
		user.save();
		sys.saveJSON('buildmap', map.build);
	} else
		util.smartReply(message, 'Oh no! You seem to have misplaced your ' + item + '!' );
});

controller.hears(['smash (.*)'], 'direct_message,direct_mention,mention', function(bot, message) {
    var item = grammar.parseAAn(message.match[1]);
	var user = new User(message.user);
	var myMap = map.buildAt(user);
	
	if (user.equiped.procType == 'hammer') {
		if(myMap.building.name == item) {
			util.smartReply(message, 'You bring your '+ user.equiped.weapon +' thundering down upon the unsuspecting ' + item + ', smashing it to pieces' );
			myMap.building = {};
			sys.saveJSON('buildmap', map.build);
			
			if (user.inventory.removeItemDurability({name:user.equiped.weapon}, sys.rng(4,5)) <= 0) {
			
				util.smartReply(message, 'Oh no! Your ' + user.equiped.weapon + ' was detroyed in the process');	
				user.inventory.remove({name:user.equiped.weapon, guid:user.equiped.guid, procType: "removed"});
				user.equipFist();
			}
			
			user.save();
		} else {
			util.smartReply(message, 'You swing your mighty hammer at the ground in a show manly rage' );	
		}
	} else
		util.smartReply(message, 'You smash your head against the '+item+' until you realize a hammer might be helpful' );
});


controller.hears(['fight (.*)','attack (.*)'], 'direct_message,direct_mention,mention', function(bot, message) {
    var otherUserName = grammar.parseAAn(message.match[1]);
	var otherUser = util.getUserByName(otherUserName);
	var user = new User(message.user);
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
					user.inventory.remove({name:user.equiped.weapon, count:1});
					
					if (user.inventory.getItemCount(user.equiped.weapon) <= 0) {
						util.smartReply(message, 'Oh no! Youve run out of your last ' + user.equiped.weapon + '!!');
						user.equipFist();
					}
				}

			}
			user.save();
		} else {
			util.smartReply(message, 'You attempt to throw your ' + user.equiped.weapon + ' at '+otherUserName+', but find you arent quite strong enough' );
		}
	} else
		util.smartReply(message, otherUserName + ' has run away like a '+ sys.libRng(library.insultAdj) +' coward!' );
});


controller.hears(['\\bcraft (.*)\\b'], 'direct_message,direct_mention,mention', function(bot, message) {
	var user = new User(message.user);
	var toCraft = grammar.parseAAn(message.match[1]);
	var craftItem =  Crafts[toCraft];
	// Check not in river
	if (map.checkValAt(user, 3) ){
		util.smartReply(message, 'You find it difficult to craft anything in the middle of a river');
		return 1;
	}
	
	// Check recipie
	if (!craftItem || !craftItem.recipe) {
		util.smartReply(message, 'You decide that it probably isn\'t even worth the effort to craft a '+ toCraft + ' and give up');
		return 1;
	}
	
	// Check space free
	var mybuilding = map.getBuild(user).building;
	if (mybuilding.name && craftItem.size && craftItem.size > 0) {
		util.smartReply(message, 'It might be a bit crowded here with the '+ mybuilding.name +' and all');	
		return 1;
	}

	// Check materials
	var materials = Object.keys(craftItem.recipe.ingredients);
	var matNeeded = user.inventory.checkCrafts(craftItem.recipe.ingredients, toCraft)
	if (matNeeded) {
		util.smartReply(message, 'You seem not to have enough ' + grammar.singularToPlural(matNeeded) + ' for a '+ toCraft);
		return 1;
	} 
	
	// Check processors
	if (craftItem.procReq && !user.checkProc(craftItem) && !map.checkBuildMapProc(user,craftItem.procReq.type,craftItem.procReq.level)) {
		util.smartReply(message, 'You seem not to have all the processors to make '+ craftItem.recipe.output + ' ' + toCraft);	
		return 1;
	}
	
	if (craftItem.recipe.time > 1 && craftItem.recipe.procType && mybuilding.procType.inUse) {
		util.smartReply(message, 'Your ' + mybuilding.building.name + ' seems to be otherwise occupied');
		return 1;
	}

	// Add building
	if (craftItem.size > 0) {
		 mybuilding.building = {
			name: toCraft,
			type: craftItem.type,
			procType: craftItem.procType
		};
		sys.saveJSON('buildmap', map.build);
		
	// Add to crafting que
	} else if (craftItem.recipe.time > 1) {
		var newCraft = {
			x: user.x + map.width,
			y: user.y + map.height,
			message: message,
			item: {
				name: toCraft,
				count: craftItem.recipe.output,
			},
			durability: craftItem.durability,
			procType: craftItem.procType,
			countdown: craftItem.recipe.time * 60
		}
		mybuilding.building.procType.durability -= sys.rng(2,3);
		mybuilding.building.procType.inUse = true;
		sys.saveJSON('buildmap', map.build);
		craftQue.push(newCraft);

	// Add to inventory
	} else
		user.inventory.addToInventory( {name: toCraft, guid: uuid.v4(), count: craftItem.recipe.output, procType: craftItem.procType});
	
	// Remove equiped processor durability
	if (craftItem.procReq && user.checkProc(craftItem))
		util.smartReply(message, user.useEquipedItem(user, sys.rng(2,3)));
	
	// Remove materials from inventory
	for (var i in materials) 
		user.inventory.remove({name:materials[i], count:craftItem.recipe.ingredients[materials[i]]});
	
	
	// Reply
	if (craftItem.recipe.time > 1)
		util.smartReply(message, 'Hurray! You\'ve started processing ' + craftItem.recipe.output + ' '+ toCraft+'. It will be ready in '+ craftItem.recipe.time +' minutes');
	else
		util.smartReply(message, 'Hurray! You\'ve sucessfully crafted ' + craftItem.recipe.output + ' '+ toCraft);
	
	user.save();
});

controller.hears(['\\bsearch\\b','\\bforage\\b', '\\btake\\b'], 'direct_message,direct_mention,mention', function(bot, message) {
	var user = new User(message.user);
	var ground = map.buildAt(user).ground;
	var found = 0;
	
	if (ground.length > 0) {
		var addMsg = '';
		for (var i in ground) {
			if (ground[i].guid || ground[i].count > 0) {
				found++;
				addMsg += ground[i].count + ' ' + (ground[i].count > 1 ? grammar.singularToPlural(ground[i].name) : ground[i].name) + ', ';
			}
		}
		user.inventory.transfer(ground);
		if (found >= 1 ) {
			var msg = 'You scour the ground and gather ' + addMsg;
			msg = msg.substr(0,msg.length - 2);
			if (found > 1)
				msg = msg.replace(/,(?=[^,]*$)/, ' and')
		}
	}
	
	util.smartReply(message, found > 0 ? msg : 'Due to your greedy nature, you have exhausted the resources at this location');
	
	if (found > 0)
		sys.saveJSON('buildmap', map.build);
	
	user.save();
});

controller.hears(['\\bname building (.*)'], 'direct_message,direct_mention,mention', function(bot, message) {
    var title = grammar.parseAAn(message.match[1]);
	var user = new User(message.user);
	var building = map.buildAt(user).building;

	if (building && building.name) {
		building.title = title;
		util.smartReply(message, 'Upon further contemplation, you discover your '+building.name+' is actually called ' + building.title);
	}
});

controller.hears(['\\beat (.*)', '\\beat my (.*)'], 'direct_message,direct_mention,mention', function(bot, message) {
    var food = grammar.parseAAn(message.match[1]);
	var count = util.getCount(food);
	var user = new User(message.user);

	util.smartReply(message, user.eatItem(food, count));
});

controller.hears(['call me (.*)'], 'direct_message,direct_mention,mention', function(bot, message) {
    var name = message.match[1];
	var user = new User(message.user);
	
	user.name = name;
	util.smartReply(message, 'Got it. I will call you ' + name + ' from now on.');
	user.save();

});

controller.tick = function() {
	tick.main(craftQue);
}