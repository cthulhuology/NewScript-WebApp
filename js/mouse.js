// mouse.js
//
// Copyright (C) 2009 David J. Goehrig
// All Rights Reserved
//
// requires: event.js
//

var Mouse = let(Device, {
	over: function(e) { Mouse.dispatch('over',e) },
	move: function(e) { Mouse.dispatch('move',e) },
	down: function(e) { Mouse.dispatch('down',e) },
	up: function(e) { Mouse.dispatch('up',e) },
	wheel: function(e) { Mouse.dispatch('wheel',e) },
	scroll: function(e) { Mouse.dispatch('scroll',e) },
	init: function () { 
		_root.listen('mouseover',Mouse.over).listen('mousemove',Mouse.move).listen('mousedown',Mouse.down).listen('mouseup',Mouse.up).listen('mousewheel',Mouse.wheel).listen('onscroll',Mouse.scroll);
		 _root.listen('mousewheel',function(e) {
			Display.to(e.wheelDeltaX / 40, e.wheelDeltaY / 40);
	 	});
		return this;
	},
});
Mouse.manage('over','move','down','up','wheel','scroll');
