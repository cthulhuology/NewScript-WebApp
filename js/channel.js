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
		Channel.at(Display.w-400,25).by(340,250);
		Channel.channel = c;
		Channel.input.setDefault("");
		Channel.input.action = Channel.input.transmit;
		Channel.input.at(Display.w-400,280-Display.y).by(340,80);
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
		Channel.input.draw();
		Channel.input.show();
		Screen.as(Channel).to(0,-25).by(340,20).font("16 Arial").white().print("Chat:");
		Screen.as(Channel).gray().frame();
		Screen.to(10,5).by(340,230);
		if (Channel.offset > Channel.messages.length) Channel.offset = 0;
		Channel.messages.every(function(m,i) {
			if (i < Channel.offset) return;
			if (!m || !m.from || !m.msg) return;
			Screen.black().font("18 Arial").print(m.from + ":").to(10,0);
			Screen.by(320,230).style('italic').gray().font("16 Arial").print(m.msg);
			Screen.at(Display.w-390,Screen.y).by(340,230);
			if (Screen.y > 275) ++Channel.offset
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
