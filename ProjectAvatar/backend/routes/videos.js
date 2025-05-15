const express = require('express');
const router = express.Router();
const { crearVideo, obtenerVideos } = require('../controllers/videoController');

router.post('/', crearVideo);
router.get('/', obtenerVideos);

module.exports = router;