const express = require("express");
const multer = require("multer");
const router = express.Router();
const UserController = require("../controllers/ctrlUser.js")

const auth = require("../middlewares/auth.js")

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './upload/avatars/');
    },
    filename: function (req, file, cb) {
        cb(null, "avatar-" + Date.now() + file.originalname)
    }
});




//definir rutas
const upload = multer({storage:storage});

router.get("/test",auth.auth,UserController.test);
router.post("/register",UserController.register);
router.post("/login",UserController.login);
router.get("/profile/:id",auth.auth,UserController.profile);
router.get("/profiles",auth.auth,UserController.all);
router.get("/list/:page",auth.auth,UserController.list);
router.put("/update",auth.auth,UserController.update);

//falta el delete de usuarios

router.post('/upload', [upload.single('avatar'),auth.auth],UserController.upload);
router.get("/avatar/:file",auth.auth,UserController.avatar);

//reciclajes funcionando

router.post("/new-reciclaje",auth.auth,UserController.crearReciclaje); //crear reciclaje
router.put("/reciclaje/verifica/:id", auth.auth, UserController.verificacion);//get verifica revisar
//falta el getreciclaje por id o por id corto o por email
//get por _id
router.get("/reciclaje/:id",auth.auth,UserController.getReciclaje);
//necesito una ruta+funcion que me permita verificar

router.get("/historial/:id",auth.auth,UserController.historial);//traer todos los reciclajes bajo un estado  de un id
router.get("/historial/:id/:material",auth.auth,UserController.historialMaterial);

router.get("/historial/:id/:material/:estado",auth.auth,UserController.historialMaterialEstado);
router.get("/open/:id",auth.auth,UserController.listaAbiertos);
router.get("/close/:id",auth.auth,UserController.listaCerrados);

//deletes
router.delete("/delete/",auth.auth,UserController.deleteUser);//funcionando
router.delete("/delete-reciclaje/:id",auth.auth,UserController.deleteReciclaje);//falta testep


router.get("/almacenado/:id/:material",auth.auth,UserController.almacenadoPorMaterial); //almacenados por material cuanto tengo almacenado de ese material


//faltantes
//totales como el total de co2 de un usuario y por material y estado !!!!!!!!se agrego a los metodos existentes

//sumar distintos materiales de reciclaje de un usuario se hizo como helper
router.get("/co2/:material/:cantidad",auth.auth,UserController.co2User) //convertir los recicclajes en co2 equivalente


//entrega todos reciclajes almacenados de un id
router.get("/holder/:idHolder", auth.auth, UserController.getReciclajesByHolderId);

//entrega los reciclajes almacenados de un id por material
router.get("/holder/:idHolder/:material", auth.auth, UserController.getReciclajesByHolderIdAndMaterial);

//entrega los reciclajes almacenados de un id por material y estado
router.get("/holder/:idHolder/:material/:estado", auth.auth, UserController.getReciclajesByHolderIdAndMaterialandEstado);

module.exports = router;