// fundamentals.js
//
// Copyright (C) 2009 David J. Goehrig
// All Rights Reserved
//
// required by all 
//

var _doc;
var _root;
var _svgns = 'http://www.w3.org/2000/svg';
var _xlinkns = 'http://www.w3.org/1999/xlink';

function start(evt) {
	_doc = evt.target.ownerDocument;
	_root = _doc.documentElement;
	Editor.init();
}

function $(x) {
	return _doc.getElementById(x);
}

function $_(x) {
	return _doc.createElementNS(_svgns,x);
}

Array.prototype.every = function (f) {
	for (var i  = 0; i < this.length; ++i) 
		f(this[i],i);
}

Object.prototype.each = function(f) {
	for (var k in this)
		if (this.hasOwnProperty(k) && k.charAt(0) != "_" && k != 'prototype') 
			f(this[k],k);
}

Object.prototype.let = function(n) {
	var o = {};
	for (var i = 0; i < arguments.length; ++i)
		arguments[i].each(function(v,k) { o[k] = v });
	return o;
}

Object.prototype.walk = function(f) {
	for (var d = this; d; d = d.sibling)
		f(d);
}

Object.prototype.slots = function() {
	var i = 0;
	for (var k in this) 
		if (this.hasOwnProperty(k) && k.charAt(0) != "_" && k != 'prototype') 
			++i;
	return i;
}


Object.prototype.any = function(t) {
	for (var k in this)
		if (t(this[k],k)) 
			return this[k];
	return null;
}

// Let copy/clones objects with prototypes, overrides localstorage, etc.
Object.prototype.can = function(k) {
	if (typeof(this[k]) == "function") return true;
	return false;
}

Object.prototype.isa = function(x) {
	var retval = true;
	var $self = this;
	x.each(function(v,k) {
		if (x.can(k) && !$self.can(k)) 
			return retval = false;
	});
	return retval;
}

Object.prototype.clone = function() {
	var Proto = function () {};
	Proto.prototype = this;
	var retval =  new Proto();
	return retval;
}

Object.prototype.debug = function() {
	var out = "";
	for (var i in this) 
		out += i + "=" +  this[i];	
	alert(out);
}

Array.prototype.last = function() {
	return this[this.length -1 ];
}

Array.prototype.expunge = function (e) {
	for (var i = 0; i < this.length; ++i)
		if ( this[i] == e) 
			this.splice(i,1);	
}

Array.prototype.map = function (f) {
	var retval = [];
	for (var i  = 0; i < this.length; ++i) 
		retval.push(f(this[i]));
	return retval;
}

Array.prototype.reduce = function (f,o) {
	var retval = o;	
	for (var i = 0; i < this.length; ++i)
		retval = f(retval,this[i]);
	return retval;
}

Array.prototype.cons = function(a) {
	retval = [];
	retval.push(a,this);
	return retval;
}

Array.prototype.car = function() {
	return this[0];
}

Array.prototype.cdr = function() {
	return this[1];
}

Array.prototype.member = function(x) {
	for (y = this; y.car(); y = y.cdr()) 
		if (y.car() == x) 
			return true;
	return false;
}


Object.prototype.within = function(a) {
	for (var i = 0; i < a.length; ++i)
		if (this == a[i]) return true;
	return false;
}

function toJson(o,seen) {
	if (!seen) seen = [];
	seen = seen.cons(o);
	var formatter = {
		'boolean' : function(x,l) { return x ? "true" : "false" },
		'function' : function(x,l) { return '"' + x.toString().replace(/"/g,'\\"') + '"' },
		'object' : function (x,l) {
			if (x == null) return "null";
			if (typeof(x.indexOf) == 'function') 
				return "[ " + ( x.map(toJson).join(', ') ) + " ]";
			var retval = [];
			for (var i in x) 
				if (x.hasOwnProperty(i)) 
					retval.push( '"' + i + '": ' + (l.member(x[i]) ? "null" : toJson(x[i],l.cons(x[i]))));
			return '{ ' + retval.join(', ') + ' }';
		},
		'number' : function (x,l) { return '' + x },
		'string' : function (x,l) { return '"' + x + '"' }
	}
	return (formatter[typeof(o)]) ? formatter[typeof(o)](o,seen) : "";
}
Object.prototype.json = function() { return toJson(this); }

Element.prototype.add = function(e) {
	this.appendChild(e);
	return this;
}

Object.prototype.listen = 
Element.prototype.listen = function(e,f) {
	this.addEventListener(e,f,false);
	return this;
}
document.onkeypress = function() { return false }; // Hack to break backspace

Object.prototype.request = function(cb) {
	this._request = XMLHttpRequest ? new XMLHttpRequest(): _doc.createRequest();
	this._request.onreadystatechange = function () {
		if (this.readyState != 4 || typeof(cb) != "function") return;
		if (this.status == 404) cb(null);
		if (this.status == 200) cb(this.responseText);
	};
	return this._request;
}

Object.prototype.post = function(url,cb) {
	var data = (typeof(this) == "string" ) ? this : this.json();
	this.request(cb);
	this._request.open("POST",url,true);
	this._request.setRequestHeader('Content-Type','appliaction/x-www-from-urlencoded');
//	this._request.setRequestHeader('Content-Length',data.length);
//	this._request.setRequestHeader('Connection','close');
	this._request.send(data);
}

Object.prototype.get = function(url,cb) {
	this.request(function(txt) {
		if (typeof(cb) == "function") 
			cb(txt);
	});
	this._request.open("GET",url,true);
	this._request.send("");
};

Object.prototype.download = function() {
	document.location.href = "data:application/json," + escape(this.json());
}

Object.prototype.send = function(channel) {
	this.post(document.location.href.path() + 'channel/' + channel, function(txt) {
		Channel.load();
	});
}

Object.prototype.unjson = function() {
	var tmp = Javascript.evaluator( this.toString() );
	for (var i in tmp) 
		if (tmp.hasOwnProperty(i) && /^(function)/.exec(tmp[i]))
			tmp[i] = Javascript.evaluator(tmp[i]);
	return tmp;
}
String.prototype.last = function() { return this.substring(this.length-1) }
String.prototype.decode = function() { return unescape(this).replace(/\+/g," ") }
String.prototype.path = function () { return this.substr(0,1+this.lastIndexOf('/')) }
String.prototype.hostname = function () { return this.substr(7,this.indexOf('/',7) - 7) }
String.prototype.clean = function() { return this; }
String.prototype.content = function() { return this; }
