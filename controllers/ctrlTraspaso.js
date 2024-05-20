const Traspaso = require('../model/Traspaso.js');

const createTraspaso = async (req, res) => {
    try {
        // Extraer los datos del traspaso del cuerpo de la solicitud
        const { idReciclaje, idDuenoAnterior, idDuenoNuevo, cantidad, material } = req.body;

        // Crear una nueva instancia del modelo Traspaso
        const newTraspaso = new Traspaso({
            idReciclaje,
            idDuenoAnterior,
            idDuenoNuevo,
            cantidad,
            material
        });

        // Guardar el traspaso en la base de datos
        const savedTraspaso = await newTraspaso.save();

        // Devolver el traspaso guardado como respuesta
        res.status(201).json(savedTraspaso);
    } catch (error) {
        console.error('Error al crear el traspaso:', error);
        res.status(400).json({ message: 'Error al crear el traspaso', error });
    }
};





module.exports = { createTraspaso };