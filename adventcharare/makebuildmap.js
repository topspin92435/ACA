var rng = function (min, max) {
	if (min.typeof === 'undefined') { min = 0 };
	if (max.typeof === 'undefined' || max < min ) {return -1}
	
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

var readMap = function(filename) {
		console.log("debug: Loading " + filename + "...");
	try { 
		data = require('fs').readFileSync('libFiles/' +filename +'.txt', 'ascii');
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
			console.log(map.toString());
			width = (width - 1)/2;
			height = (height - 1)/2;
			return map;
				
		}
	} catch (err) {
		console.log("ERROR: " + filename + " failed to load");
		process.exit(-1);
	}
}

var saveMap = function (map, name) {
	console.log("debug: Saving map...");
	var fs = require('fs');
	var stream = fs.createWriteStream('libFiles/'+name+".txt");
	stream.once('open', function(fd) {
		stream.write(JSON.stringify(map, null, '\t'));
		stream.end();
		console.log("debug: "+name+" saved...");
		
	});
}

var realmap = readMap('map3');

var getCords = function(x,y) {
	return y + '-' + x;
}

var map = {};

for (var j = 0; j < 101; j++) {	
	for (var i = 0; i < 101; i++) {
		
		var numSticks = Math.floor((rng(0, 3) - 1));
		numSticks = numSticks >= 0 ? numSticks : 0;
		if (realmap[j][i] == 1) 
			numSticks *= 2;
			
		var numRocks = Math.floor((rng(0, 4) - 1));
		numRocks = numRocks >= 0 ? numRocks : 0;
		if (realmap[j][i] == 2)
			numRocks *= 2;
		
		map[getCords(j,i)] = {
			building:{},
			ground: [
				{"name":"stick", "count":numSticks},
				{"name":"rock", "count":numRocks}
			]
		};
	
	}
}

console.log(map);

saveMap(map, 'buildmap');