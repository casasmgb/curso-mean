'user strict'
var express= require('express');
var MessageController = require('../controllers/messageController');
var api = express.Router();
var md_auth = require('../middlewares/authenticated');

api.get('/probando-mg',md_auth.ensureAuth, MessageController.probando);
api.post('/message', md_auth.ensureAuth, MessageController.saveMessage);
api.get('/mis-mensajes/:page?',md_auth.ensureAuth, MessageController.getReceivedMessage);
api.get('/mensajes/:page?',md_auth.ensureAuth, MessageController.getEmmitMessage);
api.get('/mensajes-no-vistos',md_auth.ensureAuth, MessageController.getUnviewedMessage);
api.get('/set-mensajes-vistos',md_auth.ensureAuth, MessageController.setViewedMessage);
module.exports = api;