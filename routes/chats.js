/* global global */
var express = require('express');
var mongoose = require('mongoose');
var util = require(global.appRoot + '/utils.js');
var router = express.Router();
var constant = require(global.appRoot + '/constants.js');
var qs = require('querystring');

// Load models
util.loadModels();

/* GET chats */
// [SERVER]/chats/get?username=Chenkai
router.get('/get', function(req, res, next) {
	
	mongoose.model('chat').find({ $or: [{senderName: req.query.username}, 
                                        {receiverName: req.query.username}]}, 
                                        function(err, chats) {              
        if(!err) 
        {
            if (chats.length > constant.database.maxReturnChat) {
                chats = chats.slice(chats.length-constant.database.maxReturnChat, chats.length);    
            }
            res.send({status: constant.status.success, content: chats});
        }

        // Sent notification
        // util.sendPushNotification(constant.apns.deviceToken_min, "Message");
    });  
});

/* SET chat */
// [SERVER]/chats/set

/////////////////////////////////////////////////////////////
// Sample post

// POST /chats/set HTTP/1.1
// Host: localhost:3000
// Cache-Control: max-age=0
// Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8
// User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.2214.111 Safari/537.36
// Accept-Encoding: gzip, deflate, sdch
// Accept-Language: en-US,en;q=0.8
// If-None-Match: W/"73-521294fa"
// Content-Type: application/x-www-form-urlencoded
// Content-Length: 95

// senderName=Chenkai&receiverName=Min&emojiId=10&timestamp=1425243070
/////////////////////////////////////////////////////////////
router.post('/set', function(req, res, next) {

    //console.log("Body: " + JSON.stringify(req.body));
    //console.log("Query: " + JSON.stringify(req.query));
    //console.log("Files: " + JSON.stringify(req.files));

    ///////// Try to get file out /////////

    //if (req.method == 'POST')
    //{
    //    var body = '';
    //    req.on('data', function (data) {
    //        body += data;
    //
    //        // Too much POST data, kill the connection!
    //        if (body.length > 1e6)
    //            req.connection.destroy();
    //    });
    //    req.on('end', function () {
    //        var post = qs.parse(body);
    //
    //         //use post['blah'], etc.
    //    });
    //}

    //////////////////

    // Body will look like this
    // senderName=Chenkai&receiverName=Min&emojiId=1&timestamp=1425243022
    // Ensure parameters are not null
    if (req.body.senderName == null || req.body.receiverName == null || req.body.timestamp == null || req.body.chatType == null)
    {
        res.send({status: constant.status.error, message : constant.messages.chat_set_missingChatParameter});
        return;                
    }

    util.databaseUtil.checkIfUserExists(req.body.senderName, function(user) {
        util.databaseUtil.checkIfUserExists(req.body.receiverName, function(partner){
            // User does not exist, error
            if (user == null || partner == null) 
            {
                res.send({status: constant.status.error, message : constant.messages.user_setPartner_userOrPartnerDoesNotExist});                           
            }
            // Sending chat not to your partner, error
            else if (user.partnerName != req.body.receiverName || partner.partnerName != req.body.senderName) 
            {
                res.send({status: constant.status.error, message : constant.messages.chat_set_cannotChatWithNonPartner});                                           
            }
            // Chat is valid, post chat
            else 
            {
                var chatModel = mongoose.model('chat');
                var newChat = new chatModel(req.body);
                newChat.save(function (err, data) {
                    if (err) console.log(err);
                    else {
                        console.log('Saved : ', data );
                        res.send({status: constant.status.success});
                    } 
                });

                // Send push notification to your partner
                if (partner.deviceToken != null) 
                {
                    util.sendPushNotification(partner.deviceToken, util.getStringFromEmojiId(req.body.emojiId), {"emojiId" : req.body.emojiId, "timestamp" : req.body.timestamp});
                }
                else 
                {
                    console.log("Partner does not have deviceToken set, cannot send push notification");
                }
            }
        });
    });
});

module.exports = router;
