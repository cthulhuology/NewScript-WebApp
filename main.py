#!/usr/bin/env python
#
# Copyright 2007 Google Inc.
#

###
# Imports
from urllib import quote_plus 
from urllib import unquote_plus
import uuid
import datetime
from string import Template
import wsgiref.handlers
from google.appengine.api import users
from google.appengine.ext import webapp
from google.appengine.ext import db

###
# Resources
sources = [ 'fundamentals','storage','box','widget','device','keyboard','mouse','touch','display',
	'image','button','screen','text','event','base64','compiler','firth','definition',
	'javascript','newscript','user','welcome','channel','inventory','help','editor' ]

images = [ '16ptRed','16ptGreen','16ptYellow','16ptOrange','16ptBlue','16ptBlack','16ptPurple',
	'16ptBlackBold','16ptGray','16ptGrayItalic','login','register','join','ns','compile','reset','define']

icons = [ 'icon','dave','bugs','u1','u2','u3','u4','u5' ]

###
# Classes

class NSUser(db.Model):
	id = db.StringProperty(required=True)
	user = db.UserProperty(required=True)
	icon = db.StringProperty(required=True)	
	when = db.DateTimeProperty(required=True,auto_now=True)
	admin = db.StringProperty(required=True)

class NSChannelMsg(db.Model):
	id = db.StringProperty(required=True)
	user = db.UserProperty(required=True)
	msg = db.TextProperty(required=True)
	when = db.DateTimeProperty(required=True,auto_now=True)

class DiaryPost(db.Model):
	title = db.StringProperty(required=True)
	when = db.DateTimeProperty(required=True,auto_now=True)
	user = db.UserProperty(required=True)
	blurb = db.TextProperty(required=True)

class TutorialPost(db.Model):
	title = db.StringProperty(required=True)
	when = db.DateTimeProperty(required=True,auto_now=True)
	blurb = db.TextProperty(required=True)

class NSBox(db.Model):
	x = db.IntegerProperty()
	y = db.IntegerProperty()
	w = db.IntegerProperty()
	h = db.IntegerProperty()

class NSDefinition(db.Model):
	cid = db.StringProperty(required=True)
	oid = db.StringProperty(required=True)
	title = db.StringProperty(required=True)
	code = db.TextProperty(required=True)
	when = db.DateTimeProperty(required=True,auto_now=True)
	
class NSText(db.Model):
	box = db.ReferenceProperty(NSBox)
	when = db.DateTimeProperty(required=True,auto_now=True)
	content = db.TextProperty()

###
# Handler Classes

class IndexHandler(webapp.RequestHandler):
	def get(self):
		self.redirect('/ns/')

class WelcomeHandler(webapp.RequestHandler):
	def get(self):
		self.response.headers['Content-Type'] = 'text/json'
		self.response.out.write("""{ icons: [""")
		for i in icons:
			self.response.out.write(Template("""'/icons/${icon}.png',""").substitute(icon=i))
		self.response.out.write("], ")
		u = NSUser.all().filter('user =', users.get_current_user()).fetch(1)
		if u :
			self.response.out.write(Template("""user: '${icon}'""").substitute(icon=u[0].icon))
		self.response.out.write("}")

class InventoryHandler(webapp.RequestHandler):
	def get(self):
		id = self.request.path_info.split('/')[-1]
		objs = NSDefinition.all().filter('cid =',id).order('when').fetch(1000)
		self.response.out.write("[")
		for o in objs:
			self.response.out.write(Template("""{ id: '${id}', title: '${title}' },""").substitute(id=o.oid,title=o.title))
		self.response.out.write("]")
			
class ObjectHandler(webapp.RequestHandler):
	def get(self):
		id = self.request.path_info.split('/')[-1]
		ds = NSDefinition.all().filter("oid =",id).order('-when').fetch(1)
		for d in ds:
			self.response.out.write(d.code)	
	def post(self):
		(id,title,when) = self.request.path_info.split('/')[-3:]
		d = NSDefinition(
			cid=id,
			oid=str(uuid.uuid4()),
			title=title,
			code=self.request.body)
		d.put()

class ChannelHandler(webapp.RequestHandler):
	def get(self):
		id = self.request.path_info.split('/')[-1]
		msgs = NSChannelMsg.all().filter("id = ",id).order("-when").fetch(12)
		msgs.reverse()
		for m in msgs:
			self.response.out.write(m.msg + ",")
	def post(self):
		id = self.request.path_info.split('/')[-1]
		m = NSChannelMsg(id=id,user=users.get_current_user(),msg=self.request.body)
		m.put()

class ListingHandler(webapp.RequestHandler):
	def get(self):
		us = NSUser.all().fetch(20)
		self.response.out.write("[")
		for u in us:
			self.response.out.write("'" + u.id + "',")	
		self.response.out.write("]")

class UserHandler(webapp.RequestHandler):
	def get(self):
		id = self.request.path_info.split('/')[-1]
		u = NSUser.all().filter("id = ",id).fetch(1)
		if u:
			self.response.out.write(Template("""{ id: '${id}', name: '${name}', icon: '${icon}' }""").substitute(id=u[0].user.user_id(),name=u[0].user.nickname(),icon=u[0].icon))
		
		

class RegisterHandler(webapp.RequestHandler):
	def get(self):
		u = NSUser(
			id=users.get_current_user().user_id(),
			user=users.get_current_user(), 
			icon=self.request.GET['icon'],
			admin='false')
		db.put(u)
		self.response.out.write("""true""")

class HelpHandler(webapp.RequestHandler):
	def get(self):
		self.redirect('/html/help.txt')

class AppHandler(webapp.RequestHandler):
	def get(self):
		user = users.get_current_user()
		if not user:
			return self.redirect(users.create_login_url(self.request.uri))
		self.response.headers['Content-Type'] = 'image/svg+xml'
		self.response.out.write(Template("""
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
version="1.2" baseProfile="tiny" onload="start(evt)" width="100%" height="100%">
<script>
var Username = '${username}';
var UserID = '${userid}';
</script>""").substitute(userid=user.user_id(),username=user.nickname()))
		for i in sources:
			self.response.out.write("""<script type="text/ecmascript" xlink:href="/js/""" + i + """.js" />""")
		self.response.out.write("""</svg>""")

###
# Main Application

def main():
	application = webapp.WSGIApplication([
					('/', IndexHandler),
					('/ns/', AppHandler),
					('/ns/help/', HelpHandler),
					('/ns/welcome/',WelcomeHandler),
					('/ns/objects/.*',InventoryHandler),
					('/ns/object/.*',ObjectHandler),
					('/ns/store/.*',ObjectHandler),
					('/ns/channel/.*',ChannelHandler),
					('/ns/channels/', ListingHandler),
					('/ns/register/.*', RegisterHandler),
					('/ns/user/.*',UserHandler),
					],
                                       debug=True)
	wsgiref.handlers.CGIHandler().run(application)


if __name__ == '__main__':
  main()
