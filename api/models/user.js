'use strict'
var mongoose = require('mongoose');
var schema = mongoose.Schema;
var userSchema = schema({
	name: String,
	susername: String,
	nick: String,
	email: String,
	password: String,
	role: String,
	image: String
});
//en la base de daros aparecera como 'users' en minuscula y plural
module.exports=mongoose.model('User', userSchema);