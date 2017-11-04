
module.exports = User;

function User(user) {
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
	
    util.saveStorage();
}