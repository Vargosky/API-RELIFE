//importar dependencias
const bcrypt = require("bcrypt");
const User = require("../model/User.js");
const fs = require("fs");
const path = require("path");
const mongoosePaginate = require('mongoose-pagination');
const { validarRegistro, hashear, hashPassword, verifyPassword, getCo2e } = require("../helpers/fx.js");
const { createToken, secret } = require("../helpers/jwt.js");
const Joi = require("joi")

//importaciones para Reciclaje
const Reciclaje = require("../model/Reciclaje.js");


const test = (req, res) => {

    return res.status(200).send({
        message: "test message : Ingresado a los controladores de prueba",
        usuario: req.user,
    });
}

//registro corregido por mi con un flag

const register = async (req, res) => {
    let flag = false;
    //recoger datos
    let params = req.body;
    //comprobar que me llegan bien    
    if (!validarRegistro(params.name, params.surname, params.nick, params.email)) {

        return res.status(400).send({
            status: "error",
            message: "Error en la validación",
            params
        });
    }

    //control de usuarios duplicados lo externalice a una funcion en fx.js la original en auxiliar.txt
    //name && surname && nick && email
    User.find({
        $or: [
            { email: params.email.toLowerCase() },
            { nick: params.nick.toLowerCase() }

        ]
    }).exec((error, users) => {
        if (error) {
            return res.status(500).json({
                status: "error",
                message: "error en la consulta",
                params
            });
        }
        if (users.length >= 1) {
            return res.status(500).json({
                status: "success",
                message: "El usuario ya existe",
                params
            });
        }
        if (users.length == 0) {
            flag = true;
        }
    });

    // cifrar contraseña --> tambien existen la funcion hashear que que encripta a sha256 
    // params.password = hashear(params.password); //opcion de sha256 no es asincrona
    params.password = await hashPassword(params.password);
    //creamos una variable con los parametros
    let user_to_save = new User(params);
    // guardar en la base de datos

    if (flag) {

        user_to_save.save((error, userStorage) => {
            if (error || !userStorage) {

                return res.status(500).send({
                    error: "error",
                    mensaje: "error al guardar",
                });
            }

            return res.status(200).send({
                status: "sucess",
                message: "User Storage: success",
                user_to_save,


            });


        })

    }







}
//loguearse

const login = (req, res) => {

    let flag = false;
    const params = req.body;

    if (!params.email) {

        return res.status(400).send({
            status: "error",
            message: "Se necesitan todos los campos"
        })
    }

    User.findOne({ email: params.email })
        //.select({password:0})
        .exec((error, user) => {
            if (error || !user) {
                return res.status(400).send({
                    status: "error",
                    message: "No existe el usuario"
                })
            }

            //comparra contraseñas
            const pwd = bcrypt.compareSync(params.password, user.password);
            if (!pwd) {
                return res.status(400).send({
                    status: "error",
                    message: "contraseña incorrecta"
                })
            }
            //conseguir token
            const token = createToken(user);
            //devolver token
            //devolver el usuario
            return res.status(200).send({
                status: "sucess",
                message: "accion de loguin",
                user: {
                    id: user._id,
                    name: user.name,
                    nick: user.nick,
                    email: user.email,
                    token: token,
                }
            })
        });





}


const profile = (req, res) => {

    //recibir el prametro por la url
    const id = req.params.id;

    //consulta para sacar los datos del usuario
    User.findById(id)
        .select({ password: 0 })
        .exec((error, userProfile) => {
            if (error || !userProfile) {

                return res.status(404).send({
                    status: "error",
                    message: "error consulta",
                });
            }

            return res.status(200).send({
                status: "success",
                usuario: userProfile,
            });


        })


    //devolver los resultados


}

const all = (req, res) => {
    console.log("entro");
    User.find({})
        .select({ password: 0 })
        .exec((error, userProfiles) => {
            if (error || !userProfiles) {
                return res.status(404).send({
                    status: "error",
                    message: "error consulta",
                });
            }

            return res.status(200).send({
                status: "success",
                userProfiles,
            });

        });

}

const list = (req, res) => {
    //controlar en que pagina estamos
    let page = 1;
    let itemPerPage = 4;
    if (req.params.page) {
        page = req.params.page;
    }
    page = parseInt(page);
    //consultar a mongoose pagination

    User.find({})
        .paginate(page, itemPerPage, (error, users, total) => {

            if (error || !users) {
                return res.status(404).send({
                    status: "error",
                    message: "error consulta",
                });
            }


            return res.status(404).send({
                status: "sucess",
                users,
                page,
                itemPerPage,
                total,
                numberOfPage: Math.ceil(total / itemPerPage)
            });
        })

}

const update = async (req, res) => {

    // buscar la informacion y asignarlauna variable
    let params = req.body

    User.findOne({ email: params.email }).exec((error, user) => {
        if (error || !user) {
            return res.status(400).send({
                status: "error",
                message: "No existe el usuario"
            })
        }

        //comprobar la contraseña
        const pwd = bcrypt.compareSync(params.password, user.password);
        if (!pwd) {
            return res.status(400).send({
                status: "error",
                message: "contraseña incorrecta"
            })
        }
        //asignamos a los parametros la contraseña cifrada
        params.password = user.password;


        User.findOneAndUpdate(user._id, params, { new: true }, (error, newUser) => {
            if (error) {
                return res.status(500).send({
                    status: "error",
                    message: "usuario no actualizado",
                    newUser
                })

            }

            return res.status(200).send({
                status: "sucesss",
                message: "usuario actualizado",
                newUser
            })
        });



    })

}

const upload = (req, res) => {

    if (!req.file && !req.files) {
        return res.status(400).json({
            statys: "error",
            mensaje: "peticion invalida"
        })
    }


    let archivo = req.file.originalname;
    //extension del archivo
    let archivosplit = archivo.split("\.")
    let extension = archivosplit[1];

    if (extension != "jpg" && extension != "png" && extension != "gif") {
        //borrar datos
        fs.unlink(req.file.path, (error) => {
            return res.status(400).json({
                status: "error",
                mensaje: "imagen invalida"
            })
        })
    }

    const userId = req.params.id;
    let tmp = req.user.id;
    User.findOneAndUpdate({ tmp }, { imagen: req.file.filename }, { new: true }, (error, userUpdated) => {

        if (error || !userUpdated) {
            return res.status(500).json({
                status: "error",
                mensaje: "error al actualizar"
            })
        }
        return res.status(200).json({
            status: "success",
            articuloAnterior: userUpdated,
            fichero: req.file
        })
    })

}

const avatar = (req, res) => {

    let fichero = req.params.file;

    let ruta_fisica = "./upload/avatars/" + fichero;
    console.log(ruta_fisica);
    fs.access(ruta_fisica, (error, exist) => {
        if (exist) {
            return res.status(404).json({
                status: "error",
                mensaje: "la imagen no existe",
                ruta_fisica,
            });
        }
        if (!exist) {
            return res.sendFile(path.resolve(ruta_fisica));

        }


    })


}

//DESDE ACA LAS FUNCIONES PARA CREAR RECICLAJES

const crearReciclaje = (req, res) => {

    let flag = false;
    //recibir datos
    params = req.body;
    //la creacion es automatica
    //craer el objeto
    if (!params.email) {
        return res.status(400).send({
            status: "error",
            message: "en necesario el correo"
        })
    }

    params.cantidad = parseInt(params.cantidad);
    params.co2 = getCo2e(params.material, params.cantidad);
    User.findOne({ email: params.email }, (error, user) => {

        let reciclajeToSave = new Reciclaje(params);
        reciclajeToSave.idUser = user._id;

        reciclajeToSave.save((error, reciclajeStorage) => {

            if (error || !reciclajeStorage) {
                return res.status(500).send({
                    status: "error",
                    message: "error al guardar",

                })
            }

            return res.status(200).send({
                status: "sucess",
                message: "New Reciclaje Action",
                reciclajeStorage
            })

        })



    })




}

const verificacion = async (req, res) => {
    try {
        const { id } = req.params;
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'No existe usuario registrado con ese email',
            });
        }
        if (user.rol !== 'validador') {
            return res.status(500).json({
                status: 'error',
                message: 'No eres usuario validador',
                rol: user.rol,
            });
        }
        const reciclaje = await Reciclaje.findById(id);
        if (!reciclaje) {
            return res.status(400).json({
                status: 'error',
                message: 'No existe el reciclaje',
            });
        }
        reciclaje.estado = 'verificado';
        const updatedReciclaje = await reciclaje.save();
        return res.status(200).json({
            status: 'success',
            message: 'Reciclaje actualizado',
            reciclaje: updatedReciclaje,
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor',
        });
    }
};


// const verificacion = (req, res) => {

//     let idUser;
//     let idReciclaje = req.params.id;
//     let flag = false;
//     let params = req.body;

//     if (!idReciclaje) {
//         return res.status(400).json({
//             status: "error",
//             message: "se necesita el id"
//         });
//     }

//     User.findOne({ email: params.email }, (error, user) => {
//         if (error || !user) {
//             return res.status(404).json({
//                 status: "error",
//                 message: "no existe usuario registrado con ese email"
//             });
//         }

//         idUser = user._id;

//         if (user.rol != "validador") {
//             return res.status(500).json({
//                 status: "error-->",
//                 message: "No eres usuario validador",
//                 rol: user.rol
//             });
//         }

//         Reciclaje.findById(idReciclaje, (error, reciclaje) => {

//             if (error || !reciclaje) {
//                 return res.status(400).json({
//                     status: "error",
//                     message: "No existe el reciclaje"
//                 });
//             }
//             Reciclaje.findOneAndUpdate(reciclaje._id, { estado: "verificado" }, { new: true }, (error, newUser) => {
//                 if (error) {
//                     return res.status(500).send({
//                         status: "error",
//                         message: "reciclaje no actualizado",
//                         newUser
//                     })

//                 }

//                 return res.status(200).send({
//                     status: "sucesss",
//                     message: "reciclaje actualizado",
//                     newUser
//                 })
//             });
//         });
//     });
// };

const historial = (req, res) => {

    const usuario = req.params.id;

    Reciclaje.find({ idUser: usuario }, (error, reciclajes) => {
        if (error || !reciclajes) {
            return res.status(404).send({
                status: error,
                message: "no se encontro registro"
            })
        }

        return res.status(200).send({
            reciclajes
        })

    })

}



const historialMaterial = async (req, res) => {
    const usuario = req.params.id;
    const material = req.params.material;

    try {
        const resultado = await Reciclaje.aggregate([
            { $match: { idUser: usuario, material: material } },
            { $group: { _id: null, totalCo2: { $sum: "$co2" }, reciclajes: { $push: "$$ROOT" } } }
        ]);

        if (resultado.length === 0) {
            return res.status(404).json({ message: "No se encontraron registros" });
        }

        const { reciclajes, totalCo2 } = resultado[0];

        return res.status(200).json({ reciclajes, totalCo2 });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


const historialEstado = async (req, res) => {

    const usuario = req.params.id;
    const material = req.params.material;
    const estado = req.params.estado;

    try {
        const resultado = await Reciclaje.aggregate([
            {
                $match: {
                    idUser: usuario,
                    // material: material, 
                    estado: estado
                }
            },
            { $group: { _id: null, totalCo2: { $sum: "$co2" }, reciclajes: { $push: "$$ROOT" } } }
        ]);

        if (resultado.length === 0) {
            return res.status(404).json({ message: "No se encontraron registros" });
        }

        const { reciclajes, totalCo2 } = resultado[0];

        return res.status(200).json({ reciclajes, totalCo2 });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }

}

const listaAbiertos = (req, res) => {

    const usuario = req.params.id;


    Reciclaje.find({ idUser: usuario, estado: "abierto" }, (error, reciclajes) => {
        if (error || !reciclajes) {
            return res.status(404).send({
                status: error,
                message: "no se encontro registro"
            })
        }

        return res.status(200).send({
            reciclajes
        })

    })

}

const historialMaterialEstado = async (req, res) => {

    const usuario = req.params.id;
    const estado = req.params.estado;
    const material = req.params.material;

    try {
        const resultado = await Reciclaje.aggregate([
            {
                $match: {
                    idUser: usuario,
                    // material: material, 
                    estado: estado
                }
            },
            { $group: { _id: null, totalCo2: { $sum: "$co2" }, reciclajes: { $push: "$$ROOT" } } }
        ]);

        if (resultado.length === 0) {
            return res.status(404).json({ message: "No se encontraron registros" });
        }

        const { reciclajes, totalCo2 } = resultado[0];

        return res.status(200).json({ reciclajes, totalCo2 });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }

}

const co2User = (req, res) => {
    const material = req.params.material;
    cantidad = parseInt(req.params.cantidad)

    const co2 = getCo2e(material, cantidad);


    return res.status(200).send({
        status: "seccess",
        message: "co2",
        material: material,
        cantidad: cantidad,
        co2


    })



}

module.exports = {
    test, register, login, profile, all, list, update, upload, avatar, //controles de usuario

    //controles de reciclaje
    crearReciclaje, verificacion, historial, historialMaterial, historialEstado, historialMaterialEstado,

    //controles CO2
    co2User,


}