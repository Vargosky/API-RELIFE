const Inventario = require('../model/Inventario');

exports.getInventarios = async (req, res) => {
    try {
        const inventarios = await Inventario.find();
        res.json(inventarios);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getInventarioById = async (req, res) => {
    try {
        const inventario = await Inventario.findById(req.params.id);
        if (!inventario) {
            return res.status(404).json({ message: 'Inventario no encontrado' });
        }
        res.json(inventario);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createInventario = async (req, res) => {
    try {
        const inventario = new Inventario(req.body);
        const savedInventario = await inventario.save();
        res.status(201).json(savedInventario);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.updateInventario = async (req, res) => {
    try {
        const updatedInventario = await Inventario.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updatedInventario) {
            return res.status(404).json({ message: 'Inventario no encontrado' });
        }
        res.json(updatedInventario);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.deleteInventario = async (req, res) => {
    try {
        const deletedInventario = await Inventario.findByIdAndDelete(req.params.id);
        if (!deletedInventario) {
            return res.status(404).json({ message: 'Inventario no encontrado' });
        }
        res.json({ message: 'Inventario eliminado' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
