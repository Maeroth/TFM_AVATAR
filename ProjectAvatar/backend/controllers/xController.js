// Importamos el cliente de Twitter v2
const { TwitterApi } = require('twitter-api-v2');

// Modelo de Video para consultar y actualizar la base de datos
const Video = require('../models/Video');

// Módulos de sistema para manejar archivos y rutas
const path = require('path');
const fs = require('fs');

const axios = require('axios');

// Instancia del cliente de Twitter con las credenciales desde variables de entorno
const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET
});


// Descarga un archivo desde una URL a una ruta local, usando streaming para eficiencia
const descargarArchivoTemporal = async (url, destino) => {
  const writer = fs.createWriteStream(destino); // Creamos el archivo de destino
  const response = await axios.get(url, { responseType: 'stream' }); // Solicitamos el vídeo

  return new Promise((resolve, reject) => {
    response.data.pipe(writer);        // Enlazamos la respuesta al archivo
    writer.on('finish', () => resolve(destino)); // Cuando termine, resolvemos
    writer.on('error', reject);        // Si hay error al escribir, lo rechazamos
  });
};


// Publica un vídeo en Twitter con un título y descripción
const publicarEnTwitter = async ({ videoPath, titulo, descripcion }) => {
  // Subimos el vídeo como media a Twitter (modo largo para vídeos > 30 segundos)
  const mediaData = await twitterClient.v1.uploadMedia(videoPath, {
    mimeType: 'video/mp4',
    longVideo: true
  });

  // Componemos el texto del tweet
  const tweetText = `${titulo}\n\n${descripcion}`;

  // Publicamos el tweet con el vídeo adjunto
  const tweet = await twitterClient.v2.tweet({
    text: tweetText,
    media: { media_ids: [mediaData] }
  });

  // Devolvemos la información del tweet publicado
  return tweet.data;
};


// Controlador que publica un vídeo generado en X (Twitter)
const publicarVideoEnX = async (req, res) => {
  try {
    const { videoId } = req.body; // Recibimos el ID del vídeo desde el frontend

    // Buscamos el vídeo en la base de datos
    const video = await Video.findById(videoId);
    if (!video) return res.status(404).json({ error: 'Vídeo no encontrado' });
    if (video.publicado) return res.status(400).json({ error: 'El vídeo ya fue publicado' });

    // Creamos una carpeta temporal para almacenar el vídeo descargado
    const tempDir = path.join(__dirname, '..', 'uploads', 'temp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

    const tempPath = path.join(tempDir, `video_${video._id}.mp4`);

    // Descargamos el vídeo desde su URL (hosteado externamente)
    await descargarArchivoTemporal(video.url, tempPath);

    // Lo publicamos en Twitter con los datos del vídeo
    const tweetData = await publicarEnTwitter({
      videoPath: tempPath,
      titulo: video.titulo,
      descripcion: video.descripcion
    });

    // Marcamos el vídeo como publicado en la base de datos y guardamos la URL
    video.publicado = true;
    video.url_publicacion = `https://x.com/i/web/status/${tweetData.id}`;
    await video.save();

    // Eliminamos el archivo temporal descargado
    fs.unlink(tempPath, (err) => {
      if (err) console.error("Error eliminando archivo temporal:", err);
    });

    // Devolvemos la URL del tweet como respuesta
    res.json({ ok: true, tweetUrl: video.url_tweet });

  } catch (err) {
    // Capturamos cualquier error inesperado
    console.error("Error publicando en Twitter:", err);
    res.status(500).json({ error: 'Error al publicar en Twitter' });
  }
};

module.exports = { publicarVideoEnX };