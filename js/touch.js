// touch.js
//
// Copyright (C) 2009 David J. Goehrig
// All Rights Reserved
//

var Touches = [];

var Touch = let(Device,{
	down: function(e) { e.preventDefault();  alert('touchdown ' + e.touches[0].clientX + "," + e.touches[0].clientY); Touch.dispatch('down',e) },
	up: function(e) { e.preventDefault(); Touch.dispatch('up',e) },
	move: function(e) { e.preventDefault(); Touch.dispatch('move',e) },
	init: function() {
		_root.listen('touchstart',Touch.down).listen('touchmove',Touch.move).listen('touchend',Touch.up);
		if (-1 != window.navigator.userAgent.indexOf('iPhone') || -1 != window.navigator.userAgent.indexOf('iPod')) {
			Mouse = Touch;
			Touch.manage('up','down','move');
		}
	},
});

