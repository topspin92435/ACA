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

	};
}