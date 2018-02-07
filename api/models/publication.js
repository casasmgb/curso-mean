'use stricts'
var mongoose = require('mongoose');
var schema= mongoose.Schema;
var publicationSchema=schema({
	text:String,
	file:String,
	created_at:String,
	user:{type:schema.ObjectId, ref:'User'}
});
//en la base de daros aparecera como 'publications' en minuscula y plural
module.exports=mongoose.model('Publication', publicationSchema);