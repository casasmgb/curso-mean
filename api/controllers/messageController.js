'use strict'

var moment =  require('moment');
var mongoosePaginate =  require('mongoose-pagination');
var USer = require('../models/user');
var Follow = require('../models/follow');
var Message = require('../models/message');

function probando(req, res){
    res.status(200).send({message:'hola desde el cotroladoe de message'});
}
function saveMessage(req, res){
    var params = req.body;
    if(!params.text || !params.receiver) return res.status(200).send({message:'Completa los datos necesarios'});
    var message = new Message;
    message.emmiter = req.user.sub;
    message.receiver = params.receiver;
    message.text = params.text;
    message.created_at = moment().unix();
    message.viewed='false';
    message.save((err, messageGuardado)=>{
        if(err) return res.status(500).send({message:'Error en la peticion de mensaje'});
        if(!messageGuardado) return res.status(404).send({message:'Error al guardar el mensaje'});
        return res.status(200).send({message:messageGuardado});
    });
}
function getReceivedMessage(req, res){
    var userId = req.user.sub;
    var page=1;
    if(req.params.page){
        page=req.params.page;
    }
    var itemsPerPage = 4;

    Message.find({receiver:userId}).populate('emmiter', 'name _id email nick image').paginate(page, itemsPerPage,(err, messages, total)=>{
        if(err) return res.status(500).send({message:'Error en la peticion de mensaje'});
        if(!messages) return res.status(404).send({message:'No hay mensaje que mostrar'});
        return res.status(200).send({
            total:total, 
            page: Math.ceil(total/itemsPerPage),
            messages
        });
    });
}
function getEmmitMessage(req, res){
    var userId = req.user.sub;
    var page=1;
    if(req.params.page){
        page=req.params.page;
    }
    var itemsPerPage = 4;

    Message.find({emmiter:userId}).populate('emmiter receiver', 'name _id email nick image').paginate(page, itemsPerPage,(err, messages, total)=>{
        if(err) return res.status(500).send({message:'Error en la peticion de mensaje'});
        if(!messages) return res.status(404).send({message:'No hay mensaje que mostrar'});
        return res.status(200).send({
            total:total, 
            page: Math.ceil(total/itemsPerPage),
            messages
        });
    });
}
function getUnviewedMessage(req, res){
    var userId = req.user.sub;
    Message.count({receiver:userId, viewed:'false'}).exec((err, count)=>{
        if(err) return res.status(500).send({message:'Error en la peticion de mensaje'});
        return res.status(200).send({
            'unviewed':count
        });
    });
}
function setViewedMessage(req, res){
    var userId = req.user.sub;
    Message.update({receiver:userId, viewed:'false'}, {viewed:'true'}, {'multi':true},(err, mensajeActualizado)=>{
        if(err) return res.status(500).send({message:'Error en la peticion de mensaje'});
        return res.status(200).send({messages:mensajeActualizado});
    });
}
module.exports={
    probando,
    saveMessage,
    getReceivedMessage,
    getEmmitMessage,
    getUnviewedMessage,
    setViewedMessage
}