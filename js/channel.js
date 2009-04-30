// channel.js
//
// Copyright (C) 2009 David J. Goehrig
// All Rights Reserved
//

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
			c.each(function(o,i) {
				var x = User.init(o);
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
		Channel.input.hide();
		if (!this.visible) return;
		Channel.input.at(Display.w-Display.x-400,300-Display.y).by(340,80).draw();
		Channel.input.show();
		Screen.at(Display.w-Display.x-400,25-Display.y).by(340,20).font("/images/16ptGrayItalic.png").print("Chat:");
		Screen.at(Display.w-Display.x-400,45-Display.y).by(340,250).frame();
		Screen.at(Display.w-Display.x-395,50-Display.y).by(340,230);
		if (Channel.offset > Channel.messages.length) Channel.offset = 0;
		Channel.messages.every(function(m,i) {
			if (i < Channel.offset) return;
			if (!m || !m.from || !m.msg) return;
			Screen.font("/images/16ptBlackBold.png").print(m.from + ":").to(-m.from.length*16,20);
			Screen.by(Screen.w-40,Screen.h).font("/images/16ptGrayItalic.png").print(m.msg);
			Screen.at(Display.w-Display.x-400,Screen.y-Display.y+20).by(340,230);
			if (Screen.y > 295) ++Channel.offset
		});
	},
	load: function () {
		if (! Channel.channel) return;	
		Inventory.load();
		get(document.location.href.path() + 'channel/' + Channel.channel, function(txt) {
			Channel.messages = ("[" + txt + "]").unjson();
		});				
	},
});
