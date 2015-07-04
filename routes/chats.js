/* global global */
var express = require('express');
var mongoose = require('mongoose');
var util = require(global.appRoot + '/utils.js');
var router = express.Router();
var constant = require(global.appRoot + '/constants.js');
var formidable = require('formidable');
var fs = require('fs');

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

            var numberOfFilesDownloaded = 0;
            var numberOfRequiredDownloads = 0;
            chats.forEach(function(chat) {
                if (chat.emojiId == constant.database.chatAudioId) {
                    numberOfRequiredDownloads++;
                }
            });

            if (numberOfRequiredDownloads == 0)
            {
                res.send({status: constant.status.success, content: chats});
                return;
            }

            // Download the audio files from MongoDB to local server
            chats.forEach(function(chat) {
                if (chat.emojiId == constant.database.chatAudioId)
                {
                    if (!fs.existsSync(constant.database.public_filePath + '/' + chat.timestamp.toString()))
                    {
                        util.readFileFromDB(chat.timestamp.toString(), function() {
                            numberOfFilesDownloaded++;
                            if (numberOfFilesDownloaded == numberOfRequiredDownloads)
                            {
                                res.send({status: constant.status.success, content: chats});
                                return;
                            }
                        });
                    }
                    else
                    {
                        numberOfFilesDownloaded++;
                        if (numberOfFilesDownloaded == numberOfRequiredDownloads)
                        {
                            res.send({status: constant.status.success, content: chats});
                            return;
                        }
                    }
                }
            });
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

    // Perform sanity checks first
    sanityCheckChat(req, function(error) {

        if (error) {
            res.send(error);
            return;
        }

        if (req.query.emojiId == constant.database.chatAudioId) {

            var form = new formidable.IncomingForm();

            form.parse(req, function (err, fields, files) {
                util.saveFileToDB(files.file.path, req.query.timestamp.toString(), function() {

                    saveChatWithParams(req.query, function(error) {

                        if (error)
                        {
                            res.send(error);
                        }
                        else
                        {
                            util.fileExists(req.query.timestamp.toString(),  function(found) {
                                console.log("File: " + req.query.timestamp.toString() + "Exists: " + found);
                                util.readFileFromDB(req.query.timestamp.toString(), function () {
                                    res.send({status: constant.status.success});
                                });
                            });
                        }
                    });
                });
            });
        }
        else
        {
            saveChatWithParams(req.body, function(error) {

                if (error)
                {
                    res.send(error);
                }
                else
                {
                    res.send({status: constant.status.success});
                }
            });
        }
    });
});

function saveChatWithParams(params, completion)
{
    var chatModel = mongoose.model('chat');
    var newChat = new chatModel(params);
    newChat.save(function (err, data) {

        if (err) {
            completion(err);
            return;
        }
        else
        {
            // Send push notification to your partner
            util.databaseUtil.checkIfUserExists(params.receiverName, function (user) {

                if (user.deviceToken != null) {
                    util.sendPushNotification(user.deviceToken, util.getStringFromEmojiId(newChat.emojiId), {
                        "emojiId": newChat.emojiId,
                        "timestamp": newChat.timestamp
                    });
                }
                else {
                    console.log("Partner does not have deviceToken set, cannot send push notification");
                }
                completion();
            });
        }
    });
}

// Complete will be called with error if error occurred
function sanityCheckChat(req, completion)
{
    var reqParam;

    // Determine where the query parameters are coming from
    if (req.query.emojiId == constant.database.chatAudioId)
    {
        reqParam = req.query;
    }
    else
    {
        reqParam = req.body;
    }

    // Body will look like this
    // senderName=Chenkai&receiverName=Min&emojiId=1&timestamp=1425243022
    // Ensure parameters are not null
    if (reqParam.senderName == null || reqParam.receiverName == null || reqParam.timestamp == null) {
        completion({status: constant.status.error, message: constant.messages.chat_set_missingChatParameter});
        return;
    }

    util.databaseUtil.checkIfUserExists(reqParam.senderName, function (user) {
        util.databaseUtil.checkIfUserExists(reqParam.receiverName, function (partner) {
            // User does not exist, error
            if (user == null || partner == null) {
                completion({
                    status: constant.status.error,
                    message: constant.messages.user_setPartner_userOrPartnerDoesNotExist
                });
                return;
            }
            // Sending chat not to your partner, error
            else if (user.partnerName != reqParam.receiverName || partner.partnerName != reqParam.senderName) {
                completion({
                    status: constant.status.error,
                    message: constant.messages.chat_set_cannotChatWithNonPartner
                });
                return;
            }

            // Success
            completion();
        });
    });
}

module.exports = router;
