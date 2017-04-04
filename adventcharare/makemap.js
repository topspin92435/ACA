var fs = require('fs');

var rng = function (min, max) {
	if (min.typeof === 'undefined') { min = 0 };
	if (max.typeof === 'undefined' || max < min ) {return -1}
	
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

var checkBound = function(x,y) {
	if (x >= 0 && y >= 0 && x < width && y < height)
		return true;
	return false;
}

fillGrid = function(x, y, a, b, type) {
	for (var j = y - b; j < y + 1 + b; j++) {
		
		for (var i = x - a; i < x + a + 1; i++) {
			if (checkBound(i,j))
				mapArr[j][i] = type;
		}
	}
}


var checkAdj = function(x,y,type) {
	var count = 0;
	if (checkBound(x-1,y) && (mapArr[y][x-1] == type))
		count ++;
	
	if (checkBound(x+1,y-1)  && (mapArr[y][x+1] == type))
		count ++;
	
	if (checkBound(x,y-1)  && (mapArr[y-1][x] == type))
		count ++;
	
	if (checkBound(x,y+1)  && (mapArr[y+1][x] == type))
		count ++;
	
	if (checkBound(x-1,y-1)  && (mapArr[y-1][x-1] == type))
		count ++;
	
	if (checkBound(x+1,y-1)  && (mapArr[y-1][x+1] == type))
		count ++;
	
	if (checkBound(x+1,y+1)  && (mapArr[y+1][x+1] == type))
		count ++;
	
	if (checkBound(x-1,y+1)  && (mapArr[y+1][x-1] == type))
		count ++;
	
	return count;
}



populateMountain = function (x,y) {
	if ((x == (width-1)/2) && (y == (height-1)/2))
		return 'C';
	var mount = 80;
	
	if (num > mount)
		result = '2';
	else
		result = mapArr[y][x];
	return result;
}



makeMountain = function(x,y) {
	if ((x == (width-1)/2) && (y == (height-1)/2))
		return 'C';
	var num = rng(0,1000);
		console.log(num);
	if (num > 998) {
		fillGrid(x,y,3,3,'2');
		fillGrid(x,y,4,0,'2');
		fillGrid(x,y,0,4,'2');
	}
}


fillTreasure = function(x,y) {
	if ((x == (width-1)/2) && (y == (height-1)/2))
		return 'C';
	var num = rng(0,100);
	var result;
	if (num > 92)
		result = 'T';
	else
		result = mapArr[y][x];
	return result;
}

var saveMap = function (map, name) {
		console.log("debug: Saving map...");
	var fs = require('fs');
	var stream = fs.createWriteStream(name+".txt");
	stream.once('open', function(fd) {
		stream.write(map);
		stream.end();
		console.log("debug: "+name+" saved...");
		
	});
}


var mapRNG = function (x,y,type,chance) {
	if ((x == (width-1)/2) && (y == (height-1)/2))
		return 'C';
	
	var num = rng(0,1000);
	if (num > chance)
		result = type;
	else
		result = mapArr[y][x] ? mapArr[y][x] : '0';
	return result;
}

var mapADJ = function (x,y,type,chance) {
	if ((x == (width-1)/2) && (y == (height-1)/2))
		return 'C';
	
	var num = rng(0,1000);
	var adj = checkAdj(x,y,type);
	chance -= adj * 90;
	
	if (num > chance && adj > 1)
		result = type;
	else if (adj == 0) {
		result = '0';
	} else
		result = mapArr[y][x] ? mapArr[y][x] : '0';
	
	return result;
	
}



console.log("debug: Building map...");
width = 101;
height = 101;


map = (width+'-'+height+'\r\n');
buildmap = (width+'-'+height+'\r\n');
mapArr = new Array(height);
buildMapArr = new Array(height);
for (var y = 0; y < height; y++) {
	mapArr[y] = new Array(width);
	buildMapArr[y] = new Array(width);
	for (var x = 0; x < width; x++) {
		buildMapArr[y][x] = '0';
		mapArr[y][x] = mapRNG(x,y,'1',975); 
	}
}

for (var y = 0; y < height; y++) {
	for (var x = 0; x < width; x++) {
		mapArr[y][x] = mapADJ(x,y,'1',500); 
	}
}
for (var y = 0; y < height; y++) {
	for (var x = 0; x < width; x++) {
		mapArr[y][x] = mapADJ(x,y,'1',600); 
	}
}
for (var y = 0; y < height; y++) {
	for (var x = 0; x < width; x++) {
		mapArr[y][x] = mapADJ(x,y,'1',800); 
	}
}

for (var y = 0; y < height; y++) {
	for (var x = 0; x < width; x++) {
		makeMountain(x,y);
	}
}

/*for (var y = 0; y < height; y++) {
	for (var x = 0; x < width; x++) {
		mapArr[y][x] = fillTreasure(x,y);
	}
}*/

for (var y = 0; y < height; y++) {
	for (var x = 0; x < width; x++) {
		map += mapArr[y][x];
		buildmap += buildMapArr[y][x];
	}
	buildmap += '\r\n';
	map += '\r\n';
}


saveMap(buildmap, 'buildmap');
saveMap(map, 'map3');
//console.log(map.toString());

console.log("debug: Map built...");