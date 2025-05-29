const express = require('express');
const router = express.Router();
const upload = require('../controllers/uploadController');
const { obtenerAvatares, generarVideo, obtenerVocesMicrosoft, recibirWebhook, buscarVideos, crearAgente, cargarAvatarStream } = require('../controllers/didController');

// GET /api/d-id/avatares
router.get('/avatares', obtenerAvatares);

// POST /api/d-id/generar-video
//router.post('/generarVideo', generarVideo);
router.post('/generarVideo', upload, generarVideo);
router.get("/buscarVideos", buscarVideos);

router.get("/voces/microsoft", obtenerVocesMicrosoft);

router.get("/cargarAvatarStream", cargarAvatarStream);

router.post("/webhook", express.json(), recibirWebhook); // usar express.json() si no usas body-parser global

router.post("/crearAgente", express.json(), crearAgente); 



module.exports = router;
