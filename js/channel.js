// channel.js
//
// Copyright (C) 2009 David J. Goehrig
// All Rights Reserved
//

var Channel = let(Widget,{
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
		get('/ns/channels/',function(txt) {
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
		Channel.at(Display.w-400,25).by(390,250);
		Channel.input.at(Display.w-400,300-Display.y).by(340,80).draw();
		Channel.input.show();
		Screen.at(Display.w-400,25).by(340,20).font("16px Arial").print("Chat:");
		Screen.at(Display.w-400,45).by(340,250).frame();
		Screen.at(Display.w-395,50).by(340,230);
		if (Channel.offset > Channel.messages.length) Channel.offset = 0;
		Channel.messages.every(function(m,i) {
			if (i < Channel.offset) return;
			if (!m || !m.from || !m.msg) return;
			Screen.black().font("18px Arial").print(m.from + ":").to(10,20);
			Screen.by(Screen.w-40,Screen.h).style('italic').gray().font("16px Arial").print(m.msg);
			Screen.at(Display.w-400,Screen.y+20).by(340,230);
			if (Screen.y > 295) ++Channel.offset
		});
	},
	load: function () {
		if (! Channel.channel) return;	
		Inventory.load();
		get('/ns/channel/' + Channel.channel, function(txt) {
			Channel.messages = ("[" + txt + "]").unjson();
		});				
	},
});
