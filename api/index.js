'use strict'
//variable de conexion
var mongoose = require('mongoose');
var app= require('./app');
var port=3800;

//promesas
mongoose.Promise=global.Promise;
//conexion a la base de datos
mongoose.connect('mongodb://localhost:27017/curso_mean_social', {useMongoClient: true})
	.then(()=>{
		console.log("La Conexion es correcta");
		//crear servidor
		app.listen(port,()=>{
			console.log("Servidor en ejecucion en http://localhost:3800");
		});
	})
	.catch(err=>console.log(err));