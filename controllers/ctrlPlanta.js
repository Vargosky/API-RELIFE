const Paquete = require("../model/Paquete");
const Reciclaje = require("../model/Reciclaje");
const equivalencias = require("../equivalencia.json");
const Planta = require("../model/Planta");

// controladorPlanta.js

const createPlanta = async (req, res) => {
    try {
        const planta = new Planta(req.body);
        const savedPlanta = await planta.save();
        res.status(201).json(savedPlanta);
    } catch (error) {
        res.status(500).json({ message: "Error al agregar planta: " + error.message });
    }
};

const getAllPlantas = async (req, res) => {
    try {
        const plantas = await Planta.find();
        res.status(200).json(plantas);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener plantas: " + error.message });
    }
};

const getPlantaById = async (req, res) => {
    try {
        const planta = await Planta.findById(req.params.id);
        if (!planta) {
            res.status(404).json({ message: "Planta no encontrada" });
        } else {
            res.status(200).json(planta);
        }
    } catch (error) {
        res.status(500).json({ message: "Error al obtener planta: " + error.message });
    }
};

const updatePlanta = async (req, res) => {
    try {
        const updatedPlanta = await Planta.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedPlanta) {
            res.status(404).json({ message: "Planta no encontrada" });
        } else {
            res.status(200).json(updatedPlanta);
        }
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar planta: " + error.message });
    }
};

const deletePlanta = async (req, res) => {
    try {
        const deletedPlanta = await Planta.findByIdAndDelete(req.params.id);
        if (!deletedPlanta) {
            res.status(404).json({ message: "Planta no encontrada" });
        } else {
            res.status(200).json({ message: "Planta eliminada" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar planta: " + error.message });
    }
};

module.exports = {
    createPlanta,
    getAllPlantas,
    getPlantaById,
    updatePlanta,
    deletePlanta
};


