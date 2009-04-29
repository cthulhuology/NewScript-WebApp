//
// base64.js
// Copyright (C) 2009 David J. Goehrig
// All Rights Reserved
//
String.prototype.encstr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
String.prototype.enc = function() {
	var i = 0;
	var out = "";
	while ( i < this.length) {
		var c = [ this.charCodeAt(i), this.charCodeAt(i+1), this.charCodeAt(i+2) ];
		// alert(c);
		out += this.encstr.charAt(c[0]>>2) + 
			this.encstr.charAt(((c[0]&3)<<4) | ( i+1 < this.length ? (c[1]>> 4) : 0))  +
			this.encstr.charAt(i+1 < this.length ? ((c[1] & 15) <<2) | (c[2] >> 6): 64) +
			this.encstr.charAt(i+2 < this.length ? c[2] & 63 : 64);
		i+= 3;
	}
	return out;
};

String.prototype.pack = function(n) {
	var x = parseInt(n);
	return this + String.fromCharCode(x & 255) + String.fromCharCode((x >> 8) & 255) +
		String.fromCharCode((x >> 16) & 255) + String.fromCharCode((x >> 24) & 255);
};
