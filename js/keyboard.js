// keyboard.js
//
// Copyright (C) 2009 David J. Goehrig
// All Rights Reserved
//
// requires: event.js
//

let('Keyboard',Device);
Keyboard.manage('press','release');
Keyboard.press =  function(e) {Keyboard.dispatch('press',e)  };
Keyboard.release = function(e) { Keyboard.dispatch('release',e) };
Keyboard.init = function(e) {
	$(e).listen('keydown',Keyboard.press).listen('keyup',Keyboard.release);
	return this;
};
Keyboard.shift = false;
Keyboard.ctrl = false;
Keyboard.alt = false;
Keyboard.cmd = false;
Keyboard.lcmd = false;
Keyboard.rcmd = false;
Keyboard.left = false;
Keyboard.up = false;
Keyboard.right = false;
Keyboard.down = false;
Keyboard.backspace = false;

// Mac Keyboard
Keyboard.modmap = { 
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
};
Keyboard.fontmap = {
	'0': 0, '1': 1, '2' : 2, '3' : 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, 'a': 10, 'b': 11, 'c': 12, 'd': 13, 'e': 14, 'f': 15,
	'g': 16, 'h': 17, 'i': 18, 'j': 19, 'k': 20, 'l': 21, 'm': 22, 'n': 23, 'o': 24, 'p': 25, 'q': 26, 'r': 27, 's' : 28, 't': 29, 'u': 30, 'v': 31,
	'w': 32, 'x': 33, 'y': 34, 'z': 35, ',': 36, '.': 37, '/': 38, ';': 39, '\'': 40, '[': 41, ']':42, '\\': 43, '`': 44, '-': 45, '=':46, ' ': 47,
	')': 48, '!': 49, '@' : 50, '#' : 51, '$': 52, '%': 53, '^': 54, '&': 55, '*': 56, '(': 57, 'A': 58, 'B': 59, 'C': 60, 'D': 61, 'E': 62, 'F': 63,
	'G': 64, 'H': 65, 'I': 66, 'J': 67, 'K': 68, 'L': 69, 'M': 70, 'N': 71, 'O': 72, 'P': 73, 'Q': 74, 'R': 75, 'S' : 76, 'T': 77, 'U': 78, 'V': 79,
	'W': 80, 'X': 81, 'Y': 82, 'Z': 83, '<': 84, '>': 85, '?': 86, ':': 87, '"': 88, '{': 89, '}':90, '|': 91, '~': 92, '_': 93, '+':94, ' ': 95, '\r': 47, '\t': 47, '\n': 47 //  all white spaces to white space
};
Keyboard.keymap = {
	192: '`~', 49: '1!', 50: '2@', 51: '3#', 52: '4$', 53: '5%', 54: '6^', 55: '7&', 56: '8*', 57 : '9(', 48: '0)',  189: '-_', 187: '=+',
	9: '\t\t', 81: 'qQ', 87: 'wW', 69: 'eE', 82: 'rR', '84' : 'tT', 89: 'yY', 85: 'uU', 73: 'iI', 79: 'oO', 80: 'pP', 219: '[{', 221: ']}', 220: '\\|',
	65: 'aA', 83: 'sS', 68: 'dD', 70: 'fF', 71: 'gG', 72: 'hH', 74: 'jJ', 75: 'kK', 76: 'lL', 186: ';:', 222: '\'"', 13 : '\n',
	16: '', 90: 'zZ', 88: 'xX', 67: 'cC', 86: 'vV', 66: 'bB', 78: 'nN', 77: 'mM', 188: ',<', 190:'.>', 191: '/?',
	17: '', 18: '',	91:'', 32: '  ', 93: '', 37: '', 38: '', 39: '', 40: ''
};
Keyboard.map = function(k,b) {
	if (typeof(Keyboard.modmap[k]) == 'function') return Keyboard.modmap[k](b);
	return typeof(Keyboard.keymap[k]) == 'string' ? Keyboard.keymap[k].charAt(Keyboard.shift ? 1 : 0): '';
}
Keyboard.font = function(c) {
	if (typeof(Keyboard.fontmap[c]) == 'number') return Keyboard.fontmap[c];
	return 47; // return space
}
