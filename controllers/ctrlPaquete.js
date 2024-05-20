const Paquete = require("../model/Paquete");
const Reciclaje = require("../model/Reciclaje");
const equivalencias = require("../equivalencia.json");

const calcularCO2E = (material, cantidad) => {
    const equivalencia = equivalencias.find(
        (equiv) => equiv.material === material
    );

    if (!equivalencia) {
        throw new Error(
            `No se encontró la equivalencia de CO2 para el material: ${material}`
        );
    }

    const co2Equivalente = equivalencia.CO2E * cantidad;
    return co2Equivalente;
};

function sumArray(array) {
    let total = 0;
    for (let i = 0; i < array.length; i++) {
        total += array[i].cantidad;
    }
    return total;
}

const actualizarReciclaje = async (reciclajeId, paqueteId) => {
    try {
        await Reciclaje.updateOne(
            { _id: reciclajeId },
            {
                $set: {
                    estado: "empaquetado",
                    idPaquete: paqueteId,
                },
            }
        );
    } catch (error) {
        console.error(error);
        throw new Error("Error al actualizar el reciclaje");
    }
};

const crearPaqueteVacio = async (material, centroAcopio, cantidad) => {
    try {
        const paquete = new Paquete({
            material: material,
            cantidad: cantidad,
            centroAcopio,
            reciclajes: [],
        });

        await paquete.save();
        return paquete;
    } catch (error) {
        console.error(error);
        throw new Error("Error al crear el paquete vacío");
    }
};

const agregarReciclajeAPaquete = async (paqueteId, reciclajeId) => {
    try {
        await Paquete.updateOne(
            { _id: paqueteId },
            {
                $push: {
                    reciclajes: reciclajeId,
                },
            }
        );
    } catch (error) {
        console.error(error);
        throw new Error("Error al agregar el reciclaje al paquete");
    }
};

const actualizarReciclajeConCantidad = async (
    reciclajeId,
    nuevoEstado,
    nuevoIdPaquete,
    nuevaCantidad
) => {
    try {
        const reciclaje = await Reciclaje.findById(reciclajeId);

        if (!reciclaje) {
            throw new Error("Reciclaje no encontrado");
        }

        reciclaje.estado = nuevoEstado;
        reciclaje.idPaquete = nuevoIdPaquete;
        reciclaje.cantidad = nuevaCantidad;

        await reciclaje.save();
        return reciclaje;
    } catch (error) {
        console.error(error);
        throw new Error("Error al actualizar el reciclaje");
    }
};

const crearReciclaje = async (
    idUser,
    material,
    cantidad,
    fechaCreacion,
    idHolder
) => {
    try {
        const reciclaje = new Reciclaje({
            idUser,
            material,
            cantidad,
            fechaCreacion,
            idHolder,
            estado: "verificado",
            // Añade aquí otros atributos si es necesario, como 'origen', 'idBodega', 'co2', etc.
        });

        await reciclaje.save();
        return reciclaje;
    } catch (error) {
        console.error(error);
        throw new Error("Error al crear el reciclaje");
    }
};

const crearPaqueteReciclaje = async (req, res) => {
    const { material, cantidad, centroAcopio } = req.body;
    const userId = centroAcopio;

    let reciclajesSeleccionados = [];
    let reciclajeDividido = null;

    let cantidadRestante;
    let cantidadAcumulada = 0;
    let cantidad_ = cantidad;
    try {
        const reciclajes = await Reciclaje.find({
            idHolder: centroAcopio,
            material: material,
            estado: "verificado",
        }).sort({ fechaCreacion: 1 });

        for (let reciclaje of reciclajes) {
            if (reciclaje && 0 < cantidad_) {
                cantidadAcumulada += reciclaje.cantidad;
                cantidad_ -= reciclaje.cantidad;
                const objeto = {
                    id: reciclaje._id,
                    fecha: reciclaje.fechaCreacion,
                    idUser: reciclaje.idUser,
                    idHolder: reciclaje.idHolder,
                    cantidad: reciclaje.cantidad,
                };
                reciclajesSeleccionados.push(reciclaje);
            } else {
                cantidadRestante = cantidad - cantidadAcumulada;
            }
        }

        //procesar el array de seleccionados

        if (cantidad_ === 0) {
            //cuando elvalor calza justo con los reciclajes
            //crear el paquete
            const paquete = await crearPaqueteVacio(material, centroAcopio, cantidad);
            for (reciclajeSeleccionado of reciclajesSeleccionados) {
                actualizarReciclaje(reciclajeSeleccionado._id, paquete._id);
                agregarReciclajeAPaquete(paquete._id, reciclajeSeleccionado._id);
            }
            res.status(200).json({
                "seleccion just": reciclajesSeleccionados,
                cantidadAcumulada: cantidadAcumulada,
                reciclajes,
                cantidadRestante,
                cantidad_,
            });
        } else {
            //cantidad no justa-->

            const ultimo = reciclajesSeleccionados[reciclajesSeleccionados.length - 1];
            let sum = 0;
            const paquete = await crearPaqueteVacio(material, centroAcopio, cantidad);
            for (reciclajeSeleccionado of reciclajesSeleccionados) {
                actualizarReciclaje(reciclajeSeleccionado._id, paquete._id);
                agregarReciclajeAPaquete(paquete._id, reciclajeSeleccionado._id);

            }
            cantidadRestante = Math.abs(cantidadAcumulada - cantidad); // debe tomar el valor que queda /// en valor absoluto buscar el ultimo reciclaje selecconado y actualizar



            actualizarReciclajeConCantidad(
                ultimo._id,
                "empaquetado",
                paquete._id,
                Math.abs(cantidadRestante - ultimo.cantidad)
            );
            //crear un nuevo reciclaje
            const reciclajeNuevo = new Reciclaje({
                idUser: ultimo.idUser,
                material: ultimo.material,
                cantidad: cantidadRestante,
                fechaCreacion: ultimo.fechaCreacion,
                idHolder: ultimo.idHolder,
                co2: calcularCO2E(ultimo.material, ultimo.cantidad),
                estado: "verificado",
                // Añade aquí otros atributos si es necesario, como 'origen', 'idBodega', 'co2', etc.
            });

            await reciclajeNuevo.save();

            res.status(200).json({
                message: "Paquete Creado",
                ultimo,
                reciclajeNuevo,
                cantidad: cantidad,
                cantidadRestante,
                cantidadAcumulada,
                sum

            });
        }
    } catch (error) {
        console.error(error);
        res
            .status(500)
            .json({ message: "Error al crear el paquete", userId, cantidad });
    }
};

const obtenerPaquetesPorCentroAcopio = async (req, res) => {
    const { centroAcopio } = req.params;

    try {
        const paquetes = await Paquete.find({ centroAcopio }).sort({ fechaCreacion: -1 });

        if (paquetes.length === 0) {
            return res.status(404).json({ message: 'No se encontraron paquetes para este centro de acopio.' });
        }

        res.status(200).json({ paquetes });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener los paquetes por centro de acopio.' });
    }
};

const   obtenerPaquetesPorCentroAcopioYEstado = async (req, res) => {
    const { centroAcopio, estado } = req.params;

    try {
        const paquetes = await Paquete.find({ centroAcopio: centroAcopio, estado:estado }).sort({ fechaCreacion: -1 });

        if (paquetes.length === 0) {
            return res.status(404).json({ message: 'No se encontraron paquetes para este centro de acopio.' });
        }

        res.status(200).json({ paquetes });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener los paquetes por centro de acopio.' });
    }
};





const desempaquetar = async (req, res) => {

    let params = req.body;
    const idPaquete = params.idPaquete;
    const centroAcopio = params.centroAcopio;
    const estado = params.estado; //este estado corresponde al que se cambiará, no en la busqueda
    let arreglo = [];

    try {
        // Buscar el paquete por su ID
        const paquete = await Paquete.findById(idPaquete);

        // Comprobar si el paquete existe
        if (!paquete) {
            return res.status(404).json({ message: 'Paquete no encontrado' });
        }

        // Actualizar el estado del paquete y, opcionalmente, el centro de acopio si se proporciona
        paquete.estado = estado;
        if (centroAcopio) {
            paquete.centroAcopio = centroAcopio;
        }
        await paquete.save();

        return res.status(200).json({ params, paquete });

    } catch (error) {
        // Manejo de errores en la consulta a la base de datos
        return res.status(500).json({ message: 'Error al desempaquetar el paquete', error });
    }
}


const actualizarReciclajes = async (req, res) => {
    const { idPaquete, idnewOwner, newEstado } = req.body;

    console.log("idPaquete:", idPaquete);
    console.log("idnewOwner:", idnewOwner);
    console.log("newEstado:", newEstado);

    try {
        // Buscar paquete por ID
        const paquete = await Paquete.findById(idPaquete);

        if (!paquete) {
            return res.status(404).json({ error: "Paquete no encontrado" });
        }

        console.log("Paquete encontrado:", paquete);

        // Actualizar reciclajes
        const reciclajesActualizados = await Promise.all(
            paquete.reciclajes.map(async (reciclajeId) => {
                const reciclaje = await Reciclaje.findById(reciclajeId);

                if (reciclaje) {
                    console.log("Reciclaje encontrado:", reciclaje);

                    reciclaje.idHolder = idnewOwner;
                    reciclaje.estado = newEstado;
                    await reciclaje.save();

                    console.log("Reciclaje actualizado:", reciclaje);
                } else {
                    console.log("Reciclaje no encontrado:", reciclajeId);
                }

                return reciclaje;
            })
        );

        // Cambiar el estado del paquete a cerrado
        paquete.estado = "cerrado";

        // Guardar cambios en el paquete
        paquete.reciclajes = reciclajesActualizados;
        await paquete.save();

        res.status(200).json({ message: "Reciclajes actualizados y paquete cerrado correctamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: `Error al actualizar los reciclajes y cerrar el paquete: ${error.message}`, idPaquete, idnewOwner, newEstado });
    }
};



module.exports = { crearPaqueteReciclaje, obtenerPaquetesPorCentroAcopio, desempaquetar, actualizarReciclajes, obtenerPaquetesPorCentroAcopioYEstado };