var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
	username     		: String,
	partnerName  		: String,
	pending_partnerName : String,
	deviceToken			: String,
});

mongoose.model('user', userSchema, 'user');