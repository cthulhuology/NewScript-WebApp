// display.js
//
// Copyright (C) 2009 David J. Goehrig
// All Rights Reserved
//

let('Display',Box, {
	canvas: null,
	init: function() {
		Keyboard.init(document);
		Mouse.init($('screen'));
		this.canvas = $('screen');
		this.by(window.innerWidth, window.innerHeight);	
		this.canvas.setAttribute('width',this.w);
		this.canvas.setAttribute('height',this.h);
		this.at(0,0);
		return this;
	},
});
