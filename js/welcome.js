// welcome.js
//
// Copyright (C) 2009 David J. Goehrig
// All Rights Reserved
//

let('Icon',Button, {
	down: function(e) {
		if (this.hit(e)) 
			Welcome.icon = this.img;
	}
});

let('Welcome',Widget,{
	icons: [],
	icon: false,
	button: false,
	init: function() {
		this.hide();
		get('welcome/',function(txt) {
			if (!txt) return;
			var  o = txt.unjson();
			Welcome.icons = [];
			if (o.user) {
				Welcome.icon = Image.init(o.user); 
				Welcome.login();
				return;
			}
			o.icons.every(function(v,i) { Welcome.icons.push(Icon.init(v)) });
			Welcome.show();
		});
		this.at(Display.w/2 - 232,Display.h/2 - 32).by(464,64);
		this.button = Button.init("/images/join.png");
		this.button.down = function(e) {
			if (this.hit(e)) 
				Welcome.register();
		};
		this.icon = Image.init("/icons/icon.png");
		return this.onMouse('down','move').instance();
	},
	draw: function() {
		if (!this.visible) return;
		var b = Box.init().as(this);
		Screen.as(b).gray().frame();
		if (this.icon) Screen.to(8,8).by(48,48).draw(this.icon);
		if (this.button) this.button.at(b.x,b.y).to(364,64).by(100,30);
		Screen.as(b).to(64,10).print(Username);
		Screen.as(b).to(64,30).print("please select an icon:");
		b.to(0,100);
		Welcome.icons.every(function(x,i) {
			x.as(b);
			b.to(100,0);
			if (i % 5 == 4) b.to(-500,50);
		});
	},
	register: function() {
		get('/ns/register/?icon=' + Welcome.icon.path, function(txt) {
			if (!txt) return;
			Welcome.login();
		});
	},
	login: function() {
		Editor.user = { 
			name: Username,
			icon: Welcome.icon.path,
			loggedin: true,
		};
		Channel.init(UserID);
		Inventory.load();
		Welcome.release();
		NS.show();
		return true;
	},
	release: function() {
		this.icons.each(function(v,k) { v.release(); v.hide() });
		this.button.release();
		this.remove();		
		return this;
	},
});
