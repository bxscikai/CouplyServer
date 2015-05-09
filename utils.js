var fs = require('fs');
var path = require('path');
var mongoose = require('mongoose');
var apn = require('apn');
var constant = require(global.appRoot + '/constants.js');

var util = {
	loadModels : function() {
		// load all files in models dir
		fs.readdirSync(__dirname + '/models').forEach(function(filename) {
		    if (~filename.indexOf('.js')) 
		    {
		        require(__dirname + '/models/' + filename);
		    }
		});
	},
	sendPushNotification : function(deviceToken, message, payload) 
	{		
		if (apn.conn == null) {
			util.setupPushNotification();
		}

		console.log("Sending push notification to " + deviceToken);

	    var myDevice = new apn.Device(deviceToken);

	    // Create notification
	    var note = new apn.Notification();

	    note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
	    note.badge = 1;
	    note.alert = message;
	    note.payload = payload;
	    note.sound = "default";
	    apn.conn.pushNotification(note, myDevice);

	    console.log("Sent push notification to " + deviceToken);
	},
	setupPushNotification : function() 
	{
	    var options = {
		    'gateway':'gateway.sandbox.push.apple.com',
		    'cert': global.appRoot +'/certs/cert.pem', /* Certificate file path */
		    'key': global.appRoot +'/certs/key.pem', /* Key file path */
		    'passphrase': constant.apns.passphrase,
		    'production': false /* A passphrase for the Key file */
	    };

	    apn.conn = new apn.Connection(options);
	},
	getStringFromEmojiId : function(emojiId) 
	{
		var returnString = "";
		if (emojiId == 1)
			returnString = "Frown";
		else if (emojiId == 2)
			returnString = "Cooking";
		else if (emojiId == 3)
			returnString = "Embarrassed";
		else if (emojiId == 4)
			returnString = "Computer Time";
		else if (emojiId == 5)
			returnString = "Heart";
		else if (emojiId == 6)
			returnString = "Eating";
		else if (emojiId == 7)
			returnString = "Sob";
		else if (emojiId == 8)
			returnString = "Surprise";
		else if (emojiId == 9)
			returnString = "Cool";
		else if (emojiId == 10)
			returnString = "Sleepy";
		else if (emojiId == 11)
			returnString = "Gimme Paw";
		else if (emojiId == 12)
			returnString = "On My Way";
		else if (emojiId == 13)
			returnString = "Workout";
		else if (emojiId == 14)
			returnString = "Smooch";
		else if (emojiId == 15)
			returnString = "Cow Cow";
		else if (emojiId == 16)
			returnString = "Wah";																	
		else if (emojiId == 17)
			returnString = "Busy";																			
		else
			returnString = "Unknown";

		return "[" + returnString + "]";
	}
};

var databaseUtil = function() {

	// Load models
	util.loadModels();

	// Create new instance of DB util
	var dbUtil = {

		checkIfUserExists : function(username, callback) {

			mongoose.model('user').findOne({username: username}, function(err, user) {              
		        callback(user);
			});
		}
	};

	return dbUtil;
}

// Export database util to Util
util.databaseUtil = databaseUtil();

module.exports = util;