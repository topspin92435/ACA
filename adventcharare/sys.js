module.exports = {
	rng: function (min, max) {
		if (min.typeof === 'undefined') { min = 0 };
		if (max.typeof === 'undefined' || max < min ) {return -1}

		return Math.floor(Math.random() * (max - min + 1)) + min;
	},

	libRng: function(arr) {
		if (arr.typeof === 'undefined' || arr.length == 0) { return "missing lib" }
		return arr[sys.rng(0, arr.length - 1)];
	},

	libCheck: function(arr, str) {
		if (arr.typeof === 'undefined' || arr.length == 0) { return "missing lib" }
		
		for (var i in arr)
			if (arr[i] == str)
				return true
		
		return false
	},
	saveJson: function(filename, object) {
		var fs = require('fs');
		var stream = fs.createWriteStream('./' + root + '/' + filename + ".txt");
		stream.once('open', function(fd) {
			var str = JSON.stringify(object, null, '\t');
			stream.write(str);
			stream.end();
			
		});
	},
	loadJSON:function (filename) {
		console.log("debug: Loading " + filename + "...");
		try { 
			data = require('fs').readFileSync(root + '/' +filename +'.txt', 'ascii');
			if (data.length == 0) {
				console.log("ERROR: " + filename + " had no data...");
				return {};
			} else {
				console.log("debug: " + filename + " loaded...");
				return data.length > 0 ? JSON.parse(data): {};
			}
		} catch (err) {
			console.log("ERROR: " + filename + " failed to load");
				console.log(err.toString());
			process.exit(-1);
		}
	}
}