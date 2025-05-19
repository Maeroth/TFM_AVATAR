const express = require('express');
const router = express.Router();
const { nuevoProveedor } = require('../controllers/providerController');
const { obtenerComboProveedores } = require('../controllers/providerController');
const { obtenerMejorProveedor } = require("../controllers/bestProviderController");
const { obtenerProveedorPorId } = require("../controllers/providerController");

router.post("/mejorProveedor", obtenerMejorProveedor);
router.post("/crear", nuevoProveedor);
router.get("/comboProveedores", obtenerComboProveedores);
router.get("/detalle/:id", obtenerProveedorPorId);

module.exports = router;