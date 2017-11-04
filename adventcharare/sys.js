module.exports = function(root) {
	var module = {};
	
	module.rng = function (min, max) {
		if (min.typeof === 'undefined') { min = 0 };
		if (max.typeof === 'undefined' || max < min ) {return -1}

		return Math.floor(Math.random() * (max - min + 1)) + min;
	};

	module.libRng = function(arr) {
		if (arr.typeof === 'undefined' || arr.length == 0) { return "missing lib" }
		return arr[module.rng(0, arr.length - 1)];
	};

	module.libCheck = function(arr, str) {
		if (arr.typeof === 'undefined' || arr.length == 0) { return "missing lib" }
		
		for (var i in arr)
			if (arr[i] == str)
				return true
		
		return false
	};
	
	module.saveJSON = function(filename, object) {
		var fs = require('fs');
		var stream = fs.createWriteStream('./' + root + '/' + filename + ".txt");
		stream.once('open', function(fd) {
			stream.write(JSON.stringify(object, null, '\t'));
			stream.end();
			
		});
	};
	
	module.loadJSON = function (filename) {
		console.log("debug: Loading " + filename + "...");
		try { 
			var data = require('fs').readFileSync(root + '/' +filename +'.txt', 'ascii');
			if (data.length == 0) {
				console.log("ERROR: " + filename + " had no data...");
				return {};
			} else {
				console.log("debug: " + filename + " loaded...");
				return data.length > 0 ? JSON.parse(data): {};
			}
		} catch (err) {
			console.log("ERROR: " + filename + " failed to load");
				console.log(err);
			process.exit(-1);
		}
	};
	
	return module;
}