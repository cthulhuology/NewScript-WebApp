// newscript.js
//
// Copyright (C) 2009 David J. Goehrig
// All Rights Reserved
//
// NS object model and editor extensions
//

function defed(x) {
	if (typeof(x) == "number") return x;
	if (typeof(x) == "boolean") return x;
	return x ? x : null;
}

var NSDefinitions = {};
var NSStored = {};

let('Newscript',Widget,{
	tos: 0,
	nos: 0,
	utl: 0,
	cnt: 0,
	ds: [0,0,0,0,0,0],
	rs: [0,0,0,0,0,0],
	ip: 0,
	mem: [],
	free: 0,
	src: 0,
	dst: 0,	
	opcodes: {
		'ret'  : function() { NS.ip = NS.rs.pop() },
		'.'    : function() { NS.ip = NS.rs.pop() },
		'up'   : function() { NS.ds.pop() },
		'down' : function() { NS.ds.push(0) },
		'nip'  : function() { NS.nos = NS.ds.pop() },
		'drop' : function() { NS.tos = NS.nos; NS.nos = NS.ds.pop() },
		','    : function() { NS.tos = NS.nos; NS.nos = NS.ds.pop() },
		'push' : function() { NS.rs.push(NS.tos); NS.tos = NS.nos; NS.nos = NS.ds.pop() },
		';'    : function() { NS.rs.push(NS.tos); NS.tos = NS.nos; NS.nos = NS.ds.pop() },
		'dup'  : function() { NS.ds.push(NS.nos); NS.nos = NS.tos },
		'over' : function() { var a = NS.nos; NS.ds.push(a); NS.nos = NS.tos; NS.tos = a },
		'pop'  : function() { NS.ds.push(NS.nos); NS.nos = NS.tos; NS.tos = NS.rs.pop() },
		'^'    : function() { NS.ds.push(NS.nos); NS.nos = NS.tos; NS.tos = NS.rs.pop() },
		'util' : function() { NS.utl = NS.ds.pop() },
		'++'   : function() { ++NS.mem[NS.tos] }, // todo confirm no drop
		'--'   : function() { --NS.mem[NS.tos] }, // todo confirm no drop
		'-'    : function() { NS.tos = -NS.tos },
		'+'    : function() { NS.tos += NS.nos; NS.nos = NS.ds.pop() },
		'*'    : function() { NS.tos *= NS.nos; NS.nos = NS.ds.pop() },
		'/'    : function() { var b = NS.tos; var a = NS.nos; NS.tos = a / b; NS.nos = a % b},
		'*/'   : function() { NS.utl = NS.ds.pop(); var a = NS.nos; var b = NS.tos; NS.tos = (a * NS.utl) / b; NS.nos = (a * NS.utl) % b },
		'~'    : function() { NS.tos = ~NS.tos },
		'&'    : function() { NS.tos &= NS.nos; NS.nos = NS.ds.pop() },
		'|'    : function() { NS.tos |= NS.nos; NS.nos = NS.ds.pop() },
		'\\'   : function() { NS.tos ^= NS.nos; NS.nos = NS.ds.pop() },
		'!#'   : function() { NS.cnt = NS.tos; NS.tos = NS.nos; NS.nos = NS.ds.pop() },
		'@#'   : function() { NS.ds.push(NS.nos); NS.nos = NS.tos; NS.tos = NS.cnt },
		'<<'   : function() { NS.tos << NS.cnt },
		'>>'   : function() { NS.tos >> NS.cnt },
		'@'    : function() { NS.tos = NS.mem[NS.tos] },
		'$'    : function() { NS.ds.push(NS.nos); NS.nos = NS.tos; NS.tos = NS.mem[NS.src++]},
		'!$'   : function() { NS.src = NS.tos },
		'@$'   : function() { NS.ds.push(NS.nos); NS.nos = NS.tos; NS.tos = NS.src },
		'!'    : function() { NS.mem[NS.tos] = NS.nos; NS.tos = NS.nos; NS.nos = NS.ds.pop() },
		'%'    : function() { NS.mem[NS.dst++] = NS.tos; NS.tos = NS.nos; NS.nos = NS.ds.pop() },
		'!%' : function() { NS.dst = NS.tos; NS.tos = NS.nos; NS.nos = NS.ds.pop() },
		'@%' : function() { NS.ds.push(NS.nos); NS.nos = NS.tos; NS.tos = NS.dst },
		'<' : function() { NS.tos = (NS.nos < NS.tos ? 1 : 0); NS.nos = NS.ds.pop() },
		'=' : function() { NS.tos = (NS.nos == NS.tos ? 1 : 0); NS.nos = NS.ds.pop() },
		'>' : function() { NS.tos = (NS.nos > NS.tos ? 1 : 0); NS.nos = NS.ds.pop() },
		'<=' : function() { for(var i = 0; i < NS.cnt; ++i) NS.mem[NS.dst--] = NS.mem[NS.src--] },
		'<-' : function() { for(var i = 0; i < NS.cnt; ++i) NS.movebyte(NS.dst--, NS.src--) },
		'==' : function() { NS.ds.push(NS.nos); NS.nos = NS.tos; NS.tos = 1; for(var i = 0; i < NS.cnt; ++i) if (NS.byte(NS.src++) != NS.byte(NS.dst++)) NS.tos = 0; },
		'->' : function() { for(var i = 0; i < NS.cnt; ++i) NS.movebyte(NS.dst++, NS.src++) },
		'=>' : function() { for(var i = 0; i < NS.cnt; ++i) NS.mem[NS.dst++] = NS.mem[NS.src++] },
	},
	movebyte: function(d,s) {
		var od = Math.floor(d/4);	var os = Math.floor(s/4);
		var dc = d%4;			var sc = s%4;
		NS.mem[od] = (NS.mem[od] & ~(0xff << (dc * 8))) | (((NS.mem[os] & (0xff << (sc * 8))) >> (sc*8)) << (dc*8))
	},
	byte: function(o) {
		var oo = Math.floor(o/4);
		var oc = o%4;
		return (NS.mem[oo] & (0xff << (oc * 8))) >> (oc*8);
	},
	name: "Newscript",
	empty:  Box.init().at(400,50),
	lexicon: {},
	evaluator: function(txt) {
		var words = txt.clean().data;
		NS.ip = NS.free;
		words.every(function(v,i) {
			if (v != "" && v != null)
				NS.mem[NS.ip++] = v
		});
		NS.mem[NS.ip] = null; // nullify the last field in memory
		NS.ip = NS.free;
		while (NS.ip >= 0) {
			if (typeof(NS.opcodes[NS.mem[NS.ip]]) == "function") {
				var i = NS.ip++;
				NS.opcodes[NS.mem[i]]();
				continue;
			}
			if (typeof(NS.lexicon[NS.mem[NS.ip]]) == "object") {
				NS.rs.push(NS.ip + 2);
				NS.ip = NS.lexicon[NS.mem[NS.ip]][NS.mem[NS.ip+1]];
				continue;
			}
			if (typeof(NS.mem[NS.ip]) == "string" && parseInt(NS.mem[NS.ip]) != NaN) {
				NS.ds.push(NS.nos);
				NS.nos = NS.tos;
				NS.tos = parseInt(NS.mem[NS.ip]);
				++NS.ip;
				continue;
			}
			if (NS.mem[NS.ip] != null)
				alert("Instruction at: " + NS.ip + " unknown: " + NS.mem[NS.ip]);
			NS.ip = -1; // On error quit evaluating
		}
		NS.ip = NS.free;
	},
	reset: function() {
		Firth.reset();
		NS.lexicon = {};
		NS.free = 0;
		NS.mem = [];	
		NS.ip = 0;
	},
	json: function(def) {
		if (!def.title) return {};
		var js = { _language: "Newscript",  _comments: {} };
		def.walk(function(d) {	
			js[d.verb.clean().content()] = d.code.clean().content();
			js._comments[d.verb.clean().content()] = d.comment.clean().content();
		});
		return js;
	},
	diff: function(ja,jb) {
		var retval = false;
		ja.each(function(v,k) { if (jb[k] != v) return retval = true });
		jb.each(function(v,k) { if (ja[k] != v) return retval = true });
		return retval;
	},
	store: function(def) {
		if (!def.title) return;
		var name = def.title.clean().content();
		var js = NS.json(def);
		if (NSStored[name] && !NS.diff(js,NSStored[name])) return;
		Storage.store(name,js);	
		var msg = { msg: "[" + name + "]", from: "[Saved]" };
		msg.send(Channel.channel);
		Inventory.load();
		NSStored[name] = js;
	},
	define: function(def) {
		var name = false;
		var obj = NS.free;
		var slot = 2;
		if (def.title) {
			name = def.title.clean().content();
			NS.lexicon[name] = { _address: NS.free };
			NS.mem[obj] = name;
			def.walk(function(d) {
				NS.mem[obj+(slot++)] = d.verb.clean().content();
				NS.mem[obj+1+(slot++)] = 0;
			});
			NS.free += (NS.mem[obj+1] = slot);
		}
		slot = 2;
		def.walk(function(d) {
			NS.mem[obj + slot + 1] = NS.free;
			slot += 2;
			NS.lexicon[name][d.verb.content()] = NS.free;
			var words = d.code.data;
			words.every(function(v,i) {
				if (v != "" && v != null) 
					NS.mem[NS.free++] = v;
			});
		});
		NS.mem[NS.free++] = '.'; // Add a default return in case the object dropped . at the end
		// Editor.latest = null;
	},
	compiler: function(txt) {
		alert('DEPRECIATED');
	},
	compileLexicon: function() {
		this.lexicon.each(function(v,k) { NS.compile(NSDefinitions[k]) });
		Firth.download();
	},
	compile: function(def) {
		var name = def.title.clean().content();
		var obj = {};
		def.walk(function(d) { obj[d.verb.clean().content()] = d.code.clean().data });
		Firth.compile(name,obj);
	},
	x: 0,
	y: 20,
	w: 300,
	h: 500,
	visible: true,
	draw: function() {
		if (! this.visible) return;
		this.at(0,50).by(400,260);
		Screen.as(this).gray().frame().font("/images/16ptGrayItalic.png");
		Screen.at(this.x,this.y-25).print("Newscript VM");
		Screen.at(this.x+10,this.y+20).print("tos:" + defed(NS.tos)).to(40,0).print("utl:" + defed(NS.utl));
		Screen.at(this.x+10,this.y+40).print("nos:" + defed(NS.nos)).to(40,0).print("cnt:" + defed(NS.cnt));
		Screen.at(this.x+10,this.y+60).print("ds0:" + defed(NS.ds[NS.ds.length-1])).to(40,0).print("rs0:" + defed(NS.rs[NS.rs.length-1]));
		Screen.at(this.x+10,this.y+80).print("ds1:" + defed(NS.ds[NS.ds.length-2])).to(40,0).print("rs1:" + defed(NS.rs[NS.rs.length-2]));
		Screen.at(this.x+10,this.y+100).print("ds2:" + defed(NS.ds[NS.ds.length-3])).to(40,0).print("rs2:" + defed(NS.rs[NS.rs.length-3]));
		Screen.at(this.x+10,this.y+120).print("ds3:" + defed(NS.ds[NS.ds.length-4])).to(40,0).print("rs3:" + defed(NS.rs[NS.rs.length-4]));
		Screen.at(this.x+10,this.y+140).print("ds4:" + defed(NS.ds[NS.ds.length-5])).to(40,0).print("rs4:" + defed(NS.rs[NS.rs.length-5]));
		Screen.at(this.x+10,this.y+160).print("ds5:" + defed(NS.ds[NS.ds.length-6])).to(40,0).print("rs5:" + defed(NS.rs[NS.rs.length-6]));
		Screen.at(this.x+10,this.y+200).print("src:" + defed(NS.src)).to(40,0).print("dst:" + defed(NS.dst));
		Screen.at(this.x+10,this.y+220).print("ip :" + defed(NS.ip)).to(40,0).print("mem:" + defed(NS.mem.length));
	},
	colorizer: function(t) {
		var re = /^\d+$/;
		Screen.font("/images/16ptRed.png");
		if (re.exec(t)) Screen.font("/images/16ptBlue.png");
		if (NS.opcodes[t]) Screen.font("/images/16ptOrange.png");
		if (NS.lexicon[t]) Screen.font("/images/16ptBlack.png");
		if (NS.lexicon.any(function(x,z) {
			if (x.any(function(v,k) {
				if (k == t) return true;
			})) return true;
			return false;
		})) Screen.font("/images/16ptGreen.png");
	},
	load: function(n) {
		if (NSDefinitions[n]) 
			return Display.at(50-NSDefinitions[n].x,50-NSDefinitions[n].y);
		var o = Definitions[n];
		NS.empty.by(400,o.slots*40);
		while(Screen.overlaps(NS.empty)) NS.empty.to(20,0);
		var first = true;
		var d = null;
		var b = NS.empty.to(20,0).clone();
		o.each(function(v,i) {
			d = d ? d.sibling = Definition.init(b): Definition.init(b);
			d.populate( first ? n : false, i, v, o.hasOwnProperty('_comments') ? o['_comments'][i] : '');
			if (first)  {
				NSDefinitions[n] = d;
				first = false;
			}
			d.resize();
			b.as(d);
		});
		Display.at(50-NS.empty.x,50-NS.empty.y); // Jump to loaded definition
		NSStored[n] = NS.json(NSDefinitions[n]);
	},
});

let('Memory',Widget, {
	x: -1480,
	y: 50,
	w: 1140,
	h: 660,
	init: function() { return this.instance() },
	draw: function() {
		if (!NS.visible) return;
		Screen.as(this).frame().font("/images/16ptGrayItalic.png");
		Screen.at(this.x,this.y-25).print("Newscript Memory @ " + defed(NS.ip));
		var off = NS.ip / 128;
		for (var i = 0; i < 32; ++i) 
			for (var j = 0; j < 8; ++j)  
				Screen.at(this.x+10+j*140, this.y+i*20+10).print("" + defed(NS.mem[off*128+i*8+j]));
	},
});

let('Lexicon',Widget, {
	x: -320,
	y: 50,
	w: 300,
	h: 660,
	compile: Image.init('/images/compile.png'),
	reset:  Image.init('/images/reset.png'),
	init: function() {
		this.onMouse('down');
		return this.instance();
	},
	down: function(e) {
		if (Box.init().as(this).to(0,this.h).by(100,30).hit(e)) return NS.reset();
		if (Box.init().as(this).to(this.w-100,this.h).by(100,30).hit(e)) return NS.compileLexicon();
	},
	draw: function() {
		if (!NS.visible) return;
		var slots = 0;
		NS.lexicon.each(function(v,k) { slots += 1 + v.slots() });
		this.at(-320,50).by(300,20 + slots * 20);
		Screen.as(this).to(0,-25).font("/images/16ptGrayItalic.png").print("Current Lexicon:");
		Screen.as(this).frame().to(0,this.h).by(100,30).draw(this.reset).to(this.w-100,0).draw(this.compile);
		var i = 0;
		NS.lexicon.each(function(v,k) {
			Screen.as(Lexicon).font("/images/16ptBlack.png").to(10,i*20+10).print(k);
			Screen.as(Lexicon).font("/images/16ptBlue.png").to(220,i*20+10).print(""+v._address);
			++i;
			v.each(function(vv,kk) {
				Screen.font("/images/16ptGreen.png").as(Lexicon).to(30,i*20+10).print(kk);
				Screen.font("/images/16ptBlue.png").as(Lexicon).to(220,i*20+10).print(""+vv);
				++i;
			});
		});
	},
});

var NS = Newscript.instance().hide();
Lexicon.init();
Memory.init();
