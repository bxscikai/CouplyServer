/// <reference path="typings/tsd.d.ts"/>
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var _ = require('underscore');
var fs = require('fs')

global.appRoot = path.resolve(__dirname);

// Setup database
require(global.appRoot+ '/setupDatabase.js')

var constant = require(global.appRoot + '/constants.js');
var util = require(global.appRoot + '/utils.js');
var routes = require(global.appRoot + '/routes/index');
var users = require(global.appRoot + '/routes/users');
var database = require(global.appRoot + '/routes/database');
var chat = require(global.appRoot + '/routes/chats');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hjs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public/files')));

app.use('/', routes);
app.use('/users', users);
app.use('/database', database);
app.use('/chats', chat);
app.use(express.static('public'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

// Schedule jobs to run
var minutes = 60, the_interval = minutes * 60 * 1000;
setInterval(function() {

    // Delete temp files from directory every hour
    fs.readdirSync(constant.database.public_filePath).forEach(function(fileName) {
        console.log("Deleting files from public/files directory");
            fs.unlinkSync(constant.database.public_filePath + "/" + fileName);
    });

}, the_interval);

module.exports = app;
