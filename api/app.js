'use strict'
//express para manejar http
var express=require('express');
//convertir body de peticiones a objeto
var bodyParser = require('body-parser');

var app = express();
//cargar rutas
var user_routes= require('./routes/userRoute');
var follow_routes= require('./routes/followRoute');
var puplication_routes = require('./routes/publicationRoute');

//cargar middlewares
//metodo que se ejecuta antes de lleggar al controlador.
app.use(bodyParser.urlencoded({extend:false}));
app.use(bodyParser.json());

//cors

//rutas
	//permite usar localhost:3800/api/home
	//permite usar localhost:3800/api/pruebas
app.use('/api',user_routes);
app.use('/api',follow_routes);
app.use('/api', puplication_routes);
//exportar
module.exports=app;