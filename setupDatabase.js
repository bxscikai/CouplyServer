var mongoose = require('mongoose');
var constant = require(global.appRoot + '/constants.js');

var mongooseDBUrl = constant.database.rootdb_url + constant.database.db_name;

mongoose.connect(mongooseDBUrl);