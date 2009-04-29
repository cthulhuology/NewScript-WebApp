#!/usr/bin/env python
#
# Copyright 2007 Google Inc.
#

import wsgiref.handlers
from google.appengine.ext import webapp
from google.appengine.ext import db

class DiaryPost(db.Model):
	title = db.StringProperty(required=True)
	when = db.DateTimeProperty(required=True)
	user = db.UserProperty(required=True)
	blurb = db.TextProperty(required=True)

class NSBox(db.Model):
	x = db.IntegerProperty()
	y = db.IntegerProperty()
	w = db.IntegerProperty()
	h = db.IntegerProperty()

class NSDefinition(db.Model):
	title = db.StringProperty()
	name = db.StringProperty(required=True)
	code = db.TextProperty(required=True)
	comment = db.TextProperty()
	when = db.DateTimeProperty(required=True)
	sibling = db.ReferenceProperty(NSDefinition)
	box = db.ReferenceProperty(NSBox)

class NSText(db.Model):
	content = db.TextProperty()
	box = db.RefrenceProperty(NSBox)

class IndexHandler(webapp.RequestHandler):
	def get(self):
		self.redirect('/html/index.html')

class DiaryHandler(webapp.RequestHandler):
	def get(self):
		
	def post(self):

class SidebarHandler(webapp.RequestHandler):
	def get(self):
			

class WelcomeHandler(webapp.RequestHandler):
	def get(self):
		self.response.headers['Content-Type'] = 'text/json'
		self.response.out.write("""{ channels: [], users: [], icons: [] }""")

class AppHandler(webapp.RequestHandler):
	sources = [ 'fundamentals','storage','box','widget','device','keyboard','mouse','display',
		'image','button','screen','text','event','base64','compiler','firth','definition',
		'javascript','newscript','user','welcome','channel','inventory','help','editor' ]
	images = [ '16ptRed','16ptGreen','16ptYellow','16ptOrange','16ptBlue','16ptBlack','16ptPurple',
		'16ptBlackBold','16ptGray','16ptGrayItalic','login','register','join','ns','compile','reset']
	icons = [ 'icon','dave','bugs','u1','u2','u3','u4','u5' ]
	def get(self):
		self.response.headers['Content-Type'] = 'text/html'
		self.response.out.write("""
<html manifest="manifest">
<head>
<title>NewScript</title>""")
		for i in sources:
			self.response.out.write("""<script language="javascript" src="/js/""" + i + """.js"></script>""")
		self.response.out.write("""<style>
#screen {
	position: absolute;
	background-color: white;
	top: 0px;
	left: 0px;
}
</style>
</head>
<body onload="Editor.init()">
<canvas id="screen"></canvas>""")
		for i in images:	
			self.response.out.write("""<img src="/images/""" + i + """.png" width="0" height="0" />""")
		for i in icons:
			self.response.out.write("""<img src="/icons/""" + i + """.png" width="0" height="0" />""")
		self.response.out.write("""</body></html>""")

def main():
	application = webapp.WSGIApplication([
					('/', IndexHandler),
					('/sidebar',SidebarHandler),
					('/diary/',DiaryHandler),
					('/ns/', AppHandler),
					('/welcome/',WelcomeHandler)],
                                       debug=True)
	wsgiref.handlers.CGIHandler().run(application)


if __name__ == '__main__':
  main()
