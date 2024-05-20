const express = require("express");
const router = express.Router();
const FollowController = require("../controllers/ctrlFollow")



//definir rutas

router.get("/test-follow",FollowController.test);

module.exports = router;