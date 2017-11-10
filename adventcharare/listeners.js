module.exports = function() {
	this.setGenericListeners = function(controller) {
		
		controller.hears(grammar.parseStringArrayExclusive(library.hello), 'direct_message,direct_mention,mention', function(bot, message) {
			var user = new User(message.user);

			if (user && user.name) {
				if (user.name === 'dragon')
					util.smartReply(message, 'Dragons are ' + sys.libRng(library.dragon) +'!!');
				
				else if (user.name === 'maybe' || user.name === 'Maybe')
					util.smartReply(message, 'https://www.youtube.com/watch?v=fWNaR-rxAic');
					
				else
					util.smartReply(message, sys.libRng(library.hello) + ' ' + user.name + ', you '+ sys.libRng(library.insultAdj) + ' ' + sys.libRng(library.insultNoun) +'!!');
				
			} else {
				util.smartReply(message, sys.libRng(library.hello) + ', you ' + sys.libRng(library.insultAdj) + ' ' + sys.libRng(library.insultNoun) +'!!');
			}
		});
		controller.hears(['\\im hungry', '\\im (.*) hungry', '\\i\'m (.*) hungry', '\\i am (.*) hungry', '\\is there food', '\\i want food'], 'ambient,direct_message,direct_mention,mention', function(bot, message) {
			util.smartReply(message, 'here have some food');
		});
		
		controller.hears(['\\bapologize to (.*)'], 'direct_message,direct_mention,mention', function(bot, message) {
			var person = grammar.parseAAn(message.match[1]);
			util.smartReply(message, 'im sorry ' + person);
		});
		
		controller.hears(['\\bfind me (.*)'], 'ambient,direct_message,direct_mention,mention', function(bot, message) {
			var thing = grammar.parseAAn(message.match[1]);
			if (grammar.checkPlural(thing))
				util.smartReply(message, 'sorry i can\'t find any ' + (grammar.parseAAn(thing)) + ' for you D:');
			else
				util.smartReply(message, 'sorry i can\'t find any ' + grammar.singularToPlural(thing) + ' for you D:');
		});

		controller.hears(['\\bshame'], 'ambient,direct_message,direct_mention,mention', function(bot, message) {
			util.smartReply(message, 'shame :bellhop_bell:');
		});
		
		controller.hears(['\\bheyo'], 'ambient,direct_message,direct_mention,mention', function(bot, message) {
			util.smartReply(message, 'http://www.hiyoooo.com/');
		});

		controller.hears(['\\binsult (.*)'], 'direct_message,direct_mention,mention', function(bot, message) {
			var person = grammar.parseAAn(message.match[1]);
			
			if(person == 'someone' ) {
				var randId = Object.keys(storage)[sys.rng(0, Object.keys(storage).length-1)];
				var slackname = storage[randId] ? storage[randId].slackname : "my boy";

				util.smartReply(message, slackname + ' is a ' + sys.libRng(library.insultAdj) + ' ' + sys.libRng(library.insultNoun) + '!');
			} else {
				util.smartReply(message, person + (grammar.checkPlural(person) ? ' are ' : ' is a ') + sys.libRng(library.insultAdj) + ' ' + (grammar.checkPlural(person) ? grammar.singularToPlural(sys.libRng(library.insultNoun)) : sys.libRng(library.insultNoun) ) + '!');
			}

		});
		
		function formatUptime(uptime) {
			var unit = 'second';
			if (uptime > 60) {
				uptime = uptime / 60;
				unit = 'minute';
			}
			if (uptime > 60) {
				uptime = uptime / 60;
				unit = 'hour';
			}
			if (uptime != 1) {
				unit = unit + 's';
			}

			uptime = uptime + ' ' + unit;
			return uptime;
		}

		controller.hears(['shutdown aca'], 'ambient,direct_message,direct_mention,mention', function(bot, message) {
			process.exit(); 
		});

		
	};
}