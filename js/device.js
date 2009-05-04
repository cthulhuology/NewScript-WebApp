// device.js
//
// Copyright (C) 2009 David J. Goehrig
// All Rights Reserved
//
// requires: event.js
//

// The Device object is the prototype of all Device stacks, handles dispatching messages to widgets

var Device = let({
	handlers: {},
	manage: function() {
		for (var i = 0; i < arguments.length; ++i)
			this.handlers[arguments[i]] = [];
	},
	dispatch: function(n,e) {
		for (var i in this.handlers[n])
			if (typeof(this.handlers[n][i][n]) == 'function')
				this.handlers[n][i][n](Event.init(e));
	},
	handle: function(e,w) { this.handlers[e].push(w); return this },
	remove: function(e,w) {
		for (var j in this.handlers[e])
			if (this.handlers[e][j] == w) 
				this.handlers[e].splice(j,1);
		return this;
	},
});
