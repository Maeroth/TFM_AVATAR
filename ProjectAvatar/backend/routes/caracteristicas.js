const express = require('express');
const router = express.Router();
const { getCaracteristicasConPesos } = require("../controllers/caracteristicaController");
const { actualizarPesos } = require("../controllers/caracteristicaController");

// GET /api/caracteristicas
router.get('/', getCaracteristicasConPesos);

// POST /api/caracteristicas/actualizar
router.post('/actualizar', actualizarPesos);

module.exports = router;
