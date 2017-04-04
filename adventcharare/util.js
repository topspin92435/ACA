module.exports = {
	readMap: function(filename) {
		width = 0;
		height = 0;
		console.log("debug: Loading " + filename + "...");
		try { 
			data = require('fs').readFileSync('./libFiles/' + filename +'.txt', 'ascii');
			if (data.length == 0) {
				console.log("ERROR: " + filename + " had no data...");
				return {};
			} else {
				console.log("debug: " + filename + " loaded...");
				data = data.split('\r\n');
				var dims = data[0].split('-');
				width = parseInt(dims[0]);
				height = parseInt(dims[1]);
				var map = new Array(height);
				for (var y = 0; y < height; y++) {
					map[y] =  new Array(width);
					for (var x = 0; x < width; x++)
						map[y][x] =  data[y+1].charAt(x);
				}
				//console.log(map.toString());
				width = (width - 1)/2;
				height = (height - 1)/2;
				return map;
					
			}
		} catch (err) {
			console.log("ERROR: " + filename + " failed to load");
			if (controller.debug)
				console.log(err.toString());
			process.exit(-1);
		}
	},
	printLocalMap: function(user, size) {
		var mapStr = '';
		if (!usermap[user.id])
			return "you don\'t have a map yet";
		mapStr += '```';
		//mapStr += ' ' + _.repeat('^ ', size * 2) + '^ \r\n';
		for (var y = size * 2 ; y >= 0; y--) {
			if((user.y+height-size+y) >= 0 && (user.y+height-size+y) < 101)
				mapStr += '|';
			for (var x = 0; x < size * 2 + 1; x++) {
				
				if((user.y+height-size+y) >= 0 && (user.y+height-size+y) < 101 && (user.x+width-size+x) >= 0 && (user.x+width-size+x) < 101) {
					var building = buildmap[(user.y + height - size + y) + '-' + (user.x + width - size + x)].building;
					if (building.name && usermap[user.id][user.y+height+y-size][user.x+width+x-size] != '-') {
						if (building.name == 'cabin') {
							mapStr+= 'H'  + (size < 90 ? ' ': '');
						} else if (building.name =="wood cook-pot") {
							mapStr+= 'C'  + (size < 90 ? ' ': '');
						} else if (building.name == 'mud pit') {
							mapStr+= 'P'  + (size < 90 ? ' ': '');
						} else if (building.name == 'mud furnace') {
							mapStr+= 'F'  + (size < 90 ? ' ': '');
						}
					} else if ((user.y + height + y - size) == (user.y + height) && (user.x+width+x-size) == (user.x + height))
						mapStr+= 'X' + (size < 90 ? ' ': '');
					else if (user.home  && (user.y + height + y - size) == (user.home.y + height) && (user.x+width+x-size) == (user.home.x + height)) {
						mapStr+= 'H'  + (size < 90 ? ' ': '');
					} else
						mapStr += usermap[user.id][user.y+height+y-size][user.x+width+x-size] + (size < 90 ? ' ': '');
					
				}
			}
			if((user.y+height-size+y) >= 0 && (user.y+height-size+y) < 101)
				mapStr += '|\r\n'
		}
		//mapStr += ' v ' + _.repeat('v ', size * 2) + '\r\n';
		mapStr += '```';
		return mapStr;
	},
	saveUser: function (userId, user) {
		storage[userId] = user;
		var fs = require('fs');
		var stream = fs.createWriteStream("libFiles/storage.txt");
		stream.once('open', function(fd) {
			
			var str = JSON.stringify(storage, null, '\t');
			stream.write(str);
			stream.end();
			
		});
	}, 
	smartReply: function(message, string) {
		if (!storage[message.user])
			storage[message.user] = {};
		storage[message.user].money += sys.rng(2,3);
		if (!storage[message.user].inactive)
			bot.reply(message, string);
		util.saveUser(message.user, storage[message.user]);
	},
	getUserByName: function (name) {
		for (var i in storage) {
			var user = storage[i];	
			if (user && ((user.slackname && user.slackname.toLowerCase() == name.toLowerCase()) || (user.name && user.name.toLowerCase() == name.toLowerCase())))
				return user;
			
		}
		return null;	
	},
	createUser: function(usr) {
		if (!storage[usr] ) {
			storage[usr] = {
				id: usr,
				money: 120,
				x: sys.rng(0,100) - 50,
				y: sys.rng(0,100) - 50,
				health: 100,
				health: 100,
				walked: 0,
				inventory: [],
				verbose: true,
				equiped: {
					weapon: 'fist',
					damage: 1,
					reusable: true
				}
			};
			bot.api.users.info({user:usr}, function(err, data) {
				storage[data.user.id].slackname = data.user.name;
				util.saveUser(usr, storage[usr])
			});
		}
		return storage[usr];
	},
	resetUser: function(usr) {
		storage[usr].equiped = {
			weapon: 'fist',
			damage: 1,
			reusable: true
		};
		storage[usr].x= sys.rng(0,100) - 50;
		storage[usr].y= sys.rng(0,100) - 50;
		storage[usr].money= 120
		storage[usr].health= 100;
		storage[usr].hunger= 100;
		util.saveUser(usr, storage[usr])
		return storage[usr];
	}

}