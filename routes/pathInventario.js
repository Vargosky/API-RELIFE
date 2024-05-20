const express = require('express');
const router = express.Router();
const inventarioController = require('../controllers/ctrlInventario');

const auth = require("../middlewares/auth.js")

router.get('/list/',auth.auth, inventarioController.getInventarios);
router.get('/search/:id',auth.auth, inventarioController.getInventarioById);
router.post('/create/',auth.auth, inventarioController.createInventario);
router.put('/update/:id',auth.auth, inventarioController.updateInventario);
router.delete('/delete/:id',auth.auth, inventarioController.deleteInventario);

module.exports = router;