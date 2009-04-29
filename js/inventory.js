// inventory.js
//
// Copyright (C) 2009 David J. Goehrig
// All Rights Reserved
//

var Definitions = {};

let('Source', Widget, {
	icon: Image.init('ns.png'),
	init: function(n) {
		var s = Source.clone();
		s.draw = function() {
			if (! this.visible) return;
			Screen.as(this).draw(this.icon);
			Screen.to(-this.label.length*8+24,this.h).print(this.label);
		};
		s.label = n;
		s.onMouse('down');
		return s;
	},
	down: function(e) {
		if (this.hit(e)) 
			Storage.fetch(this.label);
	},
});

let('Inventory',{
	icons: [],
	load: function() {
		Inventory.icons.every(function(v,i) { v.release(); });
		Inventory.icons = [];
		get(document.location.href.path() + 'objects/' + Channel.channel + '/', function(txt) {
			var o = txt.unjson();	
			var b = Box.init().at(16050,16050).by(48,48);
			var wc = Math.floor((Display.w-100) / 200);
			o.every(function(v,i) {
				Inventory.icons.push(Source.init(v).as(b));
				b.to((i+1) % wc ? 200 : -1000, (i+1) % wc ? 0 : 100);
			});
		});
	},	

});
