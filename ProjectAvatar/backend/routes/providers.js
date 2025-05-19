const express = require('express');
const router = express.Router();
const { nuevoProveedor } = require('../controllers/providerController');
const { obtenerComboProveedores } = require('../controllers/providerController');
const { obtenerMejorProveedor } = require("../controllers/bestProviderController");
const { obtenerProveedorPorId } = require("../controllers/providerController");
const { editarProveedor } = require("../controllers/providerController");
const { borrarProveedor } = require("../controllers/providerController");

router.post("/mejorProveedor", obtenerMejorProveedor);
router.post("/crear", nuevoProveedor);
router.get("/comboProveedores", obtenerComboProveedores);
router.get("/detalle/:id", obtenerProveedorPorId);
router.put("/editar/:id", editarProveedor); //usamos put porque ya existe un proveedor, y vamos actualizar
router.delete("/borrar/:id", borrarProveedor); //usamos delete porque vamos a borrar

module.exports = router;