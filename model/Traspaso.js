const express = require("express");
const { Schema, model } = require("mongoose");


const TraspasoSchema = new Schema({
    idReciclaje: {
        type: String,
        required: true,
    },
    idDuenoAnterior: {
        type: String,
        required: true,
    },
    idDuenoNuevo: {
        type: String,
        required: true,
    },
    fechaTraspaso: {
        type: Date,
        default: Date.now,
    },
    cantidad: {
        type: Number,
        required: true,
    },
    material: {
        type: String,
        required: true,
    },
});


module.exports = model("Traspaso", TraspasoSchema,"traspasos");