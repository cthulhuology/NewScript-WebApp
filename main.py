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
		self.redirect('/html/index.html')

class TutorialHandler(webapp.RequestHandler):
	def get(self):
		tutorials = TutorialPost.all().order('when').fetch(100)
		self.response.out.write("<h4>NewScript Tutorials</h4><dl>")
		for t in tutorials:
			self.response.out.write(Template("""<dt>${title}</dt><dd>${blurb}</dd>""").substitute(title=t.title,blurb=t.blurb))
		self.response.out.write("</dl>")

class TutorialEditorHandler(webapp.RequestHandler):
	def get(self):
		u = users.get_current_user()
		us = NSUser.all().filter('user =',u).fetch(1)
		if not us or us[0].admin != 'true':
			return self.redirect('/')
		self.response.out.write("""<form method="post"><input type="text" name="title" size="120"><textarea name="blurb" rows="20" cols="80"></textarea><input type="submit" value="post"></form>""")
	def post(self):
		u = users.get_current_user()
		us = NSUser.all().filter('user =',u).fetch(1)
		if not us or  us[0].admin != 'true':
			return self.redirect('/')
		TutorialPost(title=self.request.get('title'),blurb=self.request.get('blurb')).put()
		return self.redirect('/')

class DiaryHandler(webapp.RequestHandler):
	def get(self):
		self.response.headers['Content-Type'] = 'text/html'
		title = unquote_plus(self.request.path_info.split('/')[-1])
		diaries = DiaryPost.all().filter('title =',title).fetch(1) 
		for d in diaries:
			self.response.out.write(Template("""<h4>${title}</h4>${blurb}""").substitute(title=d.title,blurb=d.blurb))
	def post(self):
		u = users.get_current_user()
		us = NSUser.all().filter('user =',u).fetch(1)
		if not us or us[0].admin != 'true':
			return self.redirect('/')
		dp = DiaryPost(user=u,title=datetime.datetime.now().strftime('%a %b %d %Y - ') + self.request.get('title'),blurb=self.request.get('blurb'))
		dp.put()
		self.redirect('/')

class DiaryEditorHandler(webapp.RequestHandler):
	def get(self):
		u = users.get_current_user()
		us = NSUser.all().filter('user =',u).fetch(1)
		if not us or us[0].admin != 'true':
			return self.redirect('/')
		self.response.out.write("""
<html><head><title>NewScript.org Diary Editor</title></head><body>
<form action="/diary/" method="POST"><table>
<tr><td><input type="text" name="title" size="120"></td></tr>
<tr><td><textarea name="blurb" cols="120" rows="100"></textarea></td></tr>
<tr><td><p align="right"><input type="submit" value="Publish"></td></tr>
</table></form></body></html>""")

class SidebarHandler(webapp.RequestHandler):
	def get(self):
		self.response.out.write("""
<h4>Main Menu</h4>
<ul>
<li><a href="javascript:goto('home');">NewScript.org</a></li>
<li><a href="/ns/">NewScript Beta</a></li>
<li><a href="javascript:goto('faq');">F.A.Q.</a></li>
<li><a href="javascript:goto('todo');">To Do List</a></li>
<li><a href="javascript:tutorials()">Tutorials</a></li>
<li><a href="javascript:goto('documentation')">Documentation</a></li>
<li><a href="http://groups.google.com/group/newscript-devel">Discussion Group</a></li>
</ul>
<h4>Development News</h4>
<ul>
""")
		titles = DiaryPost.all().order('-when').fetch(25)
		for i in titles:
			self.response.out.write(Template("""
<li><a href="javascript:diary('${id}')">${title}</a></li>""").substitute(id=quote_plus(i.title),title=i.title.split(' -')[0]))
		self.response.out.write("""
</ul>
<h4>Contact</h4>
<ul>
<li><a href="http://blog.dloh.org/">Dave - Project Designer</a></li>
</ul>
""")

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
					('/sidebar/',SidebarHandler),
					('/diary/edit/',DiaryEditorHandler),
					('/diary/.*',DiaryHandler),
					('/tutorials/edit/.*',TutorialEditorHandler),
					('/tutorials/.*',TutorialHandler),
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
