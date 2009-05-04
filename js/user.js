// user.js
//
// Handles User Accounts

var Users = {}

var User = let(Button, {
	offset: 0,
	index: 0,
	icon: null,
	messages: [],
	visible: false,
	sticky: true,
	id: 0,
	init: function(n,i) {
		var u = User.clone();
		u.index = i;
		u.id = n;
		u.name = '';
		u.label = false;
		u.img = Image.init('/icons/icon.png');
		u.onMouse('move','down');
		if (! Users[n]) get('/ns/user/' + n, function(txt) {
			if (!txt) return;
			var o = txt.unjson();
			u.img = Users[n] = Image.init(o.icon);
			u.name = o.name;
			u.id = o.id;
		});
		return u.instance();
	},
	draw: function() {
		this.at(Display.w-48,25+ this.index*80).by(48,48);
		Screen.as(this).draw(this.img);
		if (this.label) 
			Screen.as(this).to(this.w/2-(this.label.length*16),this.h/2).gray().style('italic').font("16px Arial").print(this.label);
	},
	move: function(e) {
		this.label = this.hit(e) ? this.name : false ;
	},
	down: function (e) {
		if (!this.hit(e)) return;
		if (Channel.channel == this.id) 
			return Channel.visible ? 
				Channel.hide(): 
				Channel.show();
		Channel.channel = this.id;
		Channel.load();
		Channel.show();
	},
});
