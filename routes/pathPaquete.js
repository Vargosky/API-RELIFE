const express = require("express");
const router = express.Router();
const PaqueteConroller = require("../controllers/ctrlPaquete");
const auth = require("../middlewares/auth.js")





//definir rutas
router.post("/crear/",PaqueteConroller.crearPaqueteReciclaje);
router.get("/centro/:centroAcopio", PaqueteConroller.obtenerPaquetesPorCentroAcopio);
router.get("/centro/:centroAcopio/:estado", PaqueteConroller.obtenerPaquetesPorCentroAcopioYEstado);
router.post("/unZip/", PaqueteConroller.actualizarReciclajes);
module.exports = router;