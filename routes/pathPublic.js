const express = require("express");
const router = express.Router();
const PublicController = require("../controllers/ctrlPublic");



router.get("/top",PublicController.obtenerTopUsuarios);
router.get("/buscar/:nick",PublicController.buscarUsuarioPorNick);

module.exports = router;