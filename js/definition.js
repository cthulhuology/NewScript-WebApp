// definition.js
//
// Copyright (C) 2009 David J. Goehrig
// All Rights Reserved
//
// requires: text.js
//

let('Definition',Widget,{
	defaults: { 'title' : 'An Object', 'verb' : 'a verb', 'code' : 'some code', 'comment' : 'a comment'},
	title: null, 
	verb: null, 
	code: null, 
	comment: null,
	sibling: null,
	visible: true,
	icon: Image.init('/images/define.png'),
	init: function(b) {
		var d = Definition.clone();
		d.as(b);
		b.by(400,20);
		d.verb = Text.init().as(b).colorize(Newscript.colorizer).setDefault(Definition.defaults['verb']);
		d.code = Text.init().as(b).setDefault(Definition.defaults['code']).colorize(Newscript.colorizer);
		d.comment = Text.init().as(b).font("/images/16ptGrayItalic.png").setDefault(Definition.defaults['comment']);
		d.resize();
		return d.instance();
	},
	hitme: function(e) {
		var h = false;
		this.walk(function(d) { if (d.hit(e)) return h = true });
		return h;	
	},
	move: function(e) {
		if (this.hitme(e)) return this.outside = false;
		if (this.outside) return;
		NS.store(this);		
		this.outside = true;
	},
	down: function(e) {
		var b = Box.init().as(this).to(this.w-100,0).by(100,30);
		this.walk(function(d) { b.to(0,d.h) });
		if (b.hit(e))
			NS.define(this);
	},
	draw: function() {
		Screen.as(this).gray().frame();
		if (this.title) {
			this.upcase();
			Screen.as(this).to(this.w-100,0).by(100,30);
			this.walk(function(d) { Screen.to(0,d.h) });
			Screen.draw(this.icon);
		}
		this.resize();
		Screen.as(this)[this.within(Editor.selected) ? 'green' : 'gray']().frame();
	},
	upcase: function() {
		var t = this.title.content();
		this.title.set(t.substring(0,1).toUpperCase() + t.substring(1));
	},
	setTitle: function(t) {
		this.title = Text.init().as(this).to(0,-25).by(300,20).setDefault(t);
		this.onMouse('move','down');
		return this;
	},
	populate: function(t,v,c,m) {
		if (t) this.setTitle(t);
		this.verb.set(v);
		this.code.set(c);
		this.comment.set(m);
		return this;
	},
	maxwidth: function() {
		return Math.max(Math.max(this.verb.longest(),Math.max(this.code.longest(), this.comment.longest())), this.sibling ? this.sibling.maxwidth() : 400);
	},
	resize: function() {
		if (this.title) {
			var ms = Math.max(300,this.maxwidth()-100); // determine the maximum string width
			this.by(ms,this.h);
		}
		var b = Box.init().as(this);
		if(this.title) this.title.at(b.x,b.y-this.title.h).by(b.w-100,20);
		this.verb.at(b.x,b.y).by(b.w,this.verb.h);
		this.code.at(b.x+4,b.y+this.verb.h).by(b.w-8,this.code.h);
		this.comment.at(b.x+8,b.y+this.verb.h+this.code.h).by(b.w-16,this.comment.h);
		this.at(b.x,b.y).by(b.w,this.verb.h+this.code.h+this.comment.h);
		if (this.sibling) {
			this.sibling.at(b.x,b.y + this.h).by(this.w,this.h);
			this.sibling.resize();
		}
		return this;
	},
	define: function() { Keyboard.alt ? Javascript.define(this) : Newscript.define(this); },
	release: function() {
		if (this.title) this.title.release();
		this.verb.release();
		this.code.release();
		this.comment.release();
		if( this.sibling) this.sibling.release();	
		this.remove();
	},
	transmit: function() {
		alert("todo: transmit an object to another user's channel");
	},
});
