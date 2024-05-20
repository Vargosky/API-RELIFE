// Importamos el modelo Bodega
const Bodega = require('../model/Bodega');

// Crear una nueva bodega
const createBodega = async (req, res) => {
    try {
        const bodega = new Bodega(req.body);
        await bodega.save();
        res.status(201).json({ message: 'Bodega creada exitosamente', bodega });
    } catch (error) {
        res.status(400).json({ message: 'Error al crear la bodega', error });
    }
};

// Obtener todas las bodegas
const getBodegas = async (req, res) => {
    try {
        const bodegas = await Bodega.find();
        res.status(200).json({ bodegas });
    } catch (error) {
        res.status(400).json({ message: 'Error al obtener las bodegas', error });
    }
};

const getBodegasByUserId = async (req, res) => {
    try {
        const userId = req.params.idUser;
        const bodegas = await Bodega.find({ idUser: userId });
        res.status(200).json({ bodegas });
    } catch (error) {
        res.status(400).json({ message: 'Error al obtener las bodegas del usuario', error });
    }
};

// Obtener una bodega por ID
const getBodegaById = async (req, res) => {
    try {
        const bodega = await Bodega.findById(req.params.id);
        res.status(200).json({ bodega });
    } catch (error) {
        res.status(400).json({ message: 'Error al obtener la bodega', error });
    }
};

// Actualizar una bodega por ID
const updateBodega = async (req, res) => {
    try {
        const bodega = await Bodega.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json({ message: 'Bodega actualizada exitosamente', bodega });
    } catch (error) {
        res.status(400).json({ message: 'Error al actualizar la bodega', error });
    }
};

// Eliminar una bodega por ID
const deleteBodega = async (req, res) => {
    try {
        await Bodega.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Bodega eliminada exitosamente' });
    } catch (error) {
        res.status(400).json({ message: 'Error al eliminar la bodega', error });
    }
};

module.exports = {
    createBodega,
    getBodegas,
    getBodegaById,
    updateBodega,
    deleteBodega,
    getBodegaById,
    getBodegasByUserId,
};
