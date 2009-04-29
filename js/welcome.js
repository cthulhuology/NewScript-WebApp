// welcome.js
//
// Copyright (C) 2009 David J. Goehrig
// All Rights Reserved
//

let('Icon',Button, {
	down: function(e) {
		if (this.hit(e)) {
			Welcome.iconpath = this.path;
			Welcome.icon = this.img;
		}
	}
});

let('Welcome',Widget,{
	channels: [],
	users: [],
	channel: false,
	username: false,
	iconpath: "",
	icon: false,
	init: function() {
		get('welcome/',function(txt) {
			var  o = txt.unjson();
			Welcome.channels = o.channels;
			Welcome.users = o.users;
			Welcome.icons = [];
			o.icons.every(function(v,i) {
				Welcome.icons.push(Icon.init(v));
			});
			var b = Box.init().at(Display.w/2 - 232,Display.h/2 - 32).by(464,64);
			Welcome.as(b);
			Welcome.channel = Text.init().setDefault('channel');
			Welcome.username = Text.init().setDefault('username');
			Welcome.button = Button.init("join.png");
			Welcome.icon = Image.init("icons/icon.png");
		});
		return this.onMouse('down','move').instance();
	},
	draw: function() {
		if (!this.visible) return;
		if (! this.channel) return;
		if (! Welcome.channels) Welcome.channels = [];
		var b = Box.init().at(Display.w/2-232,25).by(232,Welcome.channels.length*20);
		Screen.as(b).print('Users:');
		Screen.as(b).to(0,20).gray().frame();
		Welcome.users.every(function(u,i) {
			Screen.as(b).to(0,20+i*20).print(u);
		});
		Welcome.userbox = Box.init().as(b);
		b.to(232,0);
		Screen.as(b).print('Channels:');
		b.to(0,20);
		Welcome.channelbox = Box.init().as(b);
		Screen.as(b).gray().frame();
		Welcome.channels.every(function(c,i) {
			Screen.as(b).print(c);
			b.to(0,20);
		});
		b.to(-232,20).by(464,64);
		Screen.as(b).gray().frame();
		if (this.icon) Screen.to(8,8).by(48,48).draw(this.icon);
		if (this.button) this.button.at(b.x,b.y).to(364,64).draw();
		Screen.as(b).to(64,10).print("User:");
		this.username.as(b).to(200,10).by(250,20);
		Screen.as(b).to(64,30).print("Channel:");
		this.channel.as(b).to(200,30).by(250,20);
		this.hitbox = Box.init().as(b).to(364,30);
		b.to(0,100);
		Welcome.icons.every(function(x,i) {
			x.as(b);
			b.to(100,0);
			if (i % 5 == 4) b.to(-500,50);
		});
	},
	down: function(e) {
		if (Welcome.channelbox && Welcome.channelbox.hit(e)) {
			Welcome.channel.set(Welcome.channels[Math.floor((e.y-Welcome.channelbox.y)/20)]);
			return;
		}
		if (Welcome.userbox && Welcome.userbox.hit(e)) {
			Welcome.username.set(Welcome.users[Math.floor((e.y-Welcome.channelbox.y)/20)]);
			get('user/' + Welcome.username.content() + '/', function(txt) {
				if (!txt) {
					Welcome.iconpath = 'icons/icon.png'
					Welcome.icon = Image.init('icons/icon.png');
					return;
				}
				var o = txt.unjson();
				Welcome.iconpath = o.icon;
				Welcome.icon = Image.init(o.icon);
			});
			return;	
		}
		if (Welcome.hitbox && Welcome.hitbox.hit(e)) {
			if (Welcome.login()) return;
			alert("Login failed");
			return;
		}
	},
	login: function() {
		Editor.user = { 
			name: Welcome.username.content(), 
			icon: Welcome.iconpath.content(), 
			loggedin: true,
		};
		Channel.init(Welcome.channel.content());
		Inventory.load();
		Editor.online();
		this.release();
		NS.show();
		return true;
	},
	release: function() {
		this.icons.each(function(v,k) { v.release() });
		this.channel.release();
		this.username.release();
		this.button.release();
		this.remove();		
		return this;
	},
});
