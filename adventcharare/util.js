module.exports = function(){
	var module = {}

	module.getGroundSuf = function(type, building) {
		if (building && building.name == 'path')
			return '_path';
		
		switch (type) {
			case '0':
				 return '_desert';

			case '1':
				return '_forest';
			
			case '2':
				return '_mountain';
				
			case '3':
				return '_river';
		}
	};
	module.getExtraEmoji = function(type) {
		switch(type) {
			case 'cabin':
				 return ':cabin_f:';

			case 'wood cook-pot':
				return ':meat_on_bone:';
			
			case 'mud pit':
				return ':hammer_and_wrench:';
				
			case 'mud furnace':
				return ':fire:';
				
			case 'path':
				return ':_path_1:';
		}
	};
	
	module.getGroundEmoji = function(type) {
		switch (type) {
			case '0':
				 return ':_desert_'+sys.rng(1,4)+':';

			case '1':
				return ':_forest_'+sys.rng(1,3)+':';
			
			case '2':
				return ':mountain:';
				
			case '3':
				return ':_river_'+sys.rng(1,3)+':';
				
			case '-':
				return ':unknown:';
		}
	};
	
	module.getUserEmoji = function(slackname) {
		switch (slackname) {
			case 'lilwayne':
				return "";
				
			case 'dragon':
				return '_dragon';
		
			case 'intrepid_leporid':
				return '_obi';
		}
		return "";
	};

	

	
	module.smartReply = function(message, string) {
		var user = new User(message.user);
		
		if (!user.inactive)
			bot.reply(message, string);
	};
	
	module.getUserByName = function (name) {
		for (var i in storage) {
			var user = storage[i];	
			if (user && ((user.slackname && user.slackname.toLowerCase() == name.toLowerCase()) || (user.name && user.name.toLowerCase() == name.toLowerCase())))
				return user;
			
		}
		return null;	
	};

    module.countup = function(arr, item, val) {
		val = val ? val : 1;
		arr[item] = arr[item] ? arr[item] + val: val;
	};

	return module;
}