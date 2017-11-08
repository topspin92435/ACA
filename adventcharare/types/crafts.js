module.exports = function(){
	var module = {};
	
	module["mud pit"] = new Item(
		{
		 "damage": 0, 
		 "heal": 0,
		 "reusable": false,
		 "type": "static",
		 "size": 1,
		 "menu": "processor"
		},{
			"type": "pit",
			"level": 1,
			"durability": 1,
			"quality": 100
		},{
			"time": 1,
			"output": 1,
			"ingredients": {"mud": 6}
		}
	);

	module["mud furnace"] = new Item(
		{
		 "damage": 0, 
		 "heal": 0,
		 "reusable": false,
		 "type": "static",
		 "size": 1,
		 "menu": "processor"
		},{
			"type": "furnace",
			"level": 1,
			"durability": 200,
			"quality": 100
		},{
			"time": 1,
			"output": 1,
			"ingredients": {"rock": 15, "mud": 20}
		}
	);
	
	module["mud-brick furnace"] = new Item(
		{
		 "damage": 0, 
		 "heal": 0,
		 "reusable": false,
		 "type": "static",
		 "size": 1,
		 "menu": "processor"
		},{
			"type": "furnace",
			"level": 2,
			"durability": 500,
			"quality": 100
		},{
			"time": 1,
			"output": 1,
			"ingredients": {"rock": 25, "bricks": 30}
		}
	);
	
	module["wood cook-pot"] = new Item(
		{
		 "damage": 0, 
		 "heal": 0,
		 "reusable": false,
		 "type": "static",
		 "size": 1,
		 "menu": "processor"
		},{
			"type": "cook",
			"level": 1,
			"durability": 40,
			"quality": 100
		},{
			"time": 1,
			"output": 1,
			"ingredients": {"wood": 5}
		},
		{
			"type": "chisel",
			"level": 1
		}
	);
	
	module["charcoal"] = new Item(
		{
		 "damage": 5, 
		 "heal": -60,
		 "reusable": false,
		 "type": "item",
		 "size": 0,
		 "menu": "ingredients"
		},null,{
			"time": 2,
			"output": 10,
			"ingredients": {"wood": 6,"mud": 10}
		},
		{
			"type": "pit",
			"level": 1
		}
	);
	
	module["brick"] = new Item(
		{
		 "damage": 8, 
		 "heal": -120,
		 "reusable": false,
		 "type": "item",
		 "size": 0,
		 "menu": "ingredients"
		},null,{
			"time": 3,
			"output": 1,
			"ingredients": {"sticks": 2,"mud": 3}
		},
		{
			"type": "furnace",
			"level": 1
		}
	);
	
	module["iron bar"] = new Item(
		{
		 "damage": 10, 
		 "heal": -150,
		 "reusable": false,
		 "type": "item",
		 "size": 0,
		 "menu": "ingredients"
		},null,{
			"time": 83,
			"output": 1,
			"ingredients": {"iron ore": 3,"charcoal": 3}
		},
		{
			"type": "furnace",
			"level": 1
		}
	);
	
	module["stone shovel"] = new Item(
		{
		 "damage": 3, 
		 "heal": -200,
		 "reusable": true,
		 "type": "item",
		 "size": 0,
		 "menu": "tool"
		},{
			"type": "shovel",
			"level": 1,
			"durability": 40,
			"quality": 100
		},{
			"time": 1,
			"output": 1,
			"ingredients": {"stick": 3,"rock": 5}
		}
	);
	
	module["stone axe"] = new Item(
		{
		 "damage": 5, 
		 "heal": -200,
		 "reusable": true,
		 "type": "item",
		 "size": 0,
		 "menu": "tool"
		},{
			"type": "axe",
			"level": 1,
			"durability": 40,
			"quality": 100
		},{
			"time": 1,
			"output": 1,
			"ingredients": {"stick": 3,"rock": 7}
		}
	);
	
	module["stone pickaxe"] = new Item(
		{
		 "damage": 4, 
		 "heal": -200,
		 "reusable": true,
		 "type": "item",
		 "size": 0,
		 "menu": "tool"
		},{
			"type": "pickaxe",
			"level": 1,
			"durability": 40,
			"quality": 100
		},{
			"time": 1,
			"output": 1,
			"ingredients": {"stick": 4,"rock": 8}
		}
	);
	
	module["iron shovel"] = new Item(
		{
		 "damage": 7, 
		 "heal": -300,
		 "reusable": true,
		 "type": "item",
		 "size": 0,
		 "menu": "tool"
		},{
			"type": "shovel",
			"level": 2,
			"durability": 150,
			"quality": 100
		},{
			"time": 1,
			"output": 1,
			"ingredients": {"wood": 4,"iron bar": 3}
		}
	);
	
	module["iron axe"] = new Item(
		{
		 "damage": 14,
		 "heal": -300,
		 "reusable": true,
		 "type": "item",
		 "size": 0,
		 "menu": "tool"
		},{
			"type": "axe",
			"level": 2,
			"durability": 150,
			"quality": 100
		},{
			"time": 1,
			"output": 1,
			"ingredients": {"wood": 4,"iron bar": 4}
		}
	);
		
	module["iron pickaxe"] = new Item(
		{
		 "damage": 10, 
		 "heal": -300,
		 "reusable": true,
		 "type": "item",
		 "size": 0,
		 "menu": "tool"
		},{
			"type": "pickaxe",
			"level": 2,
			"durability": 150,
			"quality": 100
		},{
			"time": 1,
			"output": 1,
			"ingredients": {"wood": 4,"iron bar": 5}
		}
	);
			
	module["iron hammer"] = new Item(
		{
		 "damage": 12, 
		 "heal": -300,
		 "reusable": true,
		 "type": "item",
		 "size": 0,
		 "menu": "tool"
		},{
			"type": "hammer",
			"level": 1,
			"durability": 150,
			"quality": 100
		},{
			"time": 1,
			"output": 1,
			"ingredients": {"wood": 4,"iron bar": 5}
		}
	);
	
	module["iron sword"] = new Item(
		{
		 "damage": 20, 
		 "heal": -500,
		 "reusable": true,
		 "type": "item",
		 "size": 0,
		 "menu": "tool"
		},null,{
			"time": 1,
			"output": 1,
			"ingredients": {"wood": 2,"iron bar": 5}
		}
	);
	
	module["wood chisel"] = new Item(
		{
		 "damage": 2, 
		 "heal": -30,
		 "reusable": true,
		 "type": "item",
		 "size": 0,
		 "menu": "tool"
		},{
			"type": "chisel",
			"level": 1,
			"durability": 40,
			"quality": 100
		},{
			"time": 1,
			"output": 1,
			"ingredients": {"wood": 3,"rock": 3}
		}
	);
	
	module["iron chisel"] = new Item(
		{
		 "damage": 4, 
		 "heal": -120,
		 "reusable": true,
		 "type": "item",
		 "size": 0,
		 "menu": "tool"
		},{
			"type": "chisel",
			"level": 2,
			"durability": 150,
			"quality": 100
		},{
			"time": 1,
			"output": 1,
			"ingredients": {"wood": 3,"iron bar": 3}
		}
	);
	
	module["cooked apple"] = new Item(
		{
		 "damage": 2, 
		 "heal": 25,
		 "reusable": false,
		 "type": "item",
		 "size": 0,
		 "menu": "food"
		},null,{
			"time": 5,
			"output": 1,
			"ingredients": {"apple": 1}
		}
	);
	
	module["cooked apple"] = new Item(
		{
		 "damage": 1, 
		 "heal": 40,
		 "reusable": false,
		 "type": "item",
		 "size": 0,
		 "menu": "food"
		},null,{
			"time": 10,
			"output": 2,
			"ingredients": {"tuber": 3}
		}
	);
		
	module["cabin"] = new Item(
		{
		 "damage": 0, 
		 "heal": 0,
		 "reusable": false,
		 "type": "building",
		 "size": 1,
		 "menu": "building"
		},null,{
			"time": 1,
			"output": 1,
			"ingredients": {"wood": 50,"iron bar": 20}
		},{
			"type": "chisel",
			"level": 2
		},
	);
	
	module["path"] = new Item(
		{
		 "damage": 0, 
		 "heal": 0,
		 "reusable": false,
		 "type": "building",
		 "size": 1,
		 "menu": "building"
		},null,{
			"time": 1,
			"output": 1,
			"ingredients": {"wood": 10,"rock": 10}
		}
	);
	
	module["stick"] = new Item(
		{
		 "damage": 7, 
		 "heal": -15,
		 "reusable": false,
		 "type": "item",
		 "size": 0,
		}
	);
	
	module["rock"] = new Item(
		{
		 "damage": 12, 
		 "heal": -25,
		 "reusable": false,
		 "type": "item",
		 "size": 0,
		}
	);
	
	module["apple"] = new Item(
		{
		 "damage": 3, 
		 "heal": 15,
		 "reusable": false,
		 "type": "item",
		 "size": 0,
		}
	);
		
	module["tuber"] = new Item(
		{
		 "damage": 2, 
		 "heal": 8,
		 "reusable": false,
		 "type": "item",
		 "size": 0,
		}
	);
	
	module["tuber soup"] = new Item(
		{
		 "damage": 2, 
		 "heal": 40,
		 "reusable": false,
		 "type": "item",
		 "size": 0,
		},null,{
			"time": 5,
			"output": 1,
			"ingredients": {"tuber": 5}
		},
		{
			"type": "cookpot",
			"level": 1
		}
	);
	return module;
}
