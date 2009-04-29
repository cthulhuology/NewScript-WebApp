// help.js
//
// Copyright (C) 2009 David J. Goehrig
// All Rights Reserved
//

let('Help',{
	init: function() {
		var help = Text.init().at(-15950,16050).by(Display.w-100,Display.h-100);
		help.move = function(e) {},	
		help.get(document.location.href.path() + 'help.txt', function(txt) {
			help.set(txt);
		});
	},
});
