
module.exports = User;

function User(user) {
	if (storage[user])
		this.setUser(storage[user]);
	else
		this.createUser(user);
}

User.prototype.setUser =  function(user) {
	this.id = user.id;
	this.x = user.x;
	this.y = user.y;
	this.hunger = user.hunger;
	this.health = user.health;
	this.walked = user.walked;
	this.inventory = user.inventory;
	this.verbose = user.verbose;
	this.money = user.money;
	this.verbose = user.verbose;
	this.inactive = user.inactive;
	this.equiped = user.equiped;
}

User.prototype.createUser =  function(user) {
	this.id = user;
	this.x = sys.rng(0,100) - 50;
	this.y = sys.rng(0,100) - 50;
	this.hunger = 100;
	this.health = 100;
	this.walked = 0;
	this.inventory = [];
	this.verbose = true;
	this.money = 0;
	this.verbose = true;
	this.inactive = false;
	this.equiped = {
		weapon: 'fist',
		damage: 1,
		reusable: true
	};
	storage[user] = this;
    util.saveStorage();
}

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
}

User.prototype.eatItem = function(usr, toEat, cnt) {
	var otherUser = util.getUserByName(toEat);

	if (otherUser) {
		otherUser.health += 5;
		user.health += 5;
		util.saveStorage();
		return 'You eat '+food+' and find yourself at '+user.health+' health. It tastes like fish';
	}
	
	// Check recipie
	if (!Crafts[toEat])
		return 'You find you no longer really feel like eating any ' + grammar.singularToPlural(toEat);
	
	if (invt.getInventoryItemCount(usr.inventory, toEat) <= 0)
		return 'Oh no! You\'ve run out of '+ grammar.singularToPlural(toEat);
	
	var eating = Crafts[toEat];
	
	if (eating.heal == 0)
		return 'You don\'t quite know how you\'d go about eating ' + (cnt > 1 ? grammar.singularToPlural(toEat) : 'a '+toEat);
	
	invt.removeFromInventory(usr.inventory, {name: toEat, count: cnt});
	var toheal = 0;
	var msg = '';
	if (eating.heal)
		toheal = (eating.heal + sys.rng(1,6) )* cnt;
	
	usr.health += toheal;
	
	console.log(usr.slackname + ' eats ' + toEat + ' for '+toheal + ' at ('+usr.x+':'+usr.y+')')
	
	msg += 'You eat ' + cnt + ' ' + (cnt > 1 ? grammar.singularToPlural(toEat) : toEat) + ' and find yourself at ' + usr.health + ' health. It tastes like chicken.';
	
	if (usr.health <= 0)
		msg +='\r\nOh no! Youve killed yourself with your '+(cnt > 1 ? grammar.singularToPlural(toEat) : toEat)+'! You ba$@*&d!';
	
	util.saveStorage();
	return msg;
}