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
		i.img = Image.init(img);
		i.path = img;
		i.name = i.label = n;
		i.onMouse('down','move');
		return i.instance();
	},	
	draw: function() {
		if (!this.visible) return;
		Screen.as(this).draw(this.img);
		if (this.label) 
			Screen.as(this).to(this.w/2-this.label.length*4,this.h).font("16px Arial").color(0,0,0).print(this.label);
	},
	down: function(e) { },
	move: function(e) { },
});
