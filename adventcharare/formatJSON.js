
var Botkit = require('./lib/Botkit.js');
var controller = Botkit.slackbot({
    debug: false
});

var format = function (filename) {
	
	console.log("debug: Loading " + filename + "...");
	try { 
		data = require('fs').readFileSync(filename +'.txt', 'ascii');
		if (data.length == 0) {
			console.log("ERROR: " + filename + " had no data...");
			return {};
		} else {
			console.log("debug: " + filename + " loaded...");
			var items = JSON.parse(data);
			console.log(items);
			var fs2 = require('fs');
			var stream = fs2.createWriteStream(filename+".txt");
			stream.once('open', function(fd) {
				
				console.log(items);
				var str = JSON.stringify(items, null, '\t');
				stream.write(str);
				stream.end();
				
			});
			
		}
	} catch (err) {
		console.log("ERROR: " + filename + " failed to load");
		if (controller.debug)
			console.log(err.toString());
		process.exit(-1);
	}
	
}

/*
data = require('fs').readFileSync('libFiles/library.txt', 'ascii') 

	library = '';
try { 
	data = data.split("@")
	for (i in data) {
		if (data[i].length > 1) {
			var set = data[i].split(':');
			var tuples = set[1].replace(/\r\n/g,'').split(',')
			library += '"'+set[0]+'":[';
			for (j in tuples) {
				
				tuples[j] = tuples[j].trim();
				
				library += '"' + tuples[j].toString() +'",';
			}
		library += '],';
		}
	}
	
	console.log(library);
	var fs2 = require('fs');
	var stream = fs2.createWriteStream("libFiles/library.txt");
	stream.once('open', function(fd) {
		
		console.log(library);
		stream.write(library);
		stream.end();
		
	});

	console.log("debug: Library loaded...");

} catch (err) {
	console.log("ERROR: library failed to load");
		console.log(err.toString());
	process.exit(-1);
}

**/
format("libFiles/library");