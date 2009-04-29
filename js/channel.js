// channel.js
//
// Copyright (C) 2009 David J. Goehrig
// All Rights Reserved
//

let('ChannelIcon',Button,{
	sticky: true,
	visible: true,
	move: function(e) {
		this.label = this.hit(e) ? this.name : false ;
	},
	down: function(e) {
		if (!this.hit(e)) return;
		if (Channel.channel == this.name)
			return Channel.visible ? 
				Channel.hide():	
				Channel.show();
		Channel.channel = this.name;
		Channel.load();
		Channel.show();
	},
	draw: function() {
		this.at(-Display.x+25+this.index*100,Display.h-Display.y-80).by(48,48);
		Screen.as(this).draw(this.img);
		if (this.label) 
			Screen.as(this).to(this.w/2-(this.label.length*8),this.h/2).font("16ptGrayItalic.png").print(this.label);
	},
});

let('Channel',Widget,{
	count: 0,
	visible: true,
	sticky: true,
	channel: "",
	messages: [],
	channels: [],
	offset: 0,
	init: function(c) {
		Channel.instance();
		Channel.channel = c;
		Channel.input.setDefault("");
		Channel.input.action = Channel.input.transmit;
		Screen.schedule(Channel);
		Channel.load();
		get('channels/',function(txt) {
			if (!txt) return;
			var c = txt.unjson();
			c.every(function(o,i) {
				var x = ChannelIcon.init(o.icon,o.channel);
				x.index = i;
				Channel.channels.push(x);
			});
		});
	},
	input: Text.init().hide().setDefault(""),
	timer: function() {
		++Channel.count;
		if (!Channel.count % Screen.delay * 60)
			Channel.load();
	},
	draw: function () {
		if (!this.visible) return;
		Channel.input.sticky = true;
		Channel.input.at(Display.w-Display.x-400,300-Display.y).by(340,80);
		Channel.input.hide();
		Screen.at(Display.w-Display.x-400,25-Display.y).by(340,20).font("16ptGrayItalic.png").print("Chat: " + Editor.user.name + '@' + (Channel.channel ? Channel.channel : ''));
		Screen.at(Display.w-Display.x-400,45-Display.y).by(340,250).frame();
		Screen.at(Display.w-Display.x-395,50-Display.y).by(340,230);
		Channel.input.show();
		if (Channel.offset > Channel.messages.length) Channel.offset = 0;
		Channel.messages.every(function(m,i) {
			if (i < Channel.offset) return;
			Screen.font("16ptBlackBold.png").print(m.from + ":");
			Screen.by(Screen.w-m.from.length*20-20,Screen.h).font("16ptGrayItalic.png").print(m.msg);
			Screen.at(Display.w-Display.x-400,Screen.y-Display.y+20).by(340,230);
			if (Screen.y > 295) ++Channel.offset
		});
	},
	load: function () {
		if (! Channel.channel) return;	
		Inventory.load();
		get(document.location.href.path() + 'channel/' + Channel.channel + '.json', function(txt) {
			Channel.messages = ("[" + txt + "]").unjson();
		});				
	},
});
