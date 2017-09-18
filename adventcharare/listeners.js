module.exports = function() {
	this.setGenericListeners = function(controller,createUser,smartReply,library) {


/*		
		controller.hears(['shucks'], 'ambient,direct_message,direct_mention,mention', function(bot, message) {
			createUser(message.user);
			smartReply(message, 'shucks howdy!');
		});
		controller.hears(['haha'], 'ambient,direct_message,direct_mention,mention', function(bot, message) {
			createUser(message.user);
			smartReply(message, 'ja');
		});*/
		/*controller.hears(['lol'], 'ambient,direct_message,direct_mention,mention', function(bot, message) {
			smartReply(message, 'lololol');
		});
		controller.hears(['lul'], 'ambient,direct_message,direct_mention,mention', function(bot, message) {
			createUser(message.user);
			smartReply(message, 'lulz');
		});
		controller.hears(['oh dear'], 'ambient,direct_message,direct_mention,mention', function(bot, message) {
			createUser(message.user);
			smartReply(message, 'oh moose');
		});

		controller.hears(['aww(.*)'], 'ambient,direct_message,direct_mention,mention', function(bot, message) {
			createUser(message.user);
			smartReply(message, 'awwwwwwwwwwwwwwwwwww');
		});
		controller.hears(['im sorry (.*)'], 'ambient,direct_message,direct_mention,mention', function(bot, message) {
			createUser(message.user);
			smartReply(message, 'im sorry too');
		});
		controller.hears(['Nice', 'nice'], 'ambient,,direct_mention,mention', function(bot, message) {
			createUser(message.user);
			smartReply(message, 'Niiiiiice!');
		});
		controller.hears(['(help)'], 'ambient,,direct_mention,mention', function(bot, message) {
			createUser(message.user);
			
			smartReply(message, 'No help for the weak');
		});
		controller.hears(['\\bim (.*)',"\\bi'm (.*)", '\\bi am (.*)'], 'ambient,direct_message,direct_mention,mention', function(bot, message) {
			var user = createUser(message.user);

			var person = message.match[1];
			person = grammar.parseAAn(person);

			if (user.name == 'dad')
				smartReply(message, 'hi dad');

			else if (person == 'dad' || person == 'Dad')
				smartReply(message, 'no _im_ dad');

			else if (!person.match(/\w*ing\b/) && person.length < 20)
				smartReply(message, 'Hello ' + person + ', im dad');
		});
		controller.hears(['uptime', 'identify yourself', 'who are you', 'what is your name'], 'ambient,direct_message,direct_mention,mention', function(bot, message) {

			var hostname = os.hostname();
			var uptime = formatUptime(process.uptime());

			util.smartReply(message,
				':robot_face: I am a bot named <@' + bot.identity.name +
				 '>. I have been running for ' + uptime + ' on ' + hostname + '.');

		});
		controller.hears(['(I want)(.*)'], 'ambient,direct_message,direct_mention,mention', function(bot, message) {
			createUser(message.user);
			smartReply(message, 'I dont care what you want');
		});
		*/
		
		controller.hears(['\\im hungry', '\\im (.*) hungry', '\\i\'m (.*) hungry', '\\i am (.*) hungry', '\\is there food', '\\i want food'], 'ambient,direct_message,direct_mention,mention', function(bot, message) {
			createUser(message.user);
			smartReply(message, 'here have some food');
		});
		
		controller.hears(['\\bapologize to (.*)'], 'direct_message,direct_mention,mention', function(bot, message) {
			var person = grammar.parseAAn(message.match[1]);
			smartReply(message, 'im sorry ' + person);
		});
		
		controller.hears(['\\bfind me (.*)'], 'ambient,direct_message,direct_mention,mention', function(bot, message) {
			createUser(message.user);
			var thing = grammar.parseAAn(message.match[1]);
			if (grammar.checkPlural(thing))
				smartReply(message, 'sorry i can\'t find any ' + (grammar.parseAAn(thing)) + ' for you D:');
			else
				smartReply(message, 'sorry i can\'t find any ' + grammar.singularToPlural(thing) + ' for you D:');
		});

		controller.hears(['\\bshame'], 'ambient,direct_message,direct_mention,mention', function(bot, message) {
			createUser(message.user);
			smartReply(message, 'shame (ding)');
		});
		
		controller.hears(['\\bheyo'], 'ambient,direct_message,direct_mention,mention', function(bot, message) {
			smartReply(message, 'http://www.hiyoooo.com/');
		});

		controller.hears(['\\binsult (.*)'], 'direct_message,direct_mention,mention', function(bot, message) {
			var person = grammar.parseAAn(message.match[1]);

			user = util.createUser(message.user);
			if(person == 'someone' ) {
				var randId = Object.keys(storage)[sys.rng(0, Object.keys(storage).length-1)];
				var slackname = storage[randId] ? storage[randId].slackname : "my boy";

				smartReply(message, slackname + ' is a ' + sys.libRng(library.insultAdj) + ' ' + sys.libRng(library.insultNoun) + '!');
			} else {
				smartReply(message, person + (grammar.checkPlural(person) ? ' are ' : ' is a ') + sys.libRng(library.insultAdj) + ' ' + (grammar.checkPlural(person) ? grammar.singularToPlural(sys.libRng(library.insultNoun)) : sys.libRng(library.insultNoun) ) + '!');
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