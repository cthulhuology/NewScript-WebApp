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
		v.post('store/' + Channel.channel + '/' + k + '/' + today());
		return v;
	},	
	load: function(k) {
		get('object/' +Channel.channel + '/' +  k, function(txt) { if (txt) return let(k,txt.unjson()); alert("Failed to load " + k); });
	},
	fetch: function(k,v) {
		get('object/' + Channel.channel + '/' + k , function(txt) { 
			if (!txt) return;
			Definitions[v] = txt.unjson(); 
			return (Definitions[v]._language == "Newscript") ? Newscript.load(v): 
				(Definitions[v]._language == "Javascript") ? Javascript.load(k):
				null;
		 });
	},
});
