const express = require('express');
const router = express.Router();
const multer = require("multer");
const auth = require("../middlewares/auth.js")
const {
    createBodega,
    getBodegas,
    getBodegaById,
    updateBodega,
    deleteBodega,
    getBodegasByUserId,
} = require('../controllers/crtBodega');



// Rutas para bodegas
router.post('/create/', auth.auth, createBodega);
router.get('/list/', auth.auth, getBodegas);
router.get('/getBodega/:id', auth.auth, getBodegaById);
router.put('update/:id', auth.auth, updateBodega);
router.delete('/delete/:id', auth.auth, deleteBodega);
router.get('/listByUser/:idUser', auth.auth, getBodegasByUserId);


module.exports = router;
