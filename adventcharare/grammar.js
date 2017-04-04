module.exports = {
	parseAAn: function (str) {
		str = str.replace(/[.,\/#!$%\^&\*;:{}=\`~()]/g,"").trim();
		var temp;
		if (str.match(/^an\s/)) {
			temp = str.split("an ");
			str = temp[temp.length - 1];
		}
		if (str.match(/^a\s/)) {
			temp = str.split("a ");
			str = temp[temp.length - 1];
		} 
		if (str.match(/^the\s/)){
			temp = str.split("the ");
			str = temp[temp.length - 1];
		}
		return str;
	},
	checkPlural: function(str) {
		for (var i in plurals)
			if (plurals[i] == str)
				return true;
		if (plurals[str])
			return false;
		if (str.match(/\w*s\b/))
			return true;
		return false;
	},
	parseStringArray: function(arr) {
		var temp = [];
		for (var i in arr) {
			temp[i] = arr[i].toLowerCase();
		}
		return temp;
	},
	singularToPlural: function (str) {
		if (str) {
			str = str.trim();
			if(str.lastIndexOf(" ") >= 0)
				str = str.substring(str.lastIndexOf(" ")+1,str.length);
			if (plurals[str])
				return plurals[str];
			if (str.match(/\w*ch\b/) || str.match(/\w*sh\b/) || str.match(/\w*s\b/) || str.match(/\w*x\b/) || str.match(/\w*z\b/))
				return str + 'es';
			if (str.match(/\w*[b-df-hj-np-tv-z]y\b/))
				return str.substring(0,str.length - 1) + 'ies';
			if (str.match(/\w*fe\b/))
				return str.substring(0,str.length - 2) + 'ves';
			if (str.match(/\w*f\b/))
				return str.substring(0,str.length - 1) + 'ves';
			if (str.match(/\w*[b-df-hj-np-tv-z]o\b/))
				return str + 'es';
			return str + 's';
		}
		return '';
	}
}