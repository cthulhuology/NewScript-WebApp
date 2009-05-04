// firth.js
//
// Copyright (C) 2009 David J. Goehrig
// All Rights Reserved
//
// This is the Newscript x86 Compiler implemented in Javascript
//

FirthVM = let({
	'ret'  : function() { Compiler.byte(0xc3) },
	'.'    : function() { this.ret() },
	'up'   : function() { Compiler.bytes([ 0x81, 0xc5, 0xff, 0xff, 0xff, 0xff ]) },
	'down' : function() { Compiler.bytes([ 0x81, 0xc5, 1, 0, 0, 0 ]) },
	'nip'  : function() { Compiler.bytes([ 0x8b, 0x14, 0xad, 0, 0, 0, 0 ]); this.down() },
	'drop' : function() { Compiler.bytes([ 0x89, 0xd0 ]); this.nip() },
	','    : function() { this.drop() },
	'push' : function() { Compiler.byte(0x50); this.drop() },
	';'    : function() { this.push() },
	'dup'  : function() { this.up(); Compiler.bytes([ 0x89, 0x14, 0xad, 0, 0, 0, 0, 0x89, 0xc2 ]) },
	'over' : function() { this.dup(); Compiler.bytes([ 0x8b, 0x04, 0xad, 0, 0, 0, 0]) },
	'pop'  : function() { this.dup(); Compiler.byte(0x58) },
	'^'    : function() { this.pop() },
	'util' : function() { Compiler.bytes([ 0x8b, 0x1c, 0xad, 0, 0, 0, 0 ]); this.down() },
	'++'   : function() { Compiler.bytes([ 0x81, 0, 1, 0, 0, 0 ]); this.drop() },
	'--'   : function() { Compiler.bytes([ 0x81, 0, 0xff, 0xff, 0xff, 0xff ]); this.drop() },
	'-'    : function() { Compiler.bytes([ 0xf7, 0xd8 ]) },
	'+'    : function() { Compiler.bytes([ 0x01, 0xd0 ]); this.nip() },
	'*'    : function() { Compiler.bytes([ 0x31, 0xdb, 0x87, 0xd3, 0xf7, 0xeb ]) },
	'/'    : function() { Compiler.bytes([ 0x89, 0xd3, 0x31, 0xd2, 0xf7, 0xfb ]) },
	'*/'   : function() { Compiler.bytes([ 0x89, 0xd3, 0x31, 0xd2, 0xf7, 0xfb ]) },
	'~'    : function() { Compiler.bytes([ 0xf7, 0xd0 ]) },
	'&'    : function() { Compiler.bytes([ 0x21, 0xd0 ]); this.nip() },
	'|'    : function() { Compiler.bytes([ 0x09, 0xd0 ]); this.nip() },
	'\\'   : function() { Compiler.bytes([ 0x31, 0xd0 ]); this.nip() },
	'!#'   : function() { Compiler.bytes([ 0x89, 0xc1 ]) },
	'@#'   : function() { this.dup(); Compiler.bytes([ 0x89, 0xc8 ]) },
	'<<'   : function() { Compiler.bytes([ 0xd3, 0xe0 ]) },
	'>>'   : function() { Compiler.bytes([ 0xd3, 0xe8 ]) },
	'@'    : function() { Compiler.bytes([ 0x8b, 0x04, 0x85, 0,0,0,0 ]) },
	'$'    : function() { this.dup(); Compiler.bytes([ 0x8b, 4, 0xb5, 0,0,0,0, 0x81, 0xc6, 1,0,0,0 ]) },
	'!$'   : function() { Compiler.bytes([ 0x89, 0xc6 ]) },
	'@$'   : function() { Compiler.bytes([ 0x89, 0xf0 ]) },
	'!'    : function() { Compiler.bytes([ 0x89, 0x14, 0x85, 0,0,0,0 ]); this.drop() },
	'%'    : function() { Compiler.bytes([ 0x89, 4, 0xbd, 0,0,0,0, 0x81, 0xc7, 0,0,0,0 ]); this.drop() },
	'!%' : function() { Compiler.bytes([ 0x89, 0xc7 ]) },
	'@%' : function() { Compiler.bytes([ 0x89, 0xf8 ]) },
	'<' : function() { Compiler.bytes([ 0x39, 0xc2, 0x0f, 0x9c, 0xc0, 0x25,1,0,0,0 ]); this.nip() },
	'=' : function() { Compiler.bytes([ 0x39, 0xc2, 0x0f, 0x94, 0xc0, 0x25,1,0,0,0 ]); this.nip() },
	'>' : function() { Compiler.bytes([ 0x39, 0xc2, 0x0f, 0x9f, 0xc0, 0x25,1,0,0,0 ]); this.nip() },
	'<=' : function() { Compiler.bytes([ 0xfd, 0xf3, 0xa5, 0xfc ]) },
	'<-' : function() { Compiler.bytes([ 0xfd, 0xf3, 0xa4, 0xfc ]) },
	'==' : function() { Compiler.bytes([ 0xfc, 0xf3, 0xa6, 0x25, 1,0,0,0 ]) },
	'->' : function() { Compiler.bytes([ 0xfc, 0xf3, 0xa4, ]) },
	'=>' : function() { Compiler.bytes([ 0xfc, 0xf3, 0xa5, ]) },
});

Firth = let({
	words: [],
	strings: {},
	variables: [],
	lexicon: [],
	addr: 0,
	objaddr: 0x1000,
	straddr: 0x2000,	// More string space than we will ever need	
	varaddr: 0x4000,
	compiling: true,
	reset: function() {
		this.words = [];
		this.strings = {};
		this.lexicon = [];
		this.addr = 0;
		this.objaddr = 0x1000;
		this.straddr = 0x2000;
		this.varaddr = 0x4000;
		this.compiling = true;
		return this;
	},
	assemble: function(w,v,t) {
		if (typeof(FirthVM[w]) == 'function') 
			return FirthVM[w]();
		if (typeof(this.find(w,v,this.lexicon)) == 'number')
			return t == '.' ? this.jump(this.find(w,v,this.lexicon)):  // Tail call optimization
				this.call(this.find(w,v,this.lexicon));
		return  this.literal(w);
	},
	call: function(w) { Compiler.byte(0xe8).word(w - this.addr) },
	jump: function(w) { Compiler.byte(0xe9).word(w - this.addr) },
	literal: function(w) { FirthVM.dup(); Compiler.byte(0xb8).word(w) },
	allot: function(n) { this.varaddr += parseInt(n) },
	newobj: function(w,dict) {
		dict.push({ sym: w, obj: {}}) ;
	},
	define: function(w,k,a,dict) { 
		for (var i = dict.length; i;)
			if (dict[--i].sym == w )
				return dict[i].obj[k] = a;	
	},
	find: function(w,v,a) {
		for ( var i = a.length; i;) 
			if ( a[--i].sym == w ) 
				if (typeof(a[i].obj[v]) == "number")
					return a[i].obj[v];
		return undefined;
	},
	parse: function(w) {
		this.words = (typeof(w) == "string") ? w.split(" "): w;
		for (var i = 0; i < this.words.length; ++i) {
			this.assemble(this.words[i],this.words[i+1],this.words[i+2]);
			this.addr = Compiler.addr * 4 + Compiler.indx;
		}
	},
	download: function () {
		document.location.href = "data:octet/stream;base64," + Compiler.compile();
	},
	intern: function(n) {
		if (!this.strings[n]) {
			Compiler.save(this.straddr,0);
			this.strings[n] = this.straddr;
			for (var i = 0; i < n.length; ++i)
				Compiler.byte(n.charCodeAt(i));
			Compiler.restore();
			this.straddr += (n.length >> 3) + 2;
		}
		return this.strings[n];
	},
	compile: function(n,o) {
		Firth.newobj(n,Firth.lexicon);
		Compiler.save(this.objaddr,0);
		Compiler.word(Firth.intern(n)).word(Math.floor(o.slots()));
		o.each(function(v,k) {
			Firth.define(n,k,Firth.addr,Firth.lexicon);
			Compiler.word(Firth.intern(k)).word(Firth.addr);
			Firth.objaddr = Compiler.restore().addr;
			Firth.parse(v);
			Compiler.save(Firth.objaddr,0);
		});
		this.objaddr = Compiler.restore().addr;
		FirthVM.ret();
	},
});
