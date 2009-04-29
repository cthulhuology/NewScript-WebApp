// event.js
//
// Copyright (C) 2009 David J. Goehrig
// All Rights Reserved
//
// requires: screen.js
//

// The Event object is the prototype for all event messages
let('Event',{
	key: 0,
	x: 0, y: 0, w: 0, h: 0,
	dx: 0, dy: 0,
	init: function(e) {
		var ev = Event.clone();
		ev.key = Keyboard.map(e.keyCode, e.type == 'keydown');
		ev.x = e.clientX - Display.x;
		ev.y = e.clientY - Display.y;
		ev.dx = e.wheelDeltaX / 40;
		ev.dy = e.wheelDeltaY / 40;
		return ev;
	},
});
