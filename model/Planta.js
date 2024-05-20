const { Schema, model } = require("mongoose");

const PlantaSchema = Schema({
    nombre: {
        type: String,
        required: true,
    },
    ubicacion: {
        type: String,
        required: true,
    },
    tipoMaterial: {
        type: String,
        required: true,
    },
    capacidad: {
        type: Number,
        required: true,
    }
});

module.exports = model("Planta", PlantaSchema, "plantas");