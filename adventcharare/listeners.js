module.exports = function() {
	this.setGenericListeners = function(controller,createUser,smartReply) {

		controller.hears(['shucks'], 'ambient,direct_message,direct_mention,mention', function(bot, message) {
			createUser(message.user);
			smartReply(message, 'shucks howdy!');
		});

		controller.hears(['marshall is lame'], 'ambient,direct_message,direct_mention,mention', function(bot, message) {
			smartReply(message, 'false');
		});

		controller.hears(['hungry', 'is there food', 'i want food'], 'ambient,direct_message,direct_mention,mention', function(bot, message) {
			createUser(message.user);
			smartReply(message, 'here have some food');
		});
/*		controller.hears(['haha'], 'ambient,direct_message,direct_mention,mention', function(bot, message) {
			createUser(message.user);
			smartReply(message, 'ja');
		});*/
		/*controller.hears(['lol'], 'ambient,direct_message,direct_mention,mention', function(bot, message) {
			smartReply(message, 'lololol');
		});
		*/
		controller.hears(['lul'], 'ambient,direct_message,direct_mention,mention', function(bot, message) {
			createUser(message.user);
			smartReply(message, 'lulz');
		});
		controller.hears(['oh dear'], 'ambient,direct_message,direct_mention,mention', function(bot, message) {
			createUser(message.user);
			smartReply(message, 'oh moose');
		});

		controller.hears(['find me (.*)'], 'ambient,direct_message,direct_mention,mention', function(bot, message) {
			createUser(message.user);
			var thing = parseAAn(message.match[1]);
			if (checkPlural(thing))
				smartReply(message, 'sorry i can\'t find any ' + (parseAAn(thing)) + ' for you D:');
			else
				smartReply(message, 'sorry i can\'t find any ' + singularToPlural(thing) + ' for you D:');
		});
		controller.hears(['apologize to (.*)'], 'direct_message,direct_mention,mention', function(bot, message) {
			
			var person = parseAAn(message.match[1]);
			smartReply(message, 'im sorry ' + person);
		});
		controller.hears(['im sorry (.*)'], 'ambient,direct_message,direct_mention,mention', function(bot, message) {
			createUser(message.user);
			smartReply(message, 'im sorry too');
		});

		controller.hears(['aww(.*)'], 'ambient,direct_message,direct_mention,mention', function(bot, message) {
			createUser(message.user);
			smartReply(message, 'awwwwwwwwwwwwwwwwwww');
		});
		controller.hears(['shame'], 'ambient,direct_message,direct_mention,mention', function(bot, message) {
			createUser(message.user);
			smartReply(message, 'shame (ding)');
		});

		/*
		controller.hears(['(help)'], 'ambient,,direct_mention,mention', function(bot, message) {
			createUser(message.user);
			
			smartReply(message, 'No help for the weak');
		});*/

		controller.hears(['Nice', 'nice'], 'ambient,,direct_mention,mention', function(bot, message) {
			createUser(message.user);
			smartReply(message, 'Niiiiiice!');
		});

		controller.hears(['(I want)(.*)'], 'ambient,direct_message,direct_mention,mention', function(bot, message) {
			createUser(message.user);
			smartReply(message, 'I dont care what you want');
		});
		controller.hears(['heyo'], 'ambient,direct_message,direct_mention,mention', function(bot, message) {

			smartReply(message, 'http://www.hiyoooo.com/');
		});


		controller.hears(['may is lame'], 'ambient,direct_message,direct_mention,mention', function(bot, message) {
			smartReply(message, 'true');
		});
		
		controller.hears(['insult (.*)'], 'direct_message,direct_mention,mention', function(bot, message) {
			var person = grammar.parseAAn(message.match[1]);
			
			user = util.createUser(message.user);
			if(person == 'someone' ) {
				var randId = Object.keys(storage)[sys.rng(0, Object.keys(storage).length-1)];
				var slackname = storage[randId] ? storage[randId].slackname : "my boy";

				smartReply(message, slackname + ' is a ' + sys.libRng(library.insultAdj) + ' ' + sys.libRng(library.insultNoun) + '!');
			} else {
				person = grammar.parseAAn(person);
				person = grammar.checkPlural(person) ? person : grammar.singularToPlural(person);
				smartReply(message, person + ' are wankers!');
			}

		});
		
		
		controller.hears(['check money'], 'ambient,direct_message,direct_mention,mention', function(bot, message) {

			var user= util.createUser(message.user);

			util.smartReply(message, 'You got ' + user.money + ' '+sys.libRng(library.money)+'!');	
		});

		
		controller.hears(['give me (.*)'], 'ambient,direct_message,direct_mention,mention', function(bot, message) {
			util.smartReply(message, 'I aint got that kinda money');	
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
		controller.hears(['such (.*)'], 'ambient,direct_message,direct_mention,mention', function(bot, message) {
			smartReply(message, 'much wow');
		});
		controller.hears(['uptime', 'identify yourself', 'who are you', 'what is your name'],
			'ambient,direct_message,direct_mention,mention', function(bot, message) {

				var hostname = os.hostname();
				var uptime = formatUptime(process.uptime());

				util.smartReply(message,
					':robot_face: I am a bot named <@' + bot.identity.name +
					 '>. I have been running for ' + uptime + ' on ' + hostname + '.');

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
});	

		
	};
}