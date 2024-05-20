const express = require("express");
const multer = require("multer");
const router = express.Router();
const UserController = require("../controllers/ctrlUser.js");
const ReciclajeController = require("../model/Reciclaje.js");
const auth = require("../middlewares/auth.js");


//creacion Reciclaje

router.post("/newReciclaje",auth.auth,UserController.crearReciclaje); //crear reciclaje
router.get("/reciclaje/:id",auth.auth,UserController.verificacion); //get reciclaje
router.get("/historial/:id",auth.auth,UserController.verificacion); //get historial

//traer todos los reciclajes bajo un estado  de un id

//traer todos los reciclajes que posee o almacena un id





//sumar distintos materiales de reciclaje de un usuario

//convertir los recicclajes en co2 equivalente



module.exports = router;