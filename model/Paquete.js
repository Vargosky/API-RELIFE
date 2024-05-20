const { Schema, model } = require("mongoose");
const Joi = require('joi');
const PaqueteSchema = Schema({

        material: {
            type: String,
            required: true,
        },
        cantidad: {
            type: Number,
            required: true,
        },
        centroAcopio: {
            type: String,
            required: true,
        },
        plantaProcesamiento: {
            type: String,
            ref: "Planta",
        },
        reciclajes: [
            {
                type: Array,
                ref: "Reciclaje",
            },
        ],
        estado: {
            type: String,
            enum: ["Espera", "tránsito", "entregado", "abierto", "cerrado" ,"eliminado","merma", "procesando"],
            default: "abierto",
        },
        fechaCreacion: {
            type: Date,
            default: Date.now,
        },
        fechaEntrega: {
            type: Date,
        },
    });

    module.exports = model("Paquete", PaqueteSchema, "paquetes");