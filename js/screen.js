// newscript.js
//
// Copyright (C) 2009 David J. Goehrig
// All Rights Reserved
//
// NB: this doesn't work with IE but IE doesn't 
// support canvas so it doesn't matter!
//
// requires: fundamentals.js, image.js, box.js

let('Screen', Box, {
	images: {},
	widgets: [],
	ctx: null,
	delay: 40,
	timer: null,
	timers: [],
	rad: 5,
	fontImage: Image.init('/images/16ptBlack.png').by(20,20),
	colorizer: false,
	hack: navigator.userAgent.indexOf('Firefox') > 0,
	init: function(e) {
		this.ctx = Display.canvas.getContext('2d'); 
		this.timer = setTimeout("Screen.animate()",this.delay);
		return this;
	},
	// Override the at method to do display based placement
	at: function(x,y) {
		this.x = x + Display.x;
		this.y = y + Display.y;
		return this;
	},
	arc: function(r) {
		this.ctx.beginPath();
		this.ctx.arcTo(this.x,this.y,this.w+this.x,this.h+this.y,r);
		this.ctx.closePath();
		this.ctx.stroke();
		return this;
	},
	radius: function(r) {
		this.rad = r;
	},
	line: function() {
		this.ctx.beginPath();
		this.ctx.moveTo(this.x,this.y);
		this.ctx.lineTo(this.x+this.w,this.y+this.h);
		this.ctx.stroke();
	},
	frame: function() {
		this.ctx.beginPath();
		this.ctx.moveTo(this.x+this.rad, this.y);
		this.ctx.lineTo(this.x+this.w-this.rad, this.y);
		this.ctx.arcTo(this.x+this.w, this.y, this.x+this.w, this.y+this.rad, this.hack ? 0.1 : this.rad);
		this.ctx.lineTo(this.x+this.w, this.y+this.h-this.rad);
		this.ctx.arcTo(this.x+this.w, this.y+this.h, this.x+this.w-this.rad, this.y+this.h, this.rad);
		this.ctx.lineTo(this.x+this.rad, this.y+this.h);
		this.ctx.arcTo(this.x, this.y+this.h, this.x, this.y+this.h-this.rad, this.hack ? 0.1 :this.rad);
		this.ctx.lineTo(this.x, this.y+this.rad);
		this.ctx.arcTo(this.x, this.y, this.x+this.rad, this.y, this.rad);
		this.ctx.stroke();
		return this;
	},
	stroke: function () {
		this.ctx.stroke();
	},
	lineWidth: function(w) {
		this.ctx.lineWidth = w;
		return this;
	},
	font: function(f) {
		this.fontImage = Image.init(f);
		this.fontImage.by(20,20);	
		return this;
	},
	colorize: function(f) {
		this.colorizer = f;
		return this;
	},
	print: function(txt) {
		var o = 0;
		var xo = Screen.x;
		var a = typeof(txt) == "string" ? txt.split(/\s/) : txt;
		for (var j = 0; j < a.length; ++j) {
			if (a[j].length*16 + Screen.x > xo + Screen.w)
				this.to(xo - Screen.x,20);	
			if (typeof(this.colorizer) == "function")
				this.colorizer(a[j]);
			for (var i = 0; i < a[j].length; ++i) {
				if (typeof(a[j].charAt) != "function") continue;
				var c = Keyboard.font(a[j].charAt(i));
				this.draw(Screen.fontImage.at(20*(c%16),20*Math.floor(c/16))).to(16,0);
			}
			if (Screen.w - Screen.x + xo > 16) this.to(16,0);
		}
		return this;
	},
	size: function(txt,bx) { // Gives the size of the rect to contain the current string.
		var a = typeof(txt) == "string" ? txt.split(/\s/) : txt;
		var xo = bx.x; var yo = bx.y;
		for (var j = 0; j < a.length; ++j) {
			if (a[j].length*16 + bx.x > bx.w)
				bx.to(xo - bx.x, 20);
			bx.to(16 * a[j].length + 16,0);
		}
		var b =  Box.init().at(xo,yo).by(bx.x - xo, bx.y - yo);
		return b;
	},
	color: function(r,g,b) {
		this.ctx.strokeStyle = "rgb(" + r + "," + g + "," + b + ")";
		this.ctx.fillStyle =   "rgb(" + r + "," + g + "," + b + ")";
		return this;
	},
	red: function() { return this.color(255,0,0) },
	yellow: function() { return this.color(255,255,0) },
	green: function() { return this.color(0,255,0) },
	blue: function() { return this.color(0,0,255) },
	purple: function() { return this.color(255,0,255) },
	black: function() { return this.color(0,0,0) },
	gray: function() { return this.color(128,128,128) },
	white: function() { return this.color(255,255,255) },
	fill: function() {
		this.ctx.fillRect(this.x,this.y,this.w,this.h);
		return this;
	},
	rect: function() {
		this.ctx.strokeRect(this.x,this.y,this.w,this.h);
		return this;
	},
	alpha: function(a) {
		this.ctx.globalAlpha = a / 256;	
		return this;
	},
	clear: function() {
		this.ctx.clearRect(0,0,Display.w,Display.h);
		return this;
	},
	animate: function() {
		this.clear();
		var b = Box.init().at(-Display.x,-Display.y).by(Display.w,Display.h);
		this.widgets.every(function(w,i) {
			if (typeof(w.draw) == "function" && (w.sticky || b.hit(w)))
				w.draw();
		});
		this.timers.every(function(t,i) {
			if (typeof(t.timer) == "function" )
				t.timer();
		});
		this.timer = setTimeout("Screen.animate()",this.delay);
		return this;
	},
	draw: function(i) {
		try {
			this.ctx.drawImage(i.data,i.x,i.y,i.w,i.h,this.x,this.y,i.w,i.h);
		} catch(e) {}
		return this;
	},
	overlaps: function(w) {
		var retval = false;
		Screen.widgets.every(function(v,i) {
			if (v != Editor && w != v && w.hit(v)) 
				return retval = true;
		});
		return retval;
	},
	schedule: function(t) {
		if (typeof(t.timer) == "function")
			this.timers.push(t);
	},
});

