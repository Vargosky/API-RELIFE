const express = require("express");
const router = express.Router();
const ContactoController = require('../controllers/ctrlContacto');


router.post("/solicitar/:usuarioSolicitadoId", ContactoController.solicitarContacto);

module.exports = router;