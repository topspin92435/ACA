module.exports = Map;

function Map(terrainMapName, buildMapName) {
	this.readTerrain = function(filename) {
		var data = sys.loadText(filename);
		data = data.split('\r\n');
		
		var dims = data[0].split('-');
		this.width = parseInt(dims[0]);
		this.height = parseInt(dims[1]);
		var map = new Array(this.height);
		for (var y = 0; y < this.height; y++) {
			map[y] =  new Array(this.width);
			for (var x = 0; x < this.width; x++)
				map[y][x] =  data[y+1].charAt(x);
		}
		//console.log(map.toString());
		this.width = (this.width - 1)/2;
		this.height = (this.height - 1)/2;
		return map;
	};
	this.terrain = this.readTerrain(terrainMapName);
	this.build = sys.loadJSON(buildMapName);
}

Map.prototype.getCords = function (cord) {
	return (cord.y + this.height) + '-' + (cord.x + this.width);
}

Map.prototype.buildAt = function(cord) {
	return this.build[this.getCords(cord)];
}
Map.prototype.terrainAt = function(cord) {
	return this.terrain[cord.y + this.height][cord.x + this.width];
}


Map.prototype.checkBounds = function(direction, cord) {
	if (sys.libCheck(library.north, direction)) {
		return cord.y < this.height;
	} else if (sys.libCheck(library.south, direction) ) {
		return cord.y > -this.height;
	} else if (sys.libCheck(library.east, direction) ) {
		return cord.x < this.width;
	} else if (sys.libCheck(library.west, direction) ) {
		return cord.x > -this.width;
	}
	return true;
}

Map.prototype.dropAt = function(user) {
	var ground = this.buildAt(user).ground;
	invt.transferInventory(ground, user.inventory)
	sys.saveJSON('buildmap', this.build);
	util.saveStorage();
}

Map.prototype.checkBuildMapProc = function(cord,process,level) {
	var building = this.buildAt(cord).building;

	if (building.procType)
		 return building.procType.type == process && building.procType.level >= level;
	return false;
}

Map.prototype.checkValAt = function(cord, type) {
	return this.arr[cord.y + this.height][cord.x + this.width] == type;
}

Map.prototype.valAt = function(cord) {
	return this.arr[cord.y + this.height][cord.x + this.width];
}

Map.prototype.updateUserMap = function(user, size) {
	for (var y = size * 2 ; y >= 0; y--) {
		var yval = (user.y+this.height+y-size);
		if (yval < 0 || yval > 100)
			break;
		for (var x = 0; x < size * 2 + 1; x++) {
			var xval = (user.x+this.width+x-size);
			if (xval < 0 || xval > 100)
				break;
			var ground = this.build[yval+'-'+xval];
			if (!ground.users)
				ground.users = [];
			if (ground.users.indexOf(user.id) < 0)
				ground.users.push(user.id);
		}
	}
	sys.saveJSON('buildmap', this.build);
};

Map.prototype.printLocalMap = function(user, size, buffer) {
	var mapStr = '';
	if (buffer) {
		mapStr += 'You pull our your map and see:';
	}
	mapStr += '\r\n';
	for (var y = size * 2 ; y >= 0; y--) {
		var yval = (user.y+this.height+y-size);
		if (yval < 0 || yval > 100)
			break;
		
		for (var x = 0; x < size * 2 + 1; x++) {
			var xval = (user.x+this.width+x-size);
			if (xval < 0 || xval > 100)
				break;
			
			var map = this.build[yval + '-' + xval]
			if (map.users && map.users.indexOf(user.id) > -1) {
				var building = this.build[yval + '-' + (xval)].building;
				var goundtype = this.terrain[yval][xval]
				if (y-size == 0 && x-size == 0)
					mapStr+= ':_face' + util.getGroundSuf(goundtype, building) + util.getUserEmoji(user.slackname)+':';
				
				else if(building.name) 
					mapStr+= util.getExtraEmoji(building.name);
				
				else
					mapStr += util.getGroundEmoji(this.terrain[yval][xval]);
			} else
				mapStr += ':unknown:';
				
		}
		if((user.y+this.height-size+y) >= 0 && (user.y+this.height-size+y) < 101)
			mapStr += '\r\n'
	}
	return mapStr;
};

Map.prototype.descriptionAt = function(loc) {
	var msg;
	switch (this.terrainAt(loc)) {
		case '0':
			msg = 'a barren desert.'
			break;
			
		case '1':
			msg = 'a sparse gathering of trees.'
			break;
		
		case '2':
			msg = 'a rolling mountain.'
			break;
			
			
		case '3':
			msg = 'a raging river.'
			break;
		
	}
	
	return msg;
};

