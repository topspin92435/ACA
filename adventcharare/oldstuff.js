// old functions


controller.hears(['check (.*)'], 'ambient,direct_message,direct_mention,mention', function(bot, message) {
	var word = message.match[1];
	
	
	if (adj[word] || _.invert(adj)[word])
		util.smartReply(message, 'adj - ' + (adj[word] ? adj[word] : word ));
	else if (adv[word] || _.invert(adv)[word])
		util.smartReply(message, 'adv - ' + (adv[word] ? adv[word] : word ));
	else if (noun[word] || _.invert(noun)[word])
		util.smartReply(message, 'noun - ' + (noun[word] ? noun[word] : word ));
	else if (verb[word] || _.invert(verb)[word])
		util.smartReply(message, 'verb - ' + (verb[word] ? verb[word] : word));
	else
		util.smartReply(message, word + ' aint no thang');
});

controller.hears(['\\bdig\\b'], 'ambient,direct_message,direct_mention,mention', function(bot, message) {
	var user = util.createUser(message.user);
	var tile = checkTile(user);
	var msg = '';
	var finalmsg;
	var toFindCount = {};
	hunger = sys.rng(4,6);
	
	var mud = sys.rng(1,100) * (tile == 3 ? 4 : 1);
	var tuber = sys.rng(1,100) * (tile == 1 ? 4 : 1);
	var rock = sys.rng(1,100) * (tile == 2 ? 2 : 1);
	var iron = sys.rng(1,100) * (tile == 2 ? 3 : 1)
	
	if (checkEquipProc(user, 'shovel')) {
		hunger -= (user.equiped.procLevel * 2);
		if ( hunger < 0 )
			hunger = 0;
		mud *= 2;
		tuber *= 2;
		finalmsg = useEquipedItem(user, sys.rng(2,3));
	} else if (checkEquipProc(user, 'pickaxe')) {
		if ( hunger < 0 )
			hunger = 0;
		rock += (10 * user.equiped.procLevel);
		iron += (15 * user.equiped.procLevel);
		finalmsg = useEquipedItem(user, sys.rng(2,3));
	}
	
	mud = Math.floor(mud/80);
	rock = Math.floor(rock/50);
	tuber = Math.floor(tuber/50);
	iron = Math.floor(iron/70);
	
	if (mud > 0)
		toFindCount['mud'] =  mud;
	if (rock > 0)
		toFindCount['rock'] =  rock;
	if (tuber > 0)
		toFindCount['tuber'] =  tuber;
	if (iron > 0)
		toFindCount['iron ore'] =  iron;
	
	
	toFind = Object.keys(toFindCount);
	
	if (mud + rock + tuber + iron > 0) {
		var found = 0;
		var addMsg = '';
		for (var i in toFind) {
			found ++;
			addMsg += toFindCount[toFind[i]] + ' ' + (toFindCount[toFind[i]] > 1 ? grammar.singularToPlural(toFind[i]) : toFind[i]) + ', ';
			addToInventory(user.inventory, {name: toFind[i], count: toFindCount[toFind[i]]});
		}
		
		
		if (found >= 1 ) {
			var msg = 'You break the ground with all the migth behind your trusty ' + user.equiped.weapon + ' and find ' + addMsg;
			msg = msg.substr(0,msg.length - 2);
			if (found > 1)
				msg = msg.replace(/,(?=[^,]*$)/, ' and');
		}
		
		msg += ' but lose ';
	
	} else {
		msg += 'You pound your ' + user.equiped.weapon + ' uselessly at the ground and lose ';
	}
	user.hunger -= hunger;
	user.hunger = user.hunger > 0 ? user.hunger : 0;
	msg += hunger + ' points of hunger. You find you have ' + user.hunger + ' points left';
	util.smartReply(message, msg);
	
	if (user.hunger <= 0) {
		msg = 'Oh no! You\'ve starved to death :rip:';
		dropStuff(user);
		util.resetUser(user.id);
		util.smartReply(message, msg);
		console.log(user.slackname + ' dies ('+user.x+':'+user.y+')');
		
	} else if (finalmsg) {
		util.smartReply(message, finalmsg);
	}
	console.log(user.slackname + ' digs ('+user.x+':'+user.y+')')
	util.saveUser(message.user, storage[message.user]);
});




controller.hears(['\\bchop\\b','\\bchop trees\\b'], 'ambient,direct_message,direct_mention,mention', function(bot, message) {
	var user = util.createUser(message.user);
	var tile = checkTile(user);
	var msg = '';
	var finalmsg;
	var toFindCount = {};
	hunger = sys.rng(8,10);
	
	var wood = sys.rng(50,100) * (tile == 1 ?  2: 1);
	
	if (checkEquipProc(user, 'axe')) {
		wood *= 3;
		finalmsg = useEquipedItem(user, sys.rng(2,3));
	}
	
	wood = Math.floor(wood/90);
	
	if (wood > 0)
		toFindCount['wood'] =  wood;
	
	
	toFind = Object.keys(toFindCount);
	
	if (wood > 0) {
		var msg = 'You thrust greatly at the tree with your mighty ' + user.equiped.weapon + ' and find ' + wood + ' wood';
		msg += ' but lose ';
	
	} else {
		msg += 'You ' + user.equiped.weapon + ' uselessly at a stuborn tree and lose ';
	}
	user.hunger -= hunger;
	user.hunger = user.hunger > 0 ? user.hunger : 0;
	msg += hunger + ' points of hunger. You find you have ' + user.hunger + ' points left';
	addToInventory(user.inventory, {name:'wood', count: wood});
	util.smartReply(message, msg);
	
	
	console.log(user.slackname + ' chops ('+user.x+':'+user.y+')')
	
	if (user.hunger <= 0) {
		msg = 'Oh no! You\'ve starved to death :rip:';
		dropStuff(user);
		util.resetUser(user.id);
		util.smartReply(message, msg);
		console.log(user.slackname + ' dies ('+user.x+':'+user.y+')')
		
	} else if (finalmsg) {
		util.smartReply(message, finalmsg);
	}
	
	util.saveUser(message.user, storage[message.user]);
});