// button.js
//
// Copyright (C) 2009 David J. Goehrig
// All Rights Reserved
//

var Button = let(Widget,{
	img: null,
	label: false,
	name: false,
	init: function(img,n) {
		var i = this.clone();
		i.path = img;
		i.img = Image.init(img);
		i.name = i.label = n;
		i.onMouse('down','move');
		return i.instance();
	},	
	draw: function() {
		if (!this.visible) return;
		Screen.as(this).draw(this.img);
		if (this.label) 
			Screen.as(this).font('16 Arial').to(this.w/2-this.label.length*4,this.h).color(0,0,0).print(this.label);
	},
	down: function(e) { },
	move: function(e) { },
});
