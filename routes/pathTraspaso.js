const express = require("express");
const router = express.Router();
const TraspasoController = require("../controllers/ctrlTraspaso");
const auth = require("../middlewares/auth.js")


// CREATE
router.post("/create",auth.auth, TraspasoController.createTraspaso);



module.exports = router;
