const { TwitterApi } = require('twitter-api-v2');
const Video = require('../models/Video');
const path = require('path');
const fs = require('fs');
const axios = require('axios');

// Cliente de Twitter con credenciales
const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET
});

// Descarga el vídeo desde una URL a una ruta local
const descargarArchivoTemporal = async (url, destino) => {
  const writer = fs.createWriteStream(destino);
  const response = await axios.get(url, { responseType: 'stream' });

  return new Promise((resolve, reject) => {
    response.data.pipe(writer);
    writer.on('finish', () => resolve(destino));
    writer.on('error', reject);
  });
};

// Publicar en Twitter
const publicarEnTwitter = async ({ videoPath, titulo, descripcion }) => {
  const mediaData = await twitterClient.v1.uploadMedia(videoPath, {
    mimeType: 'video/mp4',
    longVideo: true
  });

  const tweetText = `${titulo}\n\n${descripcion}`;

  const tweet = await twitterClient.v2.tweet({
    text: tweetText,
    media: { media_ids: [mediaData] }
  });

  return tweet.data;
};

// Controlador Express
const publicarVideoEnX = async (req, res) => {
  try {
    const { videoId } = req.body;

    const video = await Video.findById(videoId);
    if (!video) return res.status(404).json({ error: 'Vídeo no encontrado' });
    if (video.publicado) return res.status(400).json({ error: 'El vídeo ya fue publicado' });

    // Ruta temporal
    const tempDir = path.join(__dirname, '..', 'uploads', 'temp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

    const tempPath = path.join(tempDir, `video_${video._id}.mp4`);

    // Descargar vídeo
    await descargarArchivoTemporal(video.url, tempPath);

    // Publicar en Twitter
    const tweetData = await publicarEnTwitter({
      videoPath: tempPath,
      titulo: video.titulo,
      descripcion: video.descripcion
    });

    // Guardar cambios en la base de datos
    video.publicado = true;
    video.url_publicacion = `https://x.com/i/web/status/${tweetData.id}`;
    await video.save();

    // Eliminar archivo temporal
    fs.unlink(tempPath, (err) => {
      if (err) console.error("⚠️ Error eliminando archivo temporal:", err);
    });

    res.json({ ok: true, tweetUrl: video.url_tweet });

  } catch (err) {
    console.error("❌ Error publicando en Twitter:", err);
    res.status(500).json({ error: 'Error al publicar en Twitter' });
  }
};

module.exports = { publicarVideoEnX };