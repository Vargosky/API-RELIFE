const express = require("express");
const router = express.Router();
const {
    createPlanta,
    getAllPlantas,
    getPlantaById,
    updatePlanta,
    deletePlanta
} = require("../controllers/ctrlPlanta");

router.post("/create/", createPlanta);
router.get("/list/", getAllPlantas);
router.get("/:id", getPlantaById);
router.put("/:id", updatePlanta);
router.delete("/:id", deletePlanta);

module.exports = router;