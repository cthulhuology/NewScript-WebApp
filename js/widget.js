// widgets.js
//
// Copyright (C) 2009 David J. Goehrig
// All Rights Reserved
//
// requires: screen.js, box.js
//

var Widget = let(Box, {
	drawn: false,
	visible: true,
	events: { keyboard: [], mouse: [] },
	draw: function() {},
	init: function() { return this.clone() },
	remove: function() {
		var $self = this;
		this.hide();
		this.events.keyboard.every(function(v,i) { $self.offKey(v); });
		this.events.mouse.every(function(v,i) { $self.offMouse(v); });
		Screen.widgets.expunge(this);
		return this;
	},
	release: function() { 	// Override this method, not remove for adding custom code
		return this.remove();
	},
	instance: function() {
		Screen.widgets.push(this);
		this.draw();
		return this;
	},	
	restore: function() { // Override this method, not instance for adding custom code
		return this.instance();
	},
	show: function () { this.visible = true; return this },
	hide: function () { this.visible = false; return this },
	onKey: function() { 
		for (var i = 0; i < arguments.length; ++i) {
			this.events.keyboard.push(arguments[i]);
			Keyboard.handle(arguments[i],this); 
		}
		return this;
	},
	offKey: function() { 
		for (var i = 0; i < arguments.length; ++i) {
			this.events.keyboard.expunge(arguments[i]);
			Keyboard.remove(arguments[i],this); 
		}
		return this;
	},
	onMouse: function() { 
		for (var i = 0; i < arguments.length; ++i) {
			this.events.mouse.push(arguments[i]);
			Mouse.handle(arguments[i],this); 
		}
		return this;
	},
	offMouse: function() { 
		for (var i = 0; i < arguments.length; ++i){
			this.events.mouse.expunge(arguments[i]);
			Mouse.handle(arguments[i],this); 
		}
		return this;
	},
});
