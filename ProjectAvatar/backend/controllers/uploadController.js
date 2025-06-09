const multer = require('multer');               // Para gestionar subidas de archivos
const path = require('path');                   // Para manejar rutas de archivos
const fs = require('fs');                       // Para interactuar con el sistema de archivos
const ffmpeg = require('fluent-ffmpeg');        // Para convertir formatos multimedia
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg'); // Instalador de FFmpeg compatible
const { Readable } = require('stream');         // Para crear streams a partir de buffers

// Configuramos FFmpeg con la ruta instalada automáticamente
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

// Creamos directorios necesarios para almacenar los archivos si aún no existen
['uploads/mp3', 'uploads/images', 'uploads/videos'].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Configuramos Multer para almacenar los archivos en memoria (no directamente en disco)
const upload = multer({ storage: multer.memoryStorage() });

// Convierte un buffer de audio en formato WebM a un archivo MP3 y lo guarda en disco
const convertirBufferWebmAMp3 = (buffer, outputPath) => {
  return new Promise((resolve, reject) => {
    // Creamos un stream legible a partir del buffer recibido
    const readableStream = new Readable();
    readableStream._read = () => {};
    readableStream.push(buffer);
    readableStream.push(null);

    // Procesamos el stream con FFmpeg para convertirlo a MP3
    ffmpeg(readableStream)
      .inputFormat('webm')      // Formato de entrada
      .toFormat('mp3')          // Formato de salida
      .on('end', () => resolve(outputPath))  // Éxito
      .on('error', reject)      // Error
      .save(outputPath);        // Guardar archivo
  });
};


// Middleware que gestiona subida de audio, imagen y vídeo, y convierte si es necesario
const uploadAndConvert = [
  // Definimos los campos esperados en la solicitud
  upload.fields([
    { name: 'audio', maxCount: 1 },
    { name: 'background_image', maxCount: 1 },
    { name: 'video', maxCount: 1 } // Nuevo campo para permitir subida de vídeos
  ]),

  // Función async que transforma y guarda los archivos subidos
  async (req, res, next) => {
    try {
      // AUDIO
      const audioFile = req.files?.audio?.[0];
      if (audioFile && audioFile.mimetype === 'audio/webm') {
        const uniqueName = `${Date.now()}.mp3`;
        const outputPath = path.join('uploads/mp3', uniqueName);

        console.log("Convirtiendo audio buffer a mp3...");
        await convertirBufferWebmAMp3(audioFile.buffer, outputPath);

        // Actualizamos los metadatos del archivo para futuras referencias
        req.files.audio[0].path = outputPath;
        req.files.audio[0].filename = uniqueName;
        req.files.audio[0].mimetype = 'audio/mp3';
        req.files.audio[0].originalname = uniqueName;
      }

      // IMAGEN DE FONDO
      const imageFile = req.files?.background_image?.[0];
      if (imageFile && imageFile.buffer) {
        const ext = path.extname(imageFile.originalname) || '.png'; // Mantenemos extensión original
        const imageName = `${Date.now()}${ext}`;
        const imagePath = path.join('uploads/images', imageName);
        fs.writeFileSync(imagePath, imageFile.buffer); // Guardamos el archivo en disco

        // Añadimos metadatos para futuras operaciones
        req.files.background_image[0].path = imagePath;
        req.files.background_image[0].filename = imageName;
      }

      // VÍDEO
      const videoFile = req.files?.video?.[0];
      if (videoFile && videoFile.buffer && videoFile.mimetype === 'video/mp4') {
        const videoName = `${Date.now()}.mp4`;
        const videoPath = path.join('uploads/videos', videoName);
        fs.writeFileSync(videoPath, videoFile.buffer); // Guardamos vídeo tal cual

        // Actualizamos los datos del vídeo
        req.files.video[0].path = videoPath;
        req.files.video[0].filename = videoName;
      }

      // Continuamos con el siguiente middleware o controlador
      next();
    } catch (err) {
      // En caso de error, lo mostramos y devolvemos error al cliente
      console.error("Error en subida o conversión:", err);
      res.status(500).json({ error: "Error procesando archivos" });
    }
  }
];


module.exports = uploadAndConvert;
