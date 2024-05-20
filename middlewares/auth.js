//importar dependencia
const jwt = require("jwt-simple");
const moment = require("moment");


//importar clave secreta

const libjwt = require("../helpers/jwt.js");
const secret = libjwt.secret;

exports.auth = (req, res, next) => { //funcion de auntentificacion

    //comprobar si llega la cabecera
    if (!req.headers.authorization) {
        return res.status(404).send({
            status: "error",
            message: "no tiene la cabecera de autizacion"
        })

    }

    //decodificar el token
    let token = req.headers.authorization.replace(/['"]+/g, ''); //limpiar el string de posibles comillas

    try {

        const payload = jwt.decode(token, secret);
        if (payload.exp <= moment.unix()) {
            return res.status(403).send({
                status: error,
                message: "token expirado"
            })
        }
        //agregar los datos de usuario a  la request
        req.user = payload;



    } catch (error) {
        return res.status(404).send({
            status: error,
            message: "invalid token"
        })
    }


    // pasar a la ejecucion de la accion 
    next();

}