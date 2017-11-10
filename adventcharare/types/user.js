
module.exports = User;

function User(user) {
	if (storage[user])
		this.setUser(storage[user]);
	else
		this.createUser(user);
};

User.prototype.setUser =  function(user) {
	this.id = user.id;
	this.x = user.x;
	this.y = user.y;
	this.hunger = user.hunger;
	this.health = user.health;
	this.walked = user.walked;
	this.inventory = new Inventory(user.inventory.items);
	this.verbose = user.verbose;
	this.money = user.money;
	this.verbose = user.verbose;
	this.inactive = user.inactive;
	this.equiped = user.equiped;
};

User.prototype.createUser =  function(user) {
	this.id = user;
	this.x = sys.rng(0,100) - 50;
	this.y = sys.rng(0,100) - 50;
	this.hunger = 100;
	this.health = 100;
	this.walked = 0;
	this.inventory = new Inventory();
	this.verbose = true;
	this.money = 0;
	this.verbose = true;
	this.inactive = false;
	this.equipFist();
	storage[user] = this;
    this.save();
};

User.prototype.save = function () {
	storage[this.id] = this;
	sys.saveJSON('storage', storage);
};

User.prototype.move = function(direction) {
	var msg = '';
	if (direction && map.checkBounds(direction, this)) {
		if (sys.libCheck(library.north, direction)) {
			this.y++;
			this.walked++;
		} else if (sys.libCheck(library.south, direction)) {
			this.y--;
			this.walked++;
		} else if (sys.libCheck(library.east, direction)) {
			this.x++;
			this.walked++;
		} else if (sys.libCheck(library.west, direction)) {
			this.x--;
			this.walked++;
		} else {
			msg += ('Lost in confusion, you move nowhere. ');
		}
	} else if (direction) {
		msg = 'You bump against an invisible wall and grumble bitterly'
	}
	return '';
};

User.prototype.eatItem = function(toEat, cnt) {
	var otherUser = util.getUserByName(toEat);

	if (otherUser) {
		otherUser.health += 5;
		user.health += 5;
		otherUser.save();
		this.save();
		return 'You eat '+food+' and find yourself at '+user.health+' health. It tastes like fish';
	}
	
	// Check recipie
	if (!Crafts[toEat])
		return 'You find you no longer really feel like eating any ' + grammar.singularToPlural(toEat);
	
	if (this.getInventoryItemCount(this.inventory, toEat) <= 0)
		return 'Oh no! You\'ve run out of '+ grammar.singularToPlural(toEat);
	
	var eating = Crafts[toEat];
	
	if (eating.heal == 0)
		return 'You don\'t quite know how you\'d go about eating ' + (cnt > 1 ? grammar.singularToPlural(toEat) : 'a '+toEat);
	
	this.inventory.remove({name: toEat, count: cnt});
	var toheal = 0;
	var msg = '';
	if (eating.heal)
		toheal = (eating.heal + sys.rng(1,6) )* cnt;
	
	usr.health += toheal;
	
	console.log(usr.slackname + ' eats ' + toEat + ' for '+toheal + ' at ('+usr.x+':'+usr.y+')')
	
	msg += 'You eat ' + cnt + ' ' + (cnt > 1 ? grammar.singularToPlural(toEat) : toEat) + ' and find yourself at ' + usr.health + ' health. It tastes like chicken.';
	
	if (usr.health <= 0)
		msg +='\r\nOh no! Youve killed yourself with your '+(cnt > 1 ? grammar.singularToPlural(toEat) : toEat)+'! You ba$@*&d!';
	
	this.save();
	return msg;
};

User.prototype.updateSettings = function (command) {
	var msg;
	switch (command) {
		case 'silent':
			msg = 'A silence falls over the land as you fade away to sleep';
			this.inactive = true;
			break;
			
		case 'loud':
			user.inactive = false;
			msg = 'You wake up from your restless slumber';
			break;
			
		case 'verbose':
			user.verbose = true;
			msg = 'You decide to take life as it comes, and begin to see the beauty surrounding you.';
			break;
	
		case 'quick':
			user.verbose = false;
			msg = 'You move through life with blinders on, ignoring the mundane, but missing the beauty surrounding you';
			break;
			
	}
	this.save();
	return msg;
};

User.prototype.equipFist = function() {
	this.equiped = {
		weapon: 'fist',
		damage: 1,
		reusable: true
	}
};

User.prototype.checkProc = function(tocraft) {
	return this.equiped.procLevel >= tocraft.procReq.level && this.equiped.procType == tocraft.procReq.type
};

User.prototype.useEquipedItem  = function(durability) {
	var msg;
	if (this.equiped.reusable == false) {
		this.inventory.remove({name: this.equiped.weapon, count:1});
		if (this.getInventoryItemCount(this.inventory, this.equiped.weapon) <= 0) {
			msg = 'Oh no! You\'ve run out of your last ' + this.equiped.weapon;
			this.equipFist();
		}
	} else if (removeItemDurability( {name: this.equiped.weapon}, durability) <=0) {
		msg='Oh no! Your ' + this.equiped.weapon + ' was detroyed in the process';
		this.inventory.remove({name:this.equiped.weapon, guid: this.equiped.guid, procType: "removed"});
		this.equipFist();
	}
	return msg
};

User.prototype.useEquipedItem  = function(damage) {
	var msg;
	if (this.equiped.reusable == false) {
		this.inventory.remove({name: this.equiped.weapon, count:1});
		if (this.inventory.getItemCount(this.equiped.weapon) <= 0) {
			msg = 'Oh no! You\'ve run out of your last ' + this.equiped.weapon;
			this.equipFist();
		}
	} else if (this.inventory.removeItemDurability({name: this.equiped.weapon}, damage) <=0) {
		msg='Oh no! Your ' + this.equiped.weapon + ' was detroyed in the process';
		this.inventory.remove({name:this.equiped.weapon, guid:this.equiped.guid, procType: "removed"});
		this.equipFist();
	}
	return msg
}

User.prototype.findUser = function(otherUser) {
	
	
}

User.prototype.findHome = function() {
	

}
