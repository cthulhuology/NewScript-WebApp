// inventory.js
//
// Copyright (C) 2009 David J. Goehrig
// All Rights Reserved
//

var Definitions = {};
var Sources = {};

var Source = let(Button, {
	icon: function(v) {
		var s = this.init('/images/ns.png',v.title);
		s.id = v.id;
		return s;
	},
	down: function(e) {
		if (this.hit(e)) 
			Storage.fetch(this.id,this.label);
	},
});

var Inventory = let({
	icons: [],
	load: function() {
		Sources = {};
		Inventory.icons.every(function(v,i) { v.release(); });
		Inventory.icons = [];
		get('/ns/objects/' + Channel.channel, function(txt) {
			if (!txt) return;
			var o = txt.unjson();	
			var b = Box.init().at(16050,16050).by(48,48);
			var wc = Math.floor((Display.w-100) / 200);
			var j = 0;
			o.every(function(v,i) {
				if (Sources[v.title]) {
					return Sources[v.title].id = v.id;
				}
				var s = Source.icon(v).as(b);
				Inventory.icons.push(s);
				Sources[v.title] = s;
				b.to((j+1) % wc ? 200 : -800, (j+1) % wc ? 0 : 100);
				++j;
			});
		});
	},	

});
