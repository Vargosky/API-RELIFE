const mongoose = require("mongoose");

const connection = async ()=>{

    const local     =   "mongodb://127.0.0.1:27017/";
    const remoto    =   "mongodb+srv://saremvargas:Sarem1509@cluster0.j4tuv0s.mongodb.net/"; 

    const bdName = "mi_redsocial";

    const address = remoto;  //cambiar  a remoto si trabajamos con mongo en sus servidores


    try {
        await mongoose.connect( address + bdName);
        console.log("conectado correctamente a la BASE DE DATOS :" + bdName);
    } catch (error) {
        console.log(error);
        throw new error ("no se pudo conectar a base de datos: " + bdName);
    }


}

module.exports = connection;