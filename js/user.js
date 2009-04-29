// user.js
//
// Handles User Accounts

var Users = {}

let('User', Button, {
	offset: 0,
	index: 0,
	icon: null,
	messages: [],
	visible: false,
	sticky: true,
	init: function(n,i) {
		var u = User.clone();
		u.index = i;
		u.name = n;
		u.label = false;
		u.img = Users[n] ? Users[n] : Image.init('icons/icon.png');
		u.onMouse('move','down');
		if (! Users[n]) get('user/' + n + '/', function(txt) {
			if (!txt) return;
			var o = txt.unjson();
			u.img = Users[n] = Image.init(o.icon);
		});
		return u.instance();
	},
	draw: function() {
		this.at(Display.w-Display.x-48,25-Display.y+ this.index*80).by(48,48);
		Screen.as(this).draw(this.img);
		if (this.label) 
			Screen.as(this).to(this.w/2-(this.label.length*16),this.h/2).font("16ptGrayItalic.png").print(this.label);
	},
	move: function(e) {
		this.label = this.hit(e) ? this.name : false ;
	},
	down: function (e) {
		if (!this.hit(e)) return;
		if (Channel.channel == this.name) 
			return Channel.visible ? 
				Channel.hide(): 
				Channel.show();
		Channel.channel = this.name;
		Channel.load();
		Channel.show();
	},
});
