var express = require('express');
var mongoose = require('mongoose');
var util = require(global.appRoot + '/utils.js');
var router = express.Router();
var constant = require(global.appRoot + '/constants.js');

// Load models
util.loadModels();

/* GET users listing. */
// [SERVER]/users/get?username=Chenkai
router.get('/get', function(req, res, next) {
	
	mongoose.model('user').find({username: req.query.username}, function(err, users) {              

		var userModel = mongoose.model('user');

        if (users.length==0) 
        {
        	// If the user doesn't exist, create the user
        	var newUser = new userModel({ username : req.query.username, deviceToken: req.query.deviceToken});
        	newUser.save(function (err, data) {
				if (err) console.log(err);
				else console.log('Saved : ', data );
        	});
        	res.send({status: constant.status.success,
        			  message: constant.messages.user_get_newUserCreated,
        			  content: newUser
        			 });   	
        }
        else
        {
	    	var user = users[0];

	    	// Update user deviceToken
	    	if (req.query.deviceToken != null && req.query.deviceToken.length > 0) 
	    	{
	    		userModel.update({_id : user._id}, {$set: { deviceToken: req.query.deviceToken }}, {upsert: false}, function(err){});
	    	}
	    	// Send success
        	res.send({status: constant.status.success,
        			  message: constant.messages.user_get_existingUserValid,
        			  content: user
        			 }); 
        }
    });  
});

/* SET user partner */
// [SERVER]/users/setPartner?username=Chenkai&partnerName=Min
router.get('/setPartner', function(req, res, next) {
	
	// Check that the user and the partner exists
	util.databaseUtil.checkIfUserExists(req.query.username, function(user) {
		util.databaseUtil.checkIfUserExists(req.query.partnerName, function(partner){

			// Either user or partner doesn't exist, return error
			if (user==null || partner==null) 
			{
		    	res.send({status: constant.status.error,
		    			  message: constant.messages.user_set_userOrPartnerDoesNotExist
		    			 }); 		
			}
			else 
			{
				// The user you tried to set request already have a partner
				if (partner.partnerName != null)
				{
			    	res.send({status: constant.status.error,
			    			  message: constant.messages.user_setPartner_partnerUserAlreadyHavePartner
			    			 }); 					
				}
				else
				{
					mongoose.model('user').findOneAndUpdate(/* Find Query */   {username: req.query.partnerName}, 
															/* Update Query */ {pending_partnerName: req.query.username }, 
											function(err) {
												if (err != null) 
												{
											    	res.send({status: constant.status.error,
											    		message : err});
												}
												else 
												{
											    	res.send({status: constant.status.success}); 															
											    }
											});
				}
			}
		});
	});
});

/* ApprovePartner */
// [SERVER]/users/approvePartner?username=Chenkai&partnerName=Min
router.get('/approvePartner', function(req, res, next) {
	
	// Check that the user and the partner exists
	util.databaseUtil.checkIfUserExists(req.query.username, function(user) {
		util.databaseUtil.checkIfUserExists(req.query.partnerName, function(partner){

			// Either user or partner doesn't exist, return error
			if (user==null || partner==null) 
			{
		    	res.send({status: constant.status.error,
		    			  message: constant.messages.user_setPartner_userOrPartnerDoesNotExist
		    			 }); 		
			}
			else 
			{
				mongoose.model('user').findOne(/* Find Query */   {username: req.query.username}, function(err, user) {
					if (err != null) 
					{
				    	res.send({status: constant.status.error, message : err});
					}
					else 
					{
						if (user.pending_partnerName == req.query.partnerName) {							
							setPartner(req.query.username, req.query.partnerName, res);
						}				    	
						else {
				    		res.send({status: constant.status.error, message : constant.messages.user_approvePartner_didNotApprovePendingUser});
						}
				    }				    
				});
			}
		});
	});
});

/* removePartner */
// [SERVER]/users/removePartner?username=Chenkai
router.get('/removePartner', function(req, res, next) {
	
	// Check that the user and the partner exists
	util.databaseUtil.checkIfUserExists(req.query.username, function(user) {

		// User doesn't exist, return error
		if (user==null) 
		{
	    	res.send({status: constant.status.error,
	    			  message: constant.messages.user_setPartner_userOrPartnerDoesNotExist
	    			 }); 		
		}
		else 
		{
			mongoose.model('user').findOneAndUpdate(/* Find Query */   {username: req.query.username}, 
													/* Update Query */ {partnerName: null }, function(err) {
				if (err != null) 
				{
			    	res.send({status: constant.status.error,
			    		message : err});
				}
				else 
				{
			    	res.send({status: constant.status.success}); 															
			    }											
			});
		}
	});
});

// Set the user's partner mutally
function setPartner(username, partnerName, res)
{
	mongoose.model('user').findOneAndUpdate(/* Find Query */   {username: username}, 
											/* Update Query */ {partnerName: partnerName, pending_partnerName: null }, function(err) {
			mongoose.model('user').findOneAndUpdate(/* Find Query */   {username: partnerName}, 
											/* Update Query */ {partnerName: username, pending_partnerName: null }, function(err) {														
		if (err != null) 
		{
	    	res.send({status: constant.status.error,
	    		message : err});
		}
		else 
		{
	    	res.send({status: constant.status.success}); 															
	    }
	})
	});
}

module.exports = router;
