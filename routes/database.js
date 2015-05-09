var express = require('express');
var mongoose = require('mongoose');
var util = require('../utils.js');
var router = express.Router();

// Load models
util.loadModels();

/* GET Users page */
router.get('/users', function(req, res, next) {

  // Get users
  mongoose.model('user').find(function(err, users) {

  	res.render('users', { title: 'Mongo DB Users Table',
  						  users: users
  						 });  
  });
});

/* GET chats page */
router.get('/chats', function(req, res, next) {

  // Get users
  mongoose.model('chat').find(function(err, chats) {

  	console.log("Chats: " + chats);
  	res.render('chats', { title: 'Mongo DB Chats Table',
  						  chats: chats
  						 });  
  });
});

module.exports = router;
