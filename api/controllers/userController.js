'use strict'

var User = require('../models/user') //modelo 
var Follow = require('../models/follow') //modelo 
var bcrypt = require('bcrypt-nodejs');
var mongoosePaginate = require('mongoose-pagination');
var fs = require('fs');
var path = require('path');
var jwt = require('../services/jwt');

//metodos de prueba
function home (req,res){
	res.status(200).send({
		message: 'Hola mundo desde el servidor de NodeJS'
	});
}
function pruebas(req,res){
	console.log(req.body);
	res.status(200).send({
		message: 'Accion de pruebas en el servidor de NodeJS'
	});
}
//registro de ususario
function saveUser(req, res){
	var params= req.body;
	var user= new User();
	if (params.name && params.surname
		&&params.nick && params.email && params.password) {
		
		user.name=params.name;
		user.surname=params.surname;
		user.nick=params.nick;
		user.email=params.email;
		user.role='REOLE_USER';
		user.image=null;
		//Controlar usuarios duplicados
		// User es del modelo
		//hacemos una consulta
		User.find({ $or: [
					{email:user.email.toLowerCase()},
					{nick:user.nick.toLowerCase()}
			]}).exec((err, users)=>{
				
				if (err) res.status(500).send({message:'Error en peticíon de ususario'});

				if (users && users.length>=1) {
					return res.status(200).send({message:'El ususario ya existe'});;
				}else{
					//cifrar contraseña y guardar los datos
					bcrypt.hash(params.password, null,null,(err, hash)=>{
						user.password=hash;
						//para guardar el usuario en mongoDB
						user.save((err, userGuardado)=>{
							if(err) return res.status(500).send({message:'Error al guardar el ususario'});

							if(userGuardado){
								res.status(200).send({user:userGuardado});
							}else{
								res.status(404).send({message:'no se ha registrado el usuario'});
							}
						});
					});
				}
			});
	}else{
		res.status(200).send({
			message: 'envia todos los campos necesarios!!!'
		});
	}
}
//login user
function loginUser(req, res){
	var params= req.body;
	var email= params.email;
	var password= params.password;
	//hacemos una consulta
	User.findOne({email: email}, (err, user)=>{
		if (err) return res.status(500).send({message:'Error en la peticion'});
		if(user){
			bcrypt.compare(password, user.password, (err, check)=>{
				if (check) {
					if (params.gettoken) {
						//generar y devolver token
						return res.status(200).send({
							token:jwt.createToken(user)
						});

					}else{
						//devolver datos de ususario
						user.password = undefined;//ocultar el password en la respuesta
						return res.status(200).send({user})
					}
				}else{
					return res.status(404).send({message:'Error el usuario no se ha podido identificar'});
				}
			});
		}else{
		return res.status(404).send({message:'Error el usuario no se ha podido identificar!!!'});
		}
	});

}
//conseguir datos de un ususario
function getUser(req, res){
	var userId = req.params.id;

	User.findById(userId, (err, user)=>{
		if (err) return res.status(500).send({message:'Error en la petición'});
		if (!user) return res.status(404).send({message:'El usuario no existe'});
		
		/*Follow.findOne({'user':req.user.sub, 'followed': userId}).exec((err, follow)=>{
			if (err) return res.status(500).send({message:'Error al comprobar el sieguiminto'});
			return res.status(200).send({user, follow});
		});
		//en vez de este metodo se usara el siguiente
		*/
		followThisUser(req.user.sub, userId).then((value)=>{
			user.password= undefined;
			return res.status(200).send(
				{
					user, 
					following: value.following,
					followed: value.followed
				}

				);
		});
	});
}

//funcion asincrona 
async function followThisUser(identity_user_id, user_id){
	//Funcion sincrona, cundo se ejecuta algo espere a que se obtenga el resultado y luego pase a la siguiente
	var following = await Follow.findOne({'user':identity_user_id, 'followed': user_id}).exec((err, follow)=>{
			if (err) return handleError(err);
			return follow;
		});
	var followed = await Follow.findOne({'user':user_id, 'followed': identity_user_id}).exec((err, follow)=>{
			if (err) return handleError(err);
			return follow;
		});
	return {
		following : following,
		followed : followed
	}
}
//devolver un listario de usuarios paginado
function getUsers(req, res){
	//req.user.sub es el id del usuario enviada desde el middlerare dendtr del req
	var identity_user_id = req.user.sub;
	var page=1;
	if (req.params.page) {
		page= req.params.page;
	}
	var itemsPerPage=2;
	User.find().sort('_id').paginate(page, itemsPerPage,(err, users, total)=>{
		if (err) return res.status(500).send({message:'Error en la petición'});
		if (!users) return res.status(404).send({message:'No hay usuarios disponibles'});
		
		followUserIds(identity_user_id).then((valorDevuelto)=>{
			
			return res.status(200).send(
				{
					users, //users:users
					users_following : 	valorDevuelto.following,
					users_follow_me : valorDevuelto.followed,
					total,  //total:total
					pages:Math.ceil(total/itemsPerPage)
				}
			);
		});
	});
}

async function followUserIds(user_id){
	//'_id':0  hara que estos no se muestren en la respuesta
	var following = await Follow.find({'user':user_id}).select({'_id':0,'__v':0, 'user':0}).exec((err, follows)=>{
		return follows;
	});

	var followed = await Follow.find({'followed':user_id}).select({'_id':0,'__v':0, 'followed':0}).exec((err, follows)=>{
		return follows;
	});

	//Procesar following ids
	var following_clean=[];

		following.forEach((follow)=>{
			following_clean.push(follow.followed);
	});
	//Procesar following ids
	var followed_clean=[];

		followed.forEach((follow)=>{
			followed_clean.push(follow.user);
	});


	return {
		following : following_clean,
		followed : followed_clean
	}
}

function getCounters(req, res){
	var userId = req.user.sub;
	if(req.params.id){
		userId = req.params.id;
	}
	console.log('userId: '+userId);
	getCountFollows(userId).then((value)=>{
		return res.status(200).send(value);
	});
}
async function getCountFollows(user_id){
	var folloing = await Follow.count({'user':user_id}).exec((err, count)=>{
		if(err) return handleError(err);
		return count;
	});
	var followed = await Follow.count({'followed':user_id}).exec((err, count)=>{
		if(err) return handleError(err);
		return count;
	});
	return {
		following : folloing,
		followed : followed
	}
}
//edicion de datos
function updateUser(req, res){
	var userId = req.params.id;
	var update = req.body; //json con datos para actualizar
	//quitar la propiedad password
	delete update.password;
	//req.user.sub es el id del usuario enviada desde el middlerare dendtr del req
	if (userId!=req.user.sub) {
		return res.status(500).send({message:'No tiene permisos para actualizar los datos del ususario'});
	}
	//{new:true} opcion para devolver el objeto user actualizado
	//sin esta opcion el metodo devolvera el objeto user anterior a la actualizacion
	User.findByIdAndUpdate(userId,update, {new:true},(err, userUpdated)=>{
		if (err) return res.status(500).send({message:'Error en la petición'});
		if (!userUpdated) return res.status(404).send({message:'no de puede actualizar el usuario'});
		return res.status(200).send({user: userUpdated});
	});
}
//subir archivos de imagen de usuario
function uploadImage(req, res){
	var userId = req.params.id;
	
	if (req.files) {
		var file_path = req.files.imagen.path;
		console.log(file_path);

		var file_split = file_path.split('/');
		console.log(file_split);

		var file_name = file_split[2];
		console.log(file_name); 
		
		var ext_split= file_name.split('\.');
		var file_ext= ext_split[1];
		console.log(file_ext);

		if (userId!=req.user.sub) {
			return removeFilesOfUpload(res, file_path,'No tiene permisos para actualizar los datos del ususario');
		}

		if(file_ext=='png' || file_ext=='jpg' || file_ext=='jpeg' || file_ext=='gif'){
			//actualizar documento de ususario logueado
			User.findByIdAndUpdate(userId, {image: file_name}, {new:true}, (err, userUpdated)=>{
				if (err) return res.status(500).send({message:'Error en la petición'});
				if (!userUpdated) return res.status(404).send({message:'no de puede actualizar el usuario'});
				return res.status(200).send({user: userUpdated});
			});
			
		}else{
			return removeFilesOfUpload(res, file_path,'Extension no valida');
		}

	}else{
		return res.status(200).send({message:'no se ha subido imagenes'});
	}
}
function removeFilesOfUpload(res, file_path,message){
	fs.unlink(file_path,(err)=>{
		return res.status(200).send({message:message});
	});
}
function getImageFile(req, res){
	var image_file = req.params.imageFile;
	var path_file = './uploads/users/'+image_file;
	fs.exists(path_file, (exists)=>{
		if(exists){
			res.sendFile(path.resolve(path_file)); //funcion de express
		}else{
			res.status(200).send({message:'no existe la imagen'});
		}
	});
}
module.exports={
	home,
	pruebas,
	saveUser,
	loginUser,
	getUser,
	getUsers,
	getCounters,
	updateUser,
	uploadImage,
	getImageFile
}