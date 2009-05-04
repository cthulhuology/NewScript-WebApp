// keyboard.js
//
// Copyright (C) 2009 David J. Goehrig
// All Rights Reserved
//
// requires: event.js
//

var Keyboard = let(Device, {
	press:  function(e) { Keyboard.dispatch('press',e)  },
	release: function(e) { Keyboard.dispatch('release',e) },
	init: function() {
		_root.listen('keydown',Keyboard.press).listen('keyup',Keyboard.release);
		return this;
	},
	shift: false,
	ctrl: false,
	alt: false,
	cmd: false,
	lcmd: false,
	rcmd: false,
	left: false,
	up: false,
	right: false,
	down: false,
	backspace: false,
	modmap: { 
		8: function (b) { Keyboard.backspace = b; return '' },
		16: function (b) { Keyboard.shift = b; return '' }, 
		17: function (b) { Keyboard.ctrl = b; return '' }, 
		18: function (b) { Keyboard.alt = b; return '' }, 
		91: function (b) { 
			Keyboard.lcmd = b; 
			Keyboard.cmd = Keyboard.lcmd || Keyboard.rcmd; 
			return '' },
		93: function (b) { 
			Keyboard.rcmd = b; 
			Keyboard.cmd = Keyboard.lcmd || Keyboard.rcmd; 
			return '' },
		37: function (b) { Keyboard.left = b; return '' },
		38: function (b) { Keyboard.up = b; return '' },
		39: function (b) { Keyboard.right = b; return '' },
		40: function (b) { Keyboard.down = b; return '' },
	},
	map: function(k,b) {
		if (typeof(Keyboard.modmap[k]) == 'function') return Keyboard.modmap[k](b);
		return typeof(Keyboard.keymap[k]) == 'string' ? Keyboard.keymap[k].charAt(Keyboard.shift ? 1 : 0): '';
	},
});
Keyboard.manage('press','release');

Keyboard.keymap = {
	192: '`~', 49: '1!', 50: '2@', 51: '3#', 52: '4$', 53: '5%', 54: '6^', 55: '7&', 56: '8*', 57 : '9(', 48: '0)',  189: '-_', 187: '=+',
	9: '\t\t', 81: 'qQ', 87: 'wW', 69: 'eE', 82: 'rR', '84' : 'tT', 89: 'yY', 85: 'uU', 73: 'iI', 79: 'oO', 80: 'pP', 219: '[{', 221: ']}', 220: '\\|',
	65: 'aA', 83: 'sS', 68: 'dD', 70: 'fF', 71: 'gG', 72: 'hH', 74: 'jJ', 75: 'kK', 76: 'lL', 186: ';:', 222: '\'"', 13 : '\n',
	16: '', 90: 'zZ', 88: 'xX', 67: 'cC', 86: 'vV', 66: 'bB', 78: 'nN', 77: 'mM', 188: ',<', 190:'.>', 191: '/?',
	17: '', 18: '',	91:'', 32: '  ', 93: '', 37: '', 38: '', 39: '', 40: ''
};
