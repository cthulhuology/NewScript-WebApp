// text.js
//
// Copyright (C) 2009 David J. Goehrig
// All Rights Reserved
//

var Text = let(Widget,{
	_default: "some text",
	data: null,
	colorizer: false,
	stroke: false,
	active: false,
	frame: false,
	fill: false,
	style: 'normal',
	init: function() {
		var t = this.clone();
		t.onMouse('move');
		t.data = [];
		return t.instance();
	},
	draw:  function() {
		if (!this.visible) return;
		if (this.fill) Screen.as(this).color(this.fill.r,this.fill.g,this.fill.b).fill();
		if (this.stroke) Screen.color(this.stroke.r,this.stroke.g,this.stroke.b);
		Screen.as(this).to(4,0).style(this.style).font("16 Arial").colorize(this.colorizer).print(this.data).colorize(false);
		this.by(Math.max(this.w,this.longest()),Math.max(this.h,Screen.y-this.y));
		if (this.frame) Screen.as(this).gray().frame();
	},
	longest: function() {
		var retval = 0;
		this.data.every(function(v,i) { retval = Math.max(retval,v.length*16) });
		return retval;
	},
	size: function(b) { return this.content().length*8 },
	move: function(e) { 
		this.clean();
		this.offKey('press');
		if (this.frame = this.hit(e)) {
			this.data = (this.content() == this._default) ?  ["_"]: this.data;
			if (this.data.last() != "_") this.data.push("_");
			this.onKey('press');
			return;
		}
	},
	press: function(e) {
		if (!this.frame) return;
		if ((Keyboard.ctrl || Keyboard.cmd) && Editor.user.loggedin) 
			return (e.key == "e") ? this.evaluate():
				(e.key == "c") ? this.compile():
				(e.key == "s") ? this.evaluate().json().download():
				null;
		return (Editor.user.loggedin && e.key == "\n") ? this.action(): this.edit(e.key);
	},
	edit: function(k) { 
		if (this.data.last() == "_") this.data.pop();
		if (Keyboard.backspace) {
			var last = this.data.pop();
			if (last.length == 0) return this.data.push("_");
			this.data.push(last && typeof(last.substring) == "function" ? last.substring(0,last.length-1) : "");
			this.data.push("_");
			return;
		} 
		if (k == " ") {
			if (this.data.last().length == 0) return;
			this.data.push("");
			this.data.push("_");
			return;
		}
		var last = this.data.pop();
		this.data.push(last ? last + k : k);
		this.data.push("_");
	},
	action: function() { return this.evaluate() },
	evaluate: function() {
		return Keyboard.alt ? Javascript.evaluator(this) : Newscript.evaluator(this);
	},
	compile: function() {
		this.offKey('press');
		return Keyboard.alt ? Javascript.compiler(this) : Newscript.compiler(this);
	},
	clean: function() { 
		if (this.data.last() == "_") this.data.pop(); 
		if (this.data.length == 0) this.set(this._default);
		return this;
	},
	release: function() {
		this.offKey('press');
		this.offMouse('move');
		this.frame = false;
		return this.remove();
	},
	restore: function() {
		this.onKey('press');
		this.onMouse('move');
		return this.instance();
	},
	set: function(t) { 
		if (!t) return this;
		this.data = t.toString().split(/\s/);
		return this;
	},
	setDefault: function(t) { 
		this._default = t; 
		this.set(t);
		return this 
	},
	content: function() { return this.data.join(" ") },
	font: function(f) { this.fonttype = f; return this },
	color: function(r,g,b) { this.stroke = { 'r' : r, 'g': g, 'b': b }; return this; },
	colorize: function(f) { this.colorizer = f; return this },
	background: function(r,g,b) { this.fill = {'r':r,'g':g,'b':b}; return this },
	define: function() { }, // Do nothing, we don't define text blocks
	transmit: function() {
		var msg = { msg: this.clean().content(), from: Editor.user.name, date: today() };
		msg.send(Channel.channel);
		this.data = [""];
	},
	italic: function() {
		this.style = 'italic';
		return this;
	},
});
