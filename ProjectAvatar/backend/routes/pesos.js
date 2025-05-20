const express = require('express');
const router = express.Router();
const { getPesos } = require('../controllers/pesoController');

// GET /api/pesos
router.get('/', getPesos);

module.exports = router;
