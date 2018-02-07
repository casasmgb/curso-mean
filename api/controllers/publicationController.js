'use strict'

var path = require('path');
var fs = require('fs');
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
module.exports= {
        probando,
        savePublication,
        getPublications,
        getPublication
    }