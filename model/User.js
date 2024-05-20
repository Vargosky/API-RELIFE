const { Schema, model } = require("mongoose");

const UsuarioSchema = Schema({
    name: {
        type:String,
        require:true
    },
    surname: {
        type:String,
        require:true
    },
    nick: {
        type:String,
        require:true
    },
    email: {
        type:String,
        require:true
    },
    wallet: {
        type:String,
        require:true,
        default:"0x0"
    },
    password: {
        type:String,
        require:true
    },
    rol: {
        type:String,
        require:true,
        default:"role_user"
    },
    fecha: {
        type: Date,
        default: Date.now
    },
    imagen: {
        type: String,
        default: "default.png"
    },
});

module.exports = model("User", UsuarioSchema, "users");