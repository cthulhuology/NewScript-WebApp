// compiler.js
// 
// Copyright (C) 2009 David J. Goehrig
// All Rights Reserved
//

let('Compiler',{
	state: [],
	memory: [],
	addr: 0,
	indx: 0,
	msb: false,
	byte: function(b) {
		this.memory[this.addr] = this.memory[this.addr] | ((b&255) << (8*this.indx));
		this.addr += Math.floor((this.indx+1)/4);
		this.indx = (this.indx+1)%4;
		return this;
	},
	short: function(s) {
		this.byte(this.msb ? (s>>8)&255 : s&255);
		this.byte(this.msb ? s&255 : (s>> 8)&255);
		return this;
	},
	word: function(w) {
		this.byte(this.msb ? (w>>24)&255 : w&255);
		this.byte(this.msb ? (w>>16)&255 : (w>>8)&255);
		this.byte(this.msb ? (w>>8)&255 : (w>>16)&255);
		this.byte(this.msb ? w&255 : (w>>24)&255);
		return this;
	},
	bytes: function(a) { for (var i = 0; i < a.length; ++i) this.byte(a[i]) },
	compile: function() {
		var out = "";
		for (var i = 0; i < this.memory.length;++i) out = out.pack(this.memory[i]);
		return out.enc();
	},
	save: function(a,i) {
		this.state.push({ addr: this.addr, indx: this.indx });
		this.addr = a;
		this.indx = i;
	},
	restore: function() {
		var retval = { addr: this.addr, indx: this.indx };
		var s = this.state.pop();
		this.addr = s.addr;
		this.indx = s.indx;
		return retval;
	},
});

