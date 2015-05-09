var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var chatSchema = new Schema({
	senderName 	 : String,
	receiverName : String,
	emojiId 	 : Number,
	timestamp 	 : Number
});

mongoose.model('chat', chatSchema, 'chat');