'use strict'

//var path = require('path');
//var fs = require('fs');
var mongoosePaginate = require('mongoose-pagination');

var user = require('../models/user');
var Follow = require('../models/follow');

function saveFollow(req, res){
	var params = req.body;

	var follow = new Follow();
	follow.user= req.user.sub;
	follow.followed = params.followed;
	follow.save((err, followGuardado)=>{
		if (err) return res.status(500).send({mesagge:'error al guardar el seguimiento'});
		if(!followGuardado) return res.status(404).send({mesagge:'El seguimiento no de ha guardado'});
		return res.status(200).send({follow:followGuardado});
	});
}

function deleteFollow(req, res){
	var userId = req.user.sub; //se obtiene del token de autenticacion
	var followId = req.params.id; //id del usuario al que sigue

	Follow.find({'user':userId, 'followed':followId}).remove(err=>{
		if (err) return res.status(500).send({mesagge:'error al dejar de seguir'});
		return res.status(200).send({mesagge:'El follow se ah eliminado'});
	});
}

function getFollowingUsers(req, res){
	var userId = req.user.sub;
	if(req.params.id && req.params.page){//si mandan un id por url
		userId = req.params.id;
	}
	var page = 1;

	if (req.params.page) {
		page = req.params.page;
	}else{
		page = req.params.id;
	}

	var itemsPerPage= 4;
	//cambiar el id por el documento que corresponde al id con populate
	//.populate({path: 'followed'})  sustituye followed por el objeto que hace referencia
	Follow.find({user:userId}).populate({path: 'followed'}).paginate(page, itemsPerPage, (err, follows, total)=>{
		if(err) return req.status(500).send({mesagge:'Error en el servidoe'});
		if(!follows) return res.status(404).send({mesagge:'No estas seguiendo a ningun usuario'});
		
		return res.status(200).send(
			{
				total: total,
				pages: Math.ceil(total/itemsPerPage),
				follows
			}
		);

	});
}

//listar usuarios que nos siguen
function getFollowedUsers(req, res){
	var userId = req.user.sub;

	if(req.params.id && req.params.page){//si mandan un id por url
		userId = req.params.id;
	}
	var page = 1;

	if (req.params.page) {
		page = req.params.page;
	}else{
		page = req.params.id;
	}

	var itemsPerPage= 4;
	//cambiar el id por el documento que corresponde al id con populate
	//.populate('user followed')  sustituye user y followed por el objeto que hace referencia
	Follow.find({followed:userId}).populate('user').paginate(page, itemsPerPage, (err, follows, total)=>{
		if(err) return req.status(500).send({mesagge:'Error en el servidoe'});
		if(!follows) return res.status(404).send({mesagge:'No te sigue a ningun usuario'});
		
		return res.status(200).send(
			{
				total: total,
				pages: Math.ceil(total/itemsPerPage),
				follows
			}
		);

	});
}

//devolcer listados de ususarios 
function getMyFollows(req, res){
	var userId=req.user.sub;

	var find = Follow.find({user:userId});
	if (req.params.followed) {
		console.log(req.params.followed);
		console.log("entro al if");
		find = Follow.find({followed:userId});
	}

	find.populate('user followed').exec((err, follows)=>{
		if(err) return res.status(500).send({mesagge:'Error en el servidor'});
		if(!follows) return res.status(404).send({mesagge:'No sigues a ningun usuario'});
		
		return res.status(200).send({follows});
	});
}


module.exports={
	saveFollow,
	deleteFollow,
	getFollowingUsers,
	getFollowedUsers,
	getMyFollows
}