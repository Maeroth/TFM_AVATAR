const express = require('express');
const router = express.Router();
const { publicarVideoEnX } = require('../controllers/xController');

router.post("/publicarVideoEnX", publicarVideoEnX); //Publicar en Twitter

module.exports = router;