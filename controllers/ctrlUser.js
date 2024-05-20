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
                    rol: user.rol,
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

const upload = async (req, res) => {
    try {
        if (!req.file && !req.files) {
            return res.status(400).json({
                status: "error",
                message: "Petición inválida"
            });
        }

        let archivo = req.file.originalname;
        let archivosplit = archivo.split(".");
        let extension = archivosplit[1];

        const allowedExtensions = ["jpg", "png", "gif"];

        if (!allowedExtensions.includes(extension)) {
            // Borrar datos
            fs.unlink(req.file.path, (error) => {
                return res.status(400).json({
                    status: "error",
                    message: "Imagen inválida"
                });
            });
        }

        const userId = req.params.id;
        const updatedUser = await User.findOneAndUpdate({ _id: userId }, { imagen: req.file.filename }, { new: true });

        if (!updatedUser) {
            return res.status(500).json({
                status: "error",
                message: "Error al actualizar"
            });
        }

        return res.status(200).json({
            status: "success",
            userUpdated: updatedUser,
            file: req.file
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error al procesar la solicitud",
            error: error.message
        });
    }
};


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

//falta testear fx delete
const deleteUser = async (req, res) => {

    const params = req.body;
    const email = params.email;
    const password = params.password;



    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const pwd = bcrypt.compareSync(password, user.password);
        if (!pwd) {
            return res.status(401).send({
                status: "error",
                message: "contraseña incorrecta"
            })
        }

        await user.remove();
        res.status(200).json({ message: 'Usuario eliminado con éxito' });
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor', error });
    }

}





//DESDE ACA LAS FUNCIONES PARA CREAR RECICLAJES ---------hay que cambiar al archivo ctrlReciclaje


const crearReciclaje = async (req, res) => {  //mejorado con gpt
    try {
        // Recibir datos
        const { email, material, cantidad } = req.body;

        // Validar datos
        if (!email) {
            return res.status(400).send({
                status: "error",
                message: "Es necesario el correo"
            });
        }

        // Buscar usuario por correo electrónico
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).send({
                status: "error",
                message: "Usuario no encontrado"
            });
        }

        // Calcular CO2 equivalente
        const co2 = getCo2e(material, parseInt(cantidad));

        // Crear objeto Reciclaje
        const reciclajeToSave = new Reciclaje({ ...req.body, co2, idUser: user._id });

        // Guardar reciclaje en la base de datos
        const reciclajeStorage = await reciclajeToSave.save();

        // Enviar respuesta
        return res.status(200).send({
            status: "success",
            message: "New Reciclaje Action",
            reciclajeStorage
        });
    } catch (error) {
        // Manejar errores
        return res.status(500).send({
            status: "error",
            message: "Error al guardar",
            error: error.message
        });
    }
};

const verificacion = async (req, res) => {
    const { id } = req.params;
    const { idValidador, idBodega } = req.body;

    try {
        const reciclaje = await Reciclaje.findById(id);
        if (!reciclaje) {
            return res.status(404).json({ message: 'Reciclaje no encontrado' });
        }

        if (reciclaje.estado === "verificado") {
            return res.status(400).json({ message: 'El reciclaje ya ha sido verificado' });
        }

        reciclaje.estado = "verificado";
        reciclaje.idHolder = idValidador;
        await reciclaje.save();

        res.status(200).json({ message: 'Reciclaje verificado con éxito', reciclaje });
    } catch (error) {
        res.status(500).json({ message: 'Error al verificar el reciclaje', error });
    }
};

const historial = async (req, res) => {
    try {
        const usuario = req.params.id;

        // Buscar reciclajes por ID de usuario
        const reciclajes = await Reciclaje.find({ idUser: usuario });

        // Verificar si se encontraron reciclajes
        if (reciclajes.length === 0) {
            return res.status(404).send({
                status: "error",
                message: "No se encontraron registros"
            });
        }

        // Enviar respuesta
        return res.status(200).send({
            status: "success",
            reciclajes
        });
    } catch (error) {
        // Manejar errores
        return res.status(500).send({
            status: "error",
            message: "Error al buscar registros",
            error: error.message
        });
    }
};

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

const almacenadoPorMaterial = async (req, res) => {
    const usuario = req.params.id;
    const material = req.params.material;

    try {
        const resultado = await Reciclaje.aggregate([
            { $match: { idHolder: usuario, material: material } },
            { $group: { _id: null, totalKgs: { $sum: { $toDouble: "$cantidad" } }, reciclajes: { $push: "$$ROOT" } } }
        ]);

        if (resultado.length === 0) {
            return res.status(404).json({ message: "No se encontraron registros" });
        }

        const { reciclajes, totalKgs } = resultado[0];

        return res.status(200).json({ reciclajes, totalKgs });

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

const listaCerrados = (req, res) => {
    const usuario = req.params.id;

    Reciclaje.find(
        { idUser: usuario, estado: { $ne: "abierto" } },
        (error, reciclajes) => {
            if (error || !reciclajes) {
                return res.status(404).send({
                    status: error,
                    message: "no se encontro registro",
                });
            }

            const reciclajesInvertidos = reciclajes.reverse(); // invertir la lista

            return res.status(200).send({
                reciclajes: reciclajesInvertidos,
            });
        }
    );
};


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

const getReciclaje = async (req, res) => {

    try {
        const reciclaje = await Reciclaje.findById(req.params.id).exec();
        if (!reciclaje) {
            return res.status(404).json({
                status: 'error',
                message: 'Reciclaje no encontrado'
            });
        }
        return res.status(200).json({
            status: 'success',
            data: {
                reciclaje
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};

//falta testeo funcion
const deleteReciclaje = async (req, res) => {


    const reciclajeId = req.params.id;
    try {
        const reciclaje = await Reciclaje.findById(reciclajeId);

        if (!reciclaje) {
            return res.status(404).json({ message: 'Reciclaje no encontrado' });
        }

        await reciclaje.remove();
        res.status(200).json({ message: 'Reciclaje eliminado con éxito' });
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor', error });
    }

}


const getReciclajesByHolderId = async (req, res) => {
    try {
        const holderId = req.query.holderId;
        const reciclajes = await Reciclaje.find({ idHolder: holderId });

        res.status(200).json(reciclajes);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener reciclajes por holderId: " + error.message });
    }
};


const getReciclajesByHolderIdAndMaterial = async (req, res) => {
    try {
        const idHolder = req.params.idHolder;
        const material = req.params.material;

        if (!material) {
            res.status(400).json({ message: "Error: Se requiere el parámetro material." });
            return;
        }

        const reciclajes = await Reciclaje.find({ idHolder, material });

        const total = reciclajes.reduce((accumulator, reciclaje) => {
            return accumulator + reciclaje.cantidad;
        }, 0);

        res.status(200).json({ reciclajes, total });
    } catch (error) {
        res.status(500).json({ message: "Error al obtener reciclajes por holderId y material: " + error.message });
    }
};

const getReciclajesByHolderIdAndMaterialandEstado = async (req, res) => {
    try {
        const idHolder = req.params.idHolder;
        const material = req.params.material;
        const estado = req.params.estado

        if (!material) {
            res.status(400).json({ message: "Error: Se requiere el parámetro material." });
            return;
        }

        const reciclajes = await Reciclaje.find({ idHolder, material, estado });

        const total = reciclajes.reduce((accumulator, reciclaje) => {
            return accumulator + reciclaje.cantidad;
        }, 0);

        res.status(200).json({ reciclajes, total });
    } catch (error) {
        res.status(500).json({ message: "Error al obtener reciclajes por holderId y material: " + error.message });
    }
};


module.exports = {
    test, register, login, profile, all, list, update, upload, avatar,  //controles de usuario
    

    //controles de reciclaje
    crearReciclaje, verificacion, historial, historialMaterial, historialEstado, historialMaterialEstado, getReciclajesByHolderId, getReciclajesByHolderIdAndMaterial,

    //controles CO2
    co2User, listaAbiertos, listaCerrados, deleteUser, deleteReciclaje, getReciclaje, almacenadoPorMaterial, getReciclajesByHolderIdAndMaterialandEstado,




}