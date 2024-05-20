const { Schema, model } = require("mongoose");
const Joi = require('joi');
const BodegaSchema = Schema({
    idUser: {
        type:String,
        require:true
    },
    material:{
        type:String,
        require:true
    },

    cantidadMaxima:Joi.number().integer()
    ,
    fechaCreacion: {
        type: Date,
        default: Date.now
    },
    ubicacion:{
        type:String,
        default: "home"
    },
});

module.exports = model("Bodega", BodegaSchema, "bodegas");