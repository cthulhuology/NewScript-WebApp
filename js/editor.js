// editor.js
//
// Copyright (C) 2009 David J. Goehrig
// All Rights Reserved
//
// requires: definition.js, screen.js, mouse.js, 
// 	keyboard.js

function today() { return (new Date()).getTime().toString() };

var Editor = let(Widget, {
	mode: "none",
	count: 0,
	users: [],
	selected: [],
	source: false, 
	definitions: [],
	mousex: 0, mousey: 0, mouseb: false,
	user: { username : "", loggedin: false },
	language: { name: "" },
	labels: [], 
	visible: false,
	draw: function() {
		if (!this.visible) return;
		if (this.mode == "define") 
			for (var i = 0; i < this.h/80; ++i)
				Screen.at(this.x,this.y+i*80).by(this.w,80).gray().frame();
		if (this.mode == "text")
			Screen.as(this).gray().frame();
		if (this.mode == "merge")
			Screen.as(this).blue().line();
		if (this.mode == "cut")
			Screen.as(this).red().line();
	},
	init: function() {
		Display.init();
		Screen.init();
		this.labels = [ 
			Text.init().at(-16000,-16000).by(Display.w,20).color(255,255,255).background(128,128,128).set("Javascript Scratchpad"),
			Text.init().at(16000,16000).by(Display.w,20).color(255,255,255).background(128,128,128).set("Object Inventory"),
			Text.init().at(0,0).by(Display.w,20).color(255,255,255).background(128,128,128).set("Newscript Editor"),
			Text.init().at(-1480,0).by(1180,20).color(255,255,255).background(128,128,128).set("Newscript Emulator"),
			Text.init().at(-320,0).by(320,20).color(255,255,255).background(128,128,128).set("Newscript Lexicon"),
			Text.init().at(-16000,16000).by(Display.w,20).color(255,255,255).background(128,128,128).set("Newscript Help & Documentation"),
			Text.init().at(16000,-16000).by(Display.w,20).color(255,255,255).background(128,128,128).set("Newscript Timeline (ToDo)"),
		];
		this.onKey('press','release').onMouse('move','up','down','wheel');
		this.hide();
		Storage.init();
		Welcome.init();
		Help.init();
		return this.instance();
	},
	down: function(e) {
		this.show();
		this.at(e.x,e.y).by(0,0);
		this.mouseb = true;
	},
	move: function(e) {
		this.mousex = e.x; this.mousey = e.y;
		if (this.mouseb)
			this.mode = (e.x > this.x && e.y > this.y ) ? 
				 ( Keyboard.shift ? "cut" : "text" ):
			 (e.x < this.x && e.y > this.y) ?
				( Keyboard.shift ? "cut" : "define" ):
			(e.y < this.y) ?
				( Keyboard.shift ? "cut" : "merge" ):
			"none";
		if (this.visible)
			(this.mode == "define") ?
				this.at(e.x+20,this.y).by(400,80 * (1 + Math.floor((e.y - this.y)/80))):
				this.by(e.x - this.x,e.y - this.y);
		this.select();
		if (this.mode == "merge" && !this.source)  {
			this.source = this.selected[0];
			this.selected = [];
		}
	},
	up: function(e) {
		this.mouseb = false;
		(this.mode == "define") ?
			this.by(400,80 * (1 + Math.floor((e.y - this.y)/80))):
			this.by(e.x - this.x, e.y - this.y);
		this.hide();
		this.action();
	},
	select: function() {
		Box.at(this.mousex,this.mousey).by(0,0);
		this.selected = [];
		this.definitions.any(function(t,z) {
			for (var d = t; d; d = d.sibling) 
				if (typeof(d.hit) == "function" && d.hit(Box)) {
					t.walk(function(x) { Editor.selected.push(x) });
					return true;
				}
			return false;
		});
		NSDefinitions.any(function(t,z) {
			for (var d = t; d; d = d.sibling) 
				if (d.isa(Box) && d.hit(Box)){
					t.walk(function(x) { Editor.selected.push(x) });
					return true;
				}
			return false;
		});
	},
	action: function() {
		this[this.mode]();
		this.mode = "none";
	},
	wheel: function(e) { Display.to(e.dx,e.dy) },
	press: function(e) { 
		if (Keyboard.up) Display.to(0,100);
		if (Keyboard.down) Display.to(0,-100);
		if (Keyboard.left) Display.to(100,0);
		if (Keyboard.right) Display.to(-100,0);
		if ((Keyboard.ctrl || Keyboard.cmd) && this.user.loggedin) {
			return  (e.key == "i") ? Display.at(-16000,-16000):  // Inventory
				(e.key == "j") ? Display.at(16000,16000):    // Javascript space
				(e.key == "h") ? Display.at(16000,-16000):    // Help space
				(e.key == "n") ? Display.at(-16000,16000):    // Newscript space
				(e.key == "l") ? Display.at(-Lexicon.x,50-Lexicon.y):
				(e.key == "m") ? Display.at(-Memory.x,50-Memory.y):
				(e.key == "o") ? Display.at(0,0):		// Origin
				(e.key == "z") ? Screen.widgets.pop():		// Undo
				(e.key == "d") ? this.selected[0].define():	// Define
				(e.key == "x") ? this.selected[0].transmit():	// Transmit
				(e.key == "c") ? Channel.hide():		// Hide Channel
			null;
		}	
	},
	release: function(e) {},
	none: function() {}, // Do nothing
	cut: function() { // Push to edit stack
		Box.at(Editor.w < 0 ? Editor.x + Editor.w : Editor.x, Editor.y+Editor.h).by(Editor.w<0? -Editor.w : Editor.w, -Editor.h);
		Screen.as(Box).red().frame();
		var y = this.selected[0];
		for(var x = y; x; x = y.sibling) {
			if (!Box.hit(x))  {
				y = x;
				continue;
			}
			if (x.title && x.sibling) {
				NSDefinitions[x.title.clean().content()] = x.sibling;
				x.sibling.setTitle(x.title.content());
				x.sibling.onMouse('move','down');
				
			} 
			y.sibling = x.sibling;
			x.sibling = false;
			x.at(0,0).by(0,0).release();
		}
		this.selected = [];
	},
	merge: function() {
		if (this.selected.length > 0) {
			var d = this.selected[0];
			if (this.source == this.selected[0]) return;
			var o = null;
			d.walk(function(x) { o = x });
			o.sibling = this.source;
			this.source.title.release();
			this.source.title = false;
			this.source.offMouse('down','move');
			d.resize();
		}
		this.source = false;
		this.selected = [];
	},
	define: function() { // Create a new Definition
		for (var i = 0; i < this.h / 80; ++i) {
			this.definitions.push(Definition.init(Box.at(this.x,this.y).by(400,80)));
			if (i == 0) this.definitions[ this.definitions.length -1].setTitle('An Object');
			if (i > 0) this.definitions[this.definitions.length-2].sibling = this.definitions[this.definitions.length-1];
			this.to(0,80);
		}
		return this;
	},
	add: function() { // Add a new slot

	},
	text: function() {  // New Text Box
		if (this.w < 20 || this.h < 20) return;
		Text.init().as(this).colorize(Newscript.colorizer);
		return this;
	},
});

// Editor.init();

