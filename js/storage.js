// storage.js
//
// Copyright (C) 2009 David J. Goehrig
// All Rights Reserved
//

let('Storage',{
	local: null,
	session: null,
	init: function() {
	},
	store: function(k,v) {
		v.post(document.location.href.path() + 'store/' + Channel.channel + '/' + k + '/' + today());
		return v;
	},	
	load: function(k) {
		get(document.location.href.path() + 'public/' + Channel.channel + '/' + k + '.json', function(txt) { if (txt) return let(k,txt.unjson()); alert("Failed to load " + k); });
	},
	fetch: function(k) {
		get(document.location.href.path() + 'public/' + Channel.channel + '/' + k + '.json', function(txt) { 
			if (!txt) return;
			Definitions[k] = txt.unjson(); 
			return (Definitions[k]._language == "Newscript") ? Newscript.load(k): 
				(Definitions[k]._language == "Javascript") ? Javascript.load(k):
				null;
		 });
	},
});
