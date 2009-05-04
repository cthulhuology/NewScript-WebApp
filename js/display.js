// display.js
//
// Copyright (C) 2009 David J. Goehrig
// All Rights Reserved
//

var Display = let(Box, {
	canvas: null,
	init: function() {
		Keyboard.init();
		Mouse.init();
		this.by(window.innerWidth, window.innerHeight);	
		this.at(0,0);
		return this;
	},
	to: function(x,y) {
		_root.currentTranslate.x += x;
		_root.currentTranslate.y += y;
	},
	at: function(x,y) {
		_root.currentTranslate.x = x;
		_root.currentTranslate.y = y;
	}
});
