// image.js
//
// Copyright(C) 2009 David J. Goehrig
// All Rights Reserved
//
// requires: fundamentals.js, box.js
//

let('Image',Box,{
	init: function(i) {
		var img = Image.clone();
		img.data = $_('img');
		img.data.onload = function() { img.at(0,0).by(img.data.width,img.data.height) };
		img.data.src = i;
		return img;
	},
	at: function(x,y) {
		this.x = x;
		this.y = y;
		return this.clamp(0,0,this.data.width,this.data.height);
	},	
	to: function(x,y) {
		this.x += x;
		this.y += y;
		return this.clamp(0,0,this.data.width,this.data.height);
	},
	by: function(w,h) {
		this.w = w;
		this.h = h;
		return this.clamp(0,0,this.data.width,this.data.height);
	},
});
