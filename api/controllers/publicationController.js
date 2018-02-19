'use strict'

var fs = require('fs');
var path = require('path');
var moment = require('moment');
var mongoosePagination = require('mongoose-pagination');

var Publication = require('../models/publication');
var User = require('../models/user');
var Follow = require('../models/follow');

function probando(req, res){
    res.status(200).send(
        {
            messge:'hola desde el controlador de publicaciones'
        }
    );
}
function savePublication(req, res){
    var params = req.body;

    if(!params.text) return res.status(200).send({message:'debes enviar un texto'});
    
    var publication= new Publication();
    publication.text = params.text;
    publication.file = null;
    publication.user=req.user.sub;
    publication.created_at = moment().unix();
    publication.save((err, publicationGuardado)=>{
        if(err) return req.status(500).send({message:'Error al guardar la publicacion'});
        if(!publicationGuardado) return req.status(404).send({message:'La publicacion no se guardo'});
        return res.status(200).send({publication:publicationGuardado});
    });
}
//publicaciones de usuarios que estamos siguiendo
function getPublications(req, res){
    var page = 1;
    if(req.params.page){
        page=req.params.page;
    }
    var itemsPerPage = 4;

    Follow.find({user: req.user.sub}).populate('followed').exec((err, follows)=>{
        if(err) return res.status(500).send({message:'Error al devolver el seguimiento'});

        var follows_clean=[];
        follows.forEach((follow)=>{
            follows_clean.push(follow.followed);
        });
        
        //{user:{"$in":follows_clean}}
        //compara user con cada elemento del array follows_clean
        Publication.find({user:{"$in":follows_clean}}).sort('-created_at').populate('user').paginate(page, itemsPerPage,(err, publications,total)=>{
            if(err) return res.status(500).send({message:'Error al devolver publicaciones'});
            if(!publications) return res.status(404).send({message:'No hay publicaciones'});
            return res.status(200).send({
                total_items:total,
                pages:Math.ceil(total/itemsPerPage),
                page,
                publications
            });
        });
    });
}

function getPublication(req, res){
    var publicacionId=req.params.id;

    Publication.findById(publicacionId, (err, publication)=>{
        if(err) return res.status(500).send({message:'Error al devolver publicaciones'});
        if(!publication) return res.status(404).send({message:'No existe la publicacion'});
        res.status(200).send({publication});
    });
}
/*function deletePublication(req, res){
    var publicationId = req.params.id;
    
    Publication.find({'user':req.user.sub, '_id':publicationId}).remove((err)=>{
        if(err) return res.status(500).send({message:'Error al borrar publicaciones'});
        //if(!publicacionEliminada) return res.status(404).send({message:'No ha borrado la publicacion'});
        res.status(200).send({message:'publicacion eliminada'});
    });
}*/
//hacer metodo para verificar que un usuario es dueño de una publicacion antes de eliminar
function deletePublication(req, res){
    var publicationId = req.params.id;
    Publication.findOne({'user':req.user.sub, '_id':publicationId}).exec((err, publicationVer)=>{
        
        if(publicationVer){
            Publication.findByIdAndRemove(publicationId,(err, respublicationremoved)=>{
                if(err ) return res.status(500).send({message:"error al eliminar la publicacion"});
                if(!respublicationremoved) return res.status(404).send({message:"no eres ha podido eliminar"});
                return res.status(200).send({message:"Publicacion eliminada"});
            });
        }else{
            return res.status(200).send({message:"no eres dueño de la publicacion"});
        }
    }); 
}

function uploadImage(req, res){
	var publicacionId = req.params.id;
	
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


		if(file_ext=='png' || file_ext=='jpg' || file_ext=='jpeg' || file_ext=='gif'){
            //actualizar documento de la publicacion
            Publication.findOne({'user':req.user.sub, ':id':publicacionId}).exec((err, publicationVer)=>{
                if(publicationVer){
                    Publication.findByIdAndUpdate(publicacionId, {file: file_name}, {new:true}, (err, publicationUpdated)=>{
                        if (err) return res.status(500).send({message:'Error en la petición'});
                        if (!publicationUpdated) return res.status(404).send({message:'no de puede actualizar el usuario'});
                        return res.status(200).send({publicacion: publicationUpdated});
                    });
                }else{
                    return removeFilesOfUpload(res, file_path,'no tienes permiso para actualizar esta piblicacion');
                }
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
	var path_file = './uploads/publications/'+image_file;
	fs.exists(path_file, (exists)=>{
		if(exists){
			res.sendFile(path.resolve(path_file)); //funcion de express
		}else{
			res.status(200).send({message:'no existe la imagen'});
		}
	});
}

module.exports= {
        probando,
        savePublication,
        getPublications,
        getPublication,
        deletePublication,
        uploadImage,
        getImageFile
    }