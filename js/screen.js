// svg.js
//
// Copyright (C) 2009 David J. Goehrig
// All Rights Reserved
//

var Screen = let({
	x: 0,
	y: 0,
	w: 0,
	h: 0,
	rad: 10,
	delay: 40,
	timer: null,
	timers: [],
	widgets: [],
	size: '16px',
	family: 'Arial',
	colorizer: false,
	fg: "none",
	bg: "none",
	fontstyle: "normal",
	lw: 1,
	init: function() {
		this.timer = setTimeout("Screen.animate()",this.delay);
	},
	add: function(e) {
		_root.appendChild(e);
		return this;
	},
	as: function(w) {
		this.x = w.x;
		this.y = w.y;
		this.w = w.w;
		this.h = w.h;
		return this;
	},
	to: function(x,y) {
		this.x += x;
		this.y += y;
		return this;
	},
	at: function(x,y) {
		this.x = x;
		this.y = y;
		return this;
	},
	by: function(w,h) {
		this.w = w;
		this.h = h;
		return this;
	},
	radius: function(r) {
		this.rad = r;
		return this;
	},
	lineWidth: function(w) {
		this.lw = w;
		return this;
	},
	font: function(f) {
		var x = f.split(" ");
		if (x[0]) this.size = x[0];
		if (x[1]) this.family = x[1];
		return this;
	},
	colorize: function(x) {
		this.colorizer = x;
		return this;
	},
	stroke: function() {
		return this;
	},
	line: function() {
		var d = $_("path");
		d.setAttribute("d","M " + this.x + " " + this.y + " l " + this.w + " " + this.h);
		d.setAttribute("stroke",this.fg);
		d.setAttribute("stroke-width",this.lw);
		return this.add(d);
	},
	frame: function() {
		if (!_doc) return this;
		var d = $_("path");
		d.setAttribute("d", "M " + this.x +  " " + (this.y + this.rad) + " c 0 " + -this.rad + ", " + this.rad + " " + -this.rad + ", " + this.rad + " " +  -this.rad + " l " + (this.w - 2*this.rad) + " 0 c " + this.rad + " 0, " + this.rad + " " + this.rad + ", " + this.rad + " " + this.rad + " l 0 " + (this.h - 2*this.rad) + " c 0 " + this.rad + ", " + -this.rad + " " + this.rad + ", " + -this.rad + " " + this.rad + " l " + -(this.w - this.rad*2) + " 0 c " + -this.rad + " 0, " + -this.rad + " " + -this.rad + ", " + -this.rad + " " + -this.rad + " l 0 " + -(this.h-this.rad*2) );
		d.setAttribute("stroke",this.fg);
		d.setAttribute("fill",this.bg);
		d.setAttribute("stroke-width",this.lw);
		return this.add(d);
	},
	style: function(s) {
		this.fontstyle = s;
		return this;
	},
	print: function (tx) {
		if (!_doc) return this;
		var a = (typeof(tx) == "string" ? tx.split(" ") : tx);
		var d = $_('text');
		d.setAttribute('x',this.x);
		d.setAttribute('y',this.y + 16);
		d.setAttribute('width',this.w);
		d.setAttribute('height',this.h);
		d.setAttribute('xml:space', 'preserve');
		a.every(function(x,i) {
			var s = $_('tspan');
			var t = _doc.createTextNode(x + " " );
			if (typeof(Screen.colorizer) == "function") 
				Screen.colorizer(x);
			s.setAttribute('font-size',Screen.size);
			s.setAttribute('font-family',Screen.family);
			s.setAttribute('font-style',Screen.fontstyle);
			s.setAttribute('fill',Screen.fg);
			s.appendChild(t);
			d.appendChild(s);
		});
		return this.add(d);
	},
	draw: function (img) {
		var i = $_('image');
		i.setAttribute('x',this.x);
		i.setAttribute('y',this.y);
		i.setAttribute('width',this.w);
		i.setAttribute('height',this.h);
		i.setAttributeNS("http://www.w3.org/1999/xlink",'href',img.path);
		return this.add(i);
	},
	red: function() { this.fg = "red"; return this },
	yellow: function() { this.fg = "yellow"; return this },
	green: function() { this.fg = "green"; return this },
	blue: function() { this.fg = "blue"; return this },
	orange: function() { this.fg = "orange"; return this },
	purple: function() { this.fg = "purple" ; return this},
	black: function() { this.fg = "black"; return this },
	gray: function() { this.fg = "gray"; return this },
	white: function() { this.fg = "white"; return this },
	fill: function() {
		var r = $_('rect');
		r.setAttribute('x',this.x);
		r.setAttribute('y',this.y);
		r.setAttribute('width',this.w);
		r.setAttribute('height',this.h);
		r.setAttribute('fill',this.fg);
		return this.add(r);
	},
	rect: function() {
		var r = $_('rect');
		r.setAttribute('x',this.x);
		r.setAttribute('y',this.y);
		r.setAttribute('width',this.w);
		r.setAttribute('height',this.h);
		r.setAttribute('stroke',this.fg);
		return this.add(r);
	},
	clear: function() {
		for (var e = _root.firstChild; e;)  {
			var o = e;
			e = e.nextSibling;
			_root.removeChild(o);
		}
		return this;
	},
	color: function(r,g,b) {
		this.fg  = "rgb(" + r + "," + g + "," + b + ")";
		return this;
	},
	animate: function() {
		this.clear();
		Box.at(-_root.currentTranslate.x, -_root.currentTranslate.y).by(Display.w,Display.h);
		this.widgets.every(function(w,i) {
			w.draw();
		});
		for (var i = 0; i <this.timers.length; ++i) if (typeof(this.timers[i].timer) == "function") this.timers[i].timer();
		this.timer = setTimeout("Screen.animate()",this.delay);
	},
	overlaps: function(w) {
		return this.widgets.any(function(x) {
			if (typeof(x.hit) == "function" && x.hit(w)) return true;
			return false;
		});
	},
	schedule: function(t) {
		if (typeof(t.timer) == "function")
			this.timers.push(t);
		return this;
	}
});

