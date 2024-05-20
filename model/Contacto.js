const { Schema, model } = require("mongoose");

const ContactoSchema = Schema({
    usuarioSolicitante: {
        type: String,
        ref: "idUser",
        required: true,
    },
    usuarioSolicitado: {
        type: String,
        ref: "idUser",
        required: true,
    },
    estado: {
        type: String,
        enum: ["solicitud", "amigos"],
        default: "solicitud",
    },
    fechaSolicitud: {
        type: Date,
        default: Date.now,
    },
    fechaAmistad: {
        type: Date,
    },
});

module.exports = model("Contacto", ContactoSchema, "contactos");