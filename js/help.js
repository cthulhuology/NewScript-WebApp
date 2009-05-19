// help.js
//
// Copyright (C) 2009 David J. Goehrig
// All Rights Reserved
//

var Help = let(Widget,{
	txt: [],
	init: function() {
		this.get('/ns/help/', function(txt) {
			Help.txt = txt.split("\n");
		});
		return this.instance();
	},
	draw: function() {
		this.at(-15950,16050).by(Display.w-100,Display.h-100)
		Screen.as(this).color(0,0,0);
		Help.txt.every(function(x,i) {
			Screen.print(x);
			Screen.to(0,25);
		});

	},
});
