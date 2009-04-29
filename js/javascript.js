// object.js
//
// Copyright (C) 2009 David J. Goehrig
// All Rights Reserved
//
// Embeds JS objects in the environment
//
// requires: definition.js
//

var JSDefinitions = {}

Object.prototype.functionalize = function(i) {
	var str = (("" + this).split("\n")).join(" "); // Remove \n from defs
	var re = /^[^{]+{(.*)}$/;
	var m = re.exec(str);
	if (m) return m[1];
	return this;
}

Object.prototype.parameterize = function(i) {
	var str = "" + this;
	var re = /function (\([^)]*\))/;
	var m = re.exec(str);
	if (m) return i + m[1];
	return i;
}

Object.prototype.render = function(n,b) {
	if (this._language == "Newscript") return;
	var d = Definition.init(b);
	var od = d;
	JSDefinitions[n] = d.populate(n,'prototype',
		this.prototype ? this.prototype.toString() : Object.toString());
	d.resize(b);
	this.each(function(v,k) {
		b = Box.init().as(d).to(0,d.h);
		d.sibling = Definition.init(b);	
		d.sibling.populate(false,(typeof(v) == "function" ? v.parameterize(k) : k),
			("" + (typeof(v) == "function" ? v.functionalize(k) : v)),
			(this._comments ? this._comments[k] : typeof(v) ));
		d.sibling.resize(b);
		d = d.sibling;
	});
	return od;
}

let('Javascript',{
	name: "Javascript",
	opcodes: {},
	lexicon: window,
	evaluator: function(txt,term) {
		var code = typeof(txt) == "string" ? txt : txt.clean().content();
		var box = typeof(txt) == "string" ? null : Box.init().as(txt);
		try {
			var o = eval("(" +  code + ")");
			if (txt.target) txt.target.release();	
			if (o && box) 
				txt.target = o.render(typeof(o) == "object" ? code : o.toString(),box.clone().to(0,box.h+20));
			return o;
		} catch (e) { 
			if (e.name == "ReferenceError") {
				var re = /:\s+(\w+)/;
				var m = re.exec(e.message);
				if (m[1]) {
					if (m[1] == term) { alert(e); return }	
					Storage.load(m[1]);
					alert('Loading ' + m[1]);
					Javascript.evaluator(txt,m[1]);
				}
			} else {
				alert(e);
			}
		};
	},
	compiler: function(txt) { alert("todo"); },
	define: function(def) {
		if (!def.title) return;
		if (def.title) window[def.title.clean().content()] = new Object();
		window[def.title.content()]._language = "Javascript";
		window[def.title.content()]._comments = {};
		def.walk(function(d) {
			var re = /([^(]+)(\(.*\))$/;
			var m = re.exec(d.verb.clean().content());
			var v = d.verb.content();
			var c = d.code.clean().content();
			if (m) {
				v = m[1];	
				c = "function" + m[2] + "{" + d.code.content() + "}";
			} 
			window[def.title.content()][v] = eval( "(" +  c + ")");
			window[def.title.content()]._comments[v] = d.comment.clean().content();
		});
		Storage.store(def.title.content(),window[def.title.content()].json());
		return def;	
	},
	colorizer: false,
});
