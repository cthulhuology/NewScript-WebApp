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

var Macro = let({ });

var Opcodes = let({
	0x80 : function() { },
	0x81 : function() { NS.upr(NS.ip); NS.ip = NS.tos(); NS.down() },
	0x82 : function() { NS.down() },
	0x83 : function() { NS.snos(NS.tos()); NS.down() },
	0x84 : function() { NS.upr(NS.tos()); NS.down() },
	0x85 : function() { NS.stos(~NS.tos()) },
	0x86 : function() { NS.snos(NS.tos() & NS.nos()); NS.down() },
	0x87 : function() { NS.snos(NS.tos() | NS.nos()); NS.down() },
	0x88 : function() { NS.snos(NS.tos() ^ NS.nos()); NS.down() },
	0x89 : function() { NS.stos(NS.mem[NS.tos]) },	
	0x8a : function() { NS.up(NS.nos() < NS.tos() ? -1 : 0) },
	0x8b : function() { NS.up(NS.nos() == NS.tos() ? -1 : 0) },
	0x8c : function() { NS.stos(Math.floor(NS.tos << 1)) },
	0x8d : function() { NS.stos(Math.floor(NS.tos() << 8)) },
	0x8e : function() { NS.up(0) },
	0x8f : function() { NS.up(1) },
	0x90 : function() { NS.ip = NS.rtos(); NS.downr() },
	0x91 : function() { if (NS.nos()) NS.ip = NS.tos(); NS.down(); NS.down() },
	0x92 : function() { NS.up(NS.tos()) },
	0x93 : function() { NS.up(NS.nos()) },
	0x94 : function() { NS.up(NS.rtos()); NS.downr() },
	0x95 : function() { NS.stos(-NS.tos()) },
	0x96 : function() { NS.snos(NS.tos() + NS.nos()); NS.down() },	
	0x97 : function() { NS.snos(Math.floor(NS.tos() * NS.nos())); NS.down() },
	0x98 : function() { var b = NS.tos(); var a = NS.nos(); NS.stos(Math.floor(a / b)); NS.snos(a % b)},
	0x99 : function() { NS.mem[NS.tos()] = NS.nos(); NS.down() },
	0x9a : function() { NS.up(NS.nos() > NS.tos() ? -1 : 0) },
	0x9b : function() { NS.up(NS.nos() != NS.tos() ? -1 : 0); },
	0x9c : function() { NS.stos(Math.floor(NS.tos() >> 1)) },	
	0x9d : function() { NS.stos(Math.floor(NS.tos() >> 8)) },	
	0x9e : function() { NS.up(NS.utl) },
	0x9f : function() { NS.up(-1) },	
	0xa0 : function() { for(var i = 0; i < NS.cnt; ++i) NS.mem[NS.dst--] = NS.mem[NS.src--] },
	0xa1 : function() { NS.up(NS.cnt) },
	0xa2 : function() { NS.up(NS.src) },
	0xa3 : function() { NS.up(NS.dst) },
	0xc0 : function() { for(var i = 0; i < NS.cnt; ++i) 
			if (NS.byte(NS.src++) != NS.byte(NS.dst++)) return NS.cnt; NS.cnt = 0 },
	0xc1 : function() { ++NS.cnt },	
	0xc2 : function() { NS.up(NS.mem[NS.src++]) },
	0xc3 : function() { NS.mem[NS.dst++] = NS.tos() },
	0xe0 : function() { for(var i = 0; i < NS.cnt; ++i) NS.mem[NS.dst++] = NS.mem[NS.src++] },
	0xe1 : function() { NS.cnt = NS.tos() },	
	0xe2 : function() { NS.src = NS.tos() },	
	0xe3 : function() { NS.dst = NS.tos() },
});

var Core = let({
	','    : 0x82,
	';'    : 0x83,
	'>r'   : 0x84,
	'~'    : 0x85,
	'&'    : 0x86,
	'|'    : 0x87,
	'\\'   : 0x88,
	'@'    : 0x89,
	'<'    : 0x8a,
	'='    : 0x8b,
	'<<'   : 0x8c,
	'<<<'  : 0x8d,
	'0'    : 0x8e,
	'1'    : 0x8f,
	'.'    : 0x90,
	'?'    : 0x91,
	':'    : 0x92,
	'^'    : 0x93,
	'r>'   : 0x94,
	'-'    : 0x95,
	'+'    : 0x96,
	'*'    : 0x97,
	'/'    : 0x98,
	'!'    : 0x99,
	'>'    : 0x9a,
	'~='   : 0x9b,
	'>>'   : 0x9c,
	'>>>'  : 0x9d,
	'@u'   : 0x9e,
	'-1'   : 0x9f,
	'<-'   : 0xa0,
	'@#'   : 0xa1,
	'@$'   : 0xa2,
	'@%'   : 0xa3,
	'=='   : 0xc0,
	'#'    : 0xc1,
	'$'    : 0xc2,
	'%'    : 0xc3,
	'->'   : 0xe0,
	'!#'   : 0xe1,
	'!$'   : 0xe2,
	'!%'   : 0xe3,
});

var NS = Newscript = let({
	dsi: 0,
	rsi: 0,
	utl: 0,
	cnt: 0,
	ds: [0,0,0,0,0,0,0,0],
	rs: [0,0,0,0,0,0,0,0],
	ip: 0,
	mem: [],
	free: 0,
	src: 0,
	dst: 0,	
	tos: function() { return NS.ds[NS.dsi] },
	stos: function(x) { NS.ds[NS.dsi] = x },
	nos: function() { return NS.ds[(NS.dsi - 1) & 7] },
	snos: function(x) { NS.ds[(NS.dsi - 1) & 7] = x },
	up: function(x) { NS.dsi = (NS.dsi + 1) & 7; NS.ds[NS.dsi] = x },
	down: function() { NS.dsi = (NS.dsi - 1) & 7 },
	rtos: function() { return NS.rs[NS.rsi] },
	upr: function(x) { NS.rsi = (NS.rsi + 1) & 7; NS.rs[NS.rsi] = x },
	downr: function() { NS.rsi = (NS.rsi - 1) & 7 },
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
	slot: 0,
	indx: 0,
	pad: function() {
		while (NS.slot) { 
			NS.mem[NS.indx] |= 0x80 << (8*NS.slot);
			NS.slot = (++NS.slot & 3);
			if (NS.slot == 0) ++NS.indx;
		}
	},
	evaluator: function(txt) {
		var words = txt.clean().data;
		NS.indx = NS.ip = NS.free;
		NS.slot = 0;
		var last = null;
		words.every(function(v,i) {
			if (v == undefined) return;
			if (typeof(NS.lexicon['Macro'][v]) == "number") {
				NS.upr(null);
				NS.ip = NS.lexicon['Macro'][v];
				return NS.exec();
			} else if (typeof(NS.lexicon['Core'][v]) == "number") {
			//	alert('compiling ' + v + ' => ' + NS.lexicon['Core'][v]);	
				NS.mem[NS.indx] |= (NS.lexicon['Core'][v] &0xff) << (8*NS.slot);
				NS.slot = (++NS.slot & 3);
				if (NS.slot == 0) ++NS.indx;
			} else if (typeof(NS.lexicon[v]) == "object") {
		//		alert('object to ' + v );
				last = v;
			} else if (last && typeof(NS.lexicon[last][v]) == "number") {
		//		alert('compiling verb ' + v + ' => ' + NS.lexicon[last][v]);
				NS.pad();
				NS.mem[NS.indx++] = NS.lexicon[last][v] & 0x7fffffff;
				NS.mem[NS.indx++] = 0x80808081;
			} else if (typeof(v) == "string" 
				&& (typeof(parseInt(v)) == "number"))  {
			//	alert('Compiling literal ' + v);
				NS.pad();
				NS.mem[NS.indx++] = v.charAt(0) == "#" ?
					0x7fffffff & (parseInt('0x' + v.substr(1))):
					0x7fffffff & parseInt(v);
			}
		});
		NS.pad();
		NS.mem[NS.indx++] = 0x1000;
		NS.mem[NS.indx++] = 0x80808081; // jump past end to stop
		NS.ip = NS.free;
		NS.exec();
	},
	exec: function() {
		while(NS.ip >= 0 && NS.ip < 0x1000) {
			var instr = NS.mem[NS.ip++];
		//	alert('instr is ' + instr);
			if (instr == undefined) return;
			if (!(instr & 0x80000000)) { // Literal
		//		alert('push literal ' + instr);
				NS.up(instr);
			} else {
		//		alert('eval instructions ');
				while(instr & 0xff) {
		//			alert("opcode "+(instr&0xff)+" : " + typeof(Opcodes[instr&0xff]));
					typeof(Opcodes[instr&0xff]) == "function" ? 
						Opcodes[instr&0xff]():
						(NS.ip = 0x1000);
					instr = (instr >> 8) & 0x00ffffff;
				}
			}
		}
	},
	init: function() {
		Firth.reset();
		NS.lexicon = { Core: { _address: 'none'}, Macro: { _address: 'none' } };
		Core.each(function(v,k) { NS.lexicon['Core'][k] = v });
		Macro.each(function(v,k) { NS.lexicon['Macro'][k] = v });
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
		if (def.title.clean().content() == "An Object") return;
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
	colorizer: function(t) {
		var re = /^((#[a-f0-9]+)|\d)+$/;
		Screen.red();
		if (re.exec(t)) Screen.blue()
		if (NS.lexicon[t]) {
			Screen.black();
			NS.word = t;
		}
		if (NS.lexicon.any(function(x,z) {
			if (x.any(function(v,k) {
				if (k == t) return true;
			})) return true;
			return false;
		})) Screen.green();
		if (NS.lexicon['Macro'][t]) Screen.purple();
		if (NS.lexicon['Core'][t]) Screen.orange();
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
			Editor.definitions.push(d);
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

var Registers = let(Widget, {
	x: 0,
	y: 20,
	w: 300,
	h: 500,
	init: function() { return this.instance() },
	draw: function() {
		if (! this.visible) return;
		this.at(0,25).by(400,220);
		Screen.as(this).gray().frame().font("16 Arial").style('italic');
		Screen.at(this.x+10,this.y+10).print("tos:" + defed(NS.ds[7&(NS.dsi)])).at(this.x + 200,this.y+10).print("rs0:" + defed(NS.utl));
		Screen.at(this.x+10,this.y+30).print("nos:" + defed(NS.ds[7&(NS.dsi-1)])).at(this.x + 200,this.y+30).print("rs1:" + defed(NS.cnt));
		Screen.at(this.x+10,this.y+50).print("ds2:" + defed(NS.ds[7&(NS.dsi-2)])).at(this.x + 200,this.y+50).print("rs2:" + defed(NS.rtos()));
		Screen.at(this.x+10,this.y+70).print("ds3:" + defed(NS.ds[7&(NS.dsi-3)])).at(this.x + 200,this.y+70).print("rs3:" + defed(NS.rs[7&(NS.rsi-1)]));
		Screen.at(this.x+10,this.y+90).print("ds4:" + defed(NS.ds[7&(NS.dsi-4)])).at(this.x + 200,this.y+90).print("rs4:" + defed(NS.rs[7&(NS.rsi-2)]));
		Screen.at(this.x+10,this.y+110).print("ds5:" + defed(NS.ds[7&(NS.dsi-5)])).at(this.x + 200,this.y+110).print("rs5:" + defed(NS.rs[7&(NS.rsi-3)]));
		Screen.at(this.x+10,this.y+130).print("ds6:" + defed(NS.ds[7&(NS.dsi-6)])).at(this.x + 200,this.y+130).print("rs6:" + defed(NS.rs[7&(NS.rsi-4)]));
		Screen.at(this.x+10,this.y+150).print("ds7:" + defed(NS.ds[7&(NS.dsi-7)])).at(this.x + 200,this.y+150).print("rs7:" + defed(NS.rs[7&(NS.rsi-5)]));
		Screen.at(this.x+10,this.y+170).print("src:" + defed(NS.src)).at(this.x + 200,this.y+170).print("cnt:" + defed(NS.cnt));
		Screen.at(this.x+10,this.y+190).print("dst:" + defed(NS.dst)).at(this.x + 200,this.y+190).print("utl:" + defed(NS.utl));
	},
});	

var Lexicon = let(Widget, {
	x: -320,
	y: 25,
	w: 300,
	h: 660,
	compile: null, 
	reset: null,
	init: function() {
		this.compile = Image.init('/images/compile.png'),
		this.reset = Image.init('/images/reset.png'),
		this.onMouse('down');
		return this.instance();
	},
	down: function(e) {
		if (Box.init().as(this).to(0,this.h).by(100,30).hit(e)) return NS.init();
		if (Box.init().as(this).to(this.w-100,this.h).by(100,30).hit(e)) return NS.compileLexicon();
	},
	draw: function() {
		if (!this.visible) return;
		var slots = 0;
		NS.lexicon.each(function(v,k) { slots += 1 + v.slots() });
		this.at(-320,25).by(300,20 + slots * 20);
		Screen.as(this).gray().frame().to(0,this.h).by(100,30).draw(this.reset).to(this.w-100,0).draw(this.compile);
		var i = 0;
		NS.lexicon.each(function(v,k) {
			Screen.as(Lexicon).black().font("16 Arial").to(10,i*20+10).print(k);
			Screen.as(Lexicon).blue().font("16 Arial").to(220,i*20+10).print(""+v._address);
			++i;
			v.each(function(vv,kk) {
				Screen.font("16 Arial")[ k == "Core" ? "orange" : k == "Macro" ? "purple" : "green" ]().as(Lexicon).to(30,i*20+10).print(kk);
				if (typeof(vv) == "function")
					Screen.font("16 Arial").black().as(Lexicon).to(220,i*20+10).print("[code]");
				if (typeof(vv) == "string")
					Screen.font("16 Arial").purple().as(Lexicon).to(220,i*20+10).print("[macro]");
				if (typeof(vv) != "function")
					Screen.font("16 Arial").blue().as(Lexicon).to(220,i*20+10).print(""+vv);
				++i;
			});
		});
	},
});

var Memory = let(Widget, {
	x: -1480,
	y: 25,
	w: 1140,
	h: 660,
	init: function() { return Screen.widgets.push(this); this.draw(); },
	draw: function() {
		Screen.as(this).gray().frame().style('italic').font("16 Arial");
		Screen.at(this.x,this.y-25).print("Newscript Memory @ " + defed(NS.ip));
		var off = NS.ip / 128;
		for (var i = 0; i < 32; ++i) 
			for (var j = 0; j < 8; ++j)  
				Screen.at(this.x+10+j*140, this.y+i*20+10).print("" + defed(NS.mem[off*128+i*8+j]));
	},
});

Memory.init();
Registers.init();
Lexicon.init();
