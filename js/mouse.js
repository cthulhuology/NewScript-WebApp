// mouse.js
//
// Copyright (C) 2009 David J. Goehrig
// All Rights Reserved
//
// requires: event.js
//

let('Mouse',Device);
Mouse.manage('over','move','down','up','wheel','scroll');
Mouse.over = function(e) { Mouse.dispatch('over',e) };
Mouse.move = function(e) { Mouse.dispatch('move',e) };
Mouse.down = function(e) { Mouse.dispatch('down',e) };
Mouse.up = function(e) { Mouse.dispatch('up',e) };
Mouse.wheel = function(e) { Mouse.dispatch('wheel',e) };
Mouse.scroll = function(e) { Mouse.dispatch('scroll',e) };
Mouse.init = function (e) { // Sets up all listeners on the given element id
	e.listen('mouseover',Mouse.over).listen('mousemove',Mouse.move).listen('mousedown',Mouse.down).listen('mouseup',Mouse.up).listen('mousewheel',Mouse.wheel).listen('onscroll',Mouse.scroll);
	return this;
};

