const { Schema, model } = require("mongoose");
const Joi = require('joi');

const InventarioSchema = new Schema({

    reciclajeId: {
        type: String,
        ref: 'Reciclaje',
        required: true
    },
    fecha: {
        type: Date,
        default: Date.now
    },
    bodegaId: {
        type: String,
        ref: 'Bodega',
        default: "default"
    },
    cantidad : Joi.number().integer()
    ,
    inOut:{
        type: String,
        default: "in" //in o out 
    }

    }
);

module.exports = model('Inventario', InventarioSchema,"inventarios");


