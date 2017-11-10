module.exports = function(){
	var module = {}

	module.main = function(craftQue) {
		for (i in craftQue) {
			if (craftQue[i].countdown > 0) {
				if (craftQue[i].countdown % 30 == 0)
					console.log('processing '+craftQue[i].item.name + '-'+ craftQue[i].countdown +' (' + craftQue[i].y+'-'+craftQue[i].x+')')
				craftQue[i].countdown--;
				if (craftQue[i].countdown <= 0) {
					var mybuild = map.buildAt({y:craftQue[i].y,x:craftQue[i].x});
					console.log(craftQue[i].item.name + ' finished crafting');
					util.smartReply(craftQue[i].message, 'Hurray! Your '+ craftQue[i].item.name +' is done');
					invt.addToInventory(mybuild.ground, craftQue[i].item)
					if (craftQue[i] && mybuild.building && craftQue[i].durability) {
						mybuild.building.procType.inUse = false;
						mybuild.building.procType.durability += craftQue[i].durability;
						if (mybuild.building.procType.durability <= 0) {
							util.smartReply(craftQue[i].message, 'Oh no! Your ' + mybuild.building.name + ' was detroyed');	
							mybuild.building = {};
						}
					}
					
					sys.saveJSON('buildmap', map.build);
					craftQue.splice(i, 1);
				}
				sys.saveJSON('craftQue',craftQue);
			}
		}
	};
	return module;
}