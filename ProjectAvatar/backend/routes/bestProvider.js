// routes/bestProvider.js
const express = require("express");
const router = express.Router();
const { obtenerMejorProveedor } = require("../controllers/bestProviderController");

router.post("/", obtenerMejorProveedor);

module.exports = router;