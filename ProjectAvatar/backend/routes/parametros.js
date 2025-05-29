const express = require('express');
const router = express.Router();
const { getParametros, guardarParametros } = require('../controllers/parametrosController');

router.get('/', getParametros);
router.post('/', guardarParametros);

module.exports = router;