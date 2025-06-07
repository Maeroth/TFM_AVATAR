const express = require('express');
const router = express.Router();
const upload = require('../controllers/uploadController');
const { obtenerAvatares, generarVideo, obtenerVocesMicrosoft, recibirWebhook, recibirWebhookCrearAvatar, buscarVideos, crearAgente, cargarAvatarStream, guardarAvatarStream, crearAvatar, borrarVideo  } = require('../controllers/didController');

// GET /api/d-id/avatares
router.get('/avatares', obtenerAvatares);

// POST /api/d-id/generar-video
//router.post('/generarVideo', generarVideo);

router.get("/buscarVideos", buscarVideos);
router.get("/voces/microsoft", obtenerVocesMicrosoft);
router.get("/cargarAvatarStream", cargarAvatarStream);

router.post('/generarVideo', upload, generarVideo);
router.post("/guardarAvatarStream", guardarAvatarStream);
router.post("/crearAvatar", upload, crearAvatar);
router.post("/webhook", express.json(), recibirWebhook);
router.post("/webhookCrearAvatar", express.json(), recibirWebhookCrearAvatar);
router.post("/crearAgente", express.json(), crearAgente); 

router.delete("/borrarVideo/:id", borrarVideo); 




module.exports = router;
