var mongoose = require('mongoose');
var constant = require(global.appRoot + '/constants.js');

var mongooseDBUrl = constant.database.rootdb_url + constant.database.db_name;

var options = { server:  { socketOptions: { keepAlive: 1 } }, 
                replset: { socketOptions: { keepAlive: 1 } } };

mongoose.connect(mongooseDBUrl, options);