'use strict'
var mongoose= reqire('mongoose');
var schema= mongoose.Schema;
var messageSchema=schema({
	text:String,
	created_at:String,
	emmiter:{type: schema.ObjectId, ref:'User'}
	receiber:{type: schema.ObjectId, ref:'User'}
});
//en la base de daros aparecera como 'messages' en minuscula y plural
module.exports=mongoose.model('Message',messageSchema);