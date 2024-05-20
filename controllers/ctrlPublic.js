const bcrypt = require("bcrypt");
const User = require("../model/User.js");
const Reciclaje = require("../model/Reciclaje");
const fs = require("fs");
const path = require("path");
const mongoosePaginate = require('mongoose-pagination');
const { validarRegistro, hashear, hashPassword, verifyPassword, getCo2e } = require("../helpers/fx.js");
const { createToken, secret } = require("../helpers/jwt.js");
const Joi = require("joi")



const obtenerTopUsuarios = async (req, res) => {
    const topN = req.query.top || 10;

    try {
        // Encontrar todos los reciclajes que no estén cerrados
        const reciclajes = await Reciclaje.find({ estado: { $ne: "cerrado" } });

        // Calcular la suma de CO2 por usuario
        const co2PorUsuario = reciclajes.reduce((acumulador, reciclaje) => {
            acumulador[reciclaje.idUser] = (acumulador[reciclaje.idUser] || 0) + reciclaje.co2;
            return acumulador;
        }, {});

        // Crear un array de objetos con el idUser y la suma de CO2
        const usuariosCo2 = Object.entries(co2PorUsuario).map(([idUser, sumaCo2]) => ({
            idUser,
            sumaCo2
        }));

        // Ordenar el array de usuarios por suma de CO2 en orden descendente y obtener los primeros N usuarios
        const topUsuarios = usuariosCo2
            .sort((a, b) => b.sumaCo2 - a.sumaCo2)
            .slice(0, topN);

        // Buscar los detalles de los usuarios en la base de datos
        const usuariosDetallesPromises = topUsuarios.map(({ idUser }) => User.findById(idUser).exec());
        const usuariosDetalles = await Promise.all(usuariosDetallesPromises);

        // Combinar la información del usuario con la suma de CO2 y excluir el password y wallet
        const topUsuariosDetalles = topUsuarios.map((usuarioCo2, index) => {
            const usuario = usuariosDetalles[index].toObject();
            delete usuario.password;
            delete usuario.wallet;
            return {
                ...usuario,
                sumaCo2: usuarioCo2.sumaCo2
            };
        });

        return res.status(200).send({
            topUsuarios: topUsuariosDetalles
        });
    } catch (error) {
        return res.status(500).send({
            status: error,
            message: "Error al obtener el ranking de usuarios"
        });
    }
};

const buscarUsuarioPorNick = (req, res) => {
    const terminoBusqueda = req.params.nick;

    User.find(
        { nick: { $regex: new RegExp(terminoBusqueda, "i") } },
        { password: 0, wallet: 0, __v: 0 } // Excluir campos password, wallet y __v
    )
        .then((usuarios) => {
            if (!usuarios || usuarios.length === 0) {
                return res.status(404).send({
                    message: "No se encontraron usuarios con ese nick.",
                });
            }
            res.status(200).send({ usuarios });
        })
        .catch((error) => {
            res.status(500).send({
                message: "Error al realizar la búsqueda.",
                error,
            });
        });
};


module.exports = { obtenerTopUsuarios, buscarUsuarioPorNick }