// image.js
//
// Copyright(C) 2009 David J. Goehrig
// All Rights Reserved
//
// requires: fundamentals.js, box.js
//

var Image = let(Box,{
	init: function(i) {
		var img = Image.clone();
		img.path = i;
		return img;
	},
	at: function(x,y) {
		this.x = x;
		this.y = y;
		return this.clamp(0,0,this.data.width,this.data.height);
	},	
	to: function(x,y) {
		this.x += x;
		this.y += y;
		return this.clamp(0,0,this.data.width,this.data.height);
	},
	by: function(w,h) {
		this.w = w;
		this.h = h;
		return this.clamp(0,0,this.data.width,this.data.height);
	},
});
