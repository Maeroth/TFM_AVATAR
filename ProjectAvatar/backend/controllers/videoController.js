const Video = require('../models/Video');

// Crear un nuevo vídeo
const crearVideo = async (req, res) => {
  try {
    const nuevoVideo = new Video(req.body);
    const guardado = await nuevoVideo.save();
    res.status(201).json(guardado);
  } catch (err) {
    res.status(500).json({ error: 'Error al guardar el vídeo' });
  }
};

// Obtener todos los vídeos
const obtenerVideos = async (req, res) => {
  try {
    const videos = await Video.find().sort({ fechaCreacion: -1 });
    res.status(200).json(videos);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener vídeos' });
  }
};

module.exports = { crearVideo, obtenerVideos };