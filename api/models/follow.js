'use strict'

var mongoose= require('mongoose');
var schema= mongoose.Schema;
var followSchema= schema({
	user: {type: schema.ObjectId, ref:'User'},
	followed:{type: schema.ObjectId, ref:'User'}
});
//en la base de daros aparecera como 'follows' en minuscula y plural
module.exports=mongoose.model('Follow', followSchema);