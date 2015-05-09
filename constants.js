// This file contains all the defined constants

var constant = {
	messages : {
		user_get_newUserCreated : "New user created",
		user_get_userRequirePartner : "User requires partner",
		user_get_existingUserValid : "User valid",
		user_setPartner_userOrPartnerDoesNotExist : "Either user or partner doesn't exist.",
		user_setPartner_partnerUserAlreadyHavePartner : "Target partner user already have partner.",		
		user_approvePartner_didNotApprovePendingUser : "The approved user should be the pending user",
		chat_set_missingChatParameter : "The request is missing a chat message parameter",
		chat_set_cannotChatWithNonPartner : "Cannot post chat to a non partner",

	},
	status : {
		error : "error",
		success : "success"
	},
	database : {
		db_name : "Couply",
		rootdb_url : "mongodb://chenkai.cloudapp.net/",
		maxReturnChat : 16,
	},
	apns : {
		passphrase : "pushchat",
		deviceToken_chenkai : "ecdb7f77a13a3649fb550abf4787901df86801b2612018fd445d948a3699b37c",
		deviceToken_min : "8d2ffb4446e2bfc72ef1eb0aba25c3b7f29d51af27f42fc466bbb0e45ccbfc29",
	},
};

module.exports = constant;