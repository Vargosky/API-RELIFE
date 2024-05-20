const express = require("express");
const router = express.Router();
const PublicationController = require("../controllers/ctrlPublication.js")



//definir rutas

router.get("/test-publication",PublicationController.test);

module.exports = router;