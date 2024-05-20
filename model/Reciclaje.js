const { Schema, model } = require("mongoose");
const Joi = require('joi');
const ReciclajeSchema = Schema({
    idUser: {           //creador
        type:String,
        require:true
    },
    material:{
        type:String,
        require:true
    },
    cantidad: {
        type: Number,
        required: true
    }
    ,
    fechaCreacion: {
        type: Date,
        default: Date.now
    },
    origen:{
        type:String,
        default: "hogar"
    },
    estado: {
        type:String,
        default: "abierto"
    },
    idHolder:{  //id de la bodega, de la bodega sacamos los datos del usuario 
        type:String,
        default:"default"
    },
    idBodega:{  //id de la bodega, de la bodega sacamos los datos del usuario 
        type:String,
        default:"default"
    },
    co2: {
        
    },
    idPaquete:{
        type:String,
        default:"default"
    }
});

module.exports = model("Reciclaje", ReciclajeSchema, "reciclajes");