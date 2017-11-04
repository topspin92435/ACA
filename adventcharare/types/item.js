module.exports = Item;

function Item(basics,  proctype, recipe, procreq) {
    this.damage = basics.damage;
	this.heal = basics.heal;
	this.reusable = basics.reusable;
	this.type = basics.type;
	this.size = basics.size;
	this.menu = basics.menu;
	
	if (proctype)
		this.procType = new ProcType(proctype);
	
	if (recipe)
		this.recipe = new Recipe(recipe);
	
	if (procreq)
		this.procReq = new ProcReq(procreq);
}