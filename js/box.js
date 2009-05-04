// box.js
//
// Copyright (C) 2009 David J. Goehrig
// All Rights Reserved
//
// requires: fundamentals.js
//

var Box = let({
	x: 0, y: 0, w: 0, h: 0,
	init: function() { return this.clone() },
	hit: function(o) {
		var x = o.x ? o.x : 0;
		var y = o.y ? o.y : 0;
		var w = o.w ? o.w : 0;
		var h = o.h ? o.h : 0;
		return !( x+w < this.x ||
			x > (this.x + this.w) ||
			y+h < this.y ||
			y > this.y + this.h);
	},
	at: function(x,y) {
		this.x = x;
		this.y = y;
		return this;
	},
	to: function(x,y) {
		this.x += x;
		this.y += y;
		return this;
	},
	by: function(w,h) {
		this.w = w;
		this.h = h;
		return this;
	},
	scale: function(w,h) {
		this.w += w;
		this.h += h;
		return this;
	},
	as: function(b) {
		return this.at(b.x,b.y).by(b.w,b.h);
	},
	clamp: function(x,y,w,h) {
		this.x = Math.max(x,this.x);
		this.y = Math.max(y,this.y);
		this.x = Math.min(w - this.w,this.x);
		this.y = Math.min(h - this.h,this.y);
		return this;
	},
});

