const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const { Readable } = require('stream');

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

// Crear carpetas si no existen
['uploads/mp3', 'uploads/images', 'uploads/videos'].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Multer configurado para almacenar en memoria
const upload = multer({ storage: multer.memoryStorage() });

// Convierte Buffer webm a .mp3 y guarda en disco
const convertirBufferWebmAMp3 = (buffer, outputPath) => {
  return new Promise((resolve, reject) => {
    const readableStream = new Readable();
    readableStream._read = () => {};
    readableStream.push(buffer);
    readableStream.push(null);

    ffmpeg(readableStream)
      .inputFormat('webm')
      .toFormat('mp3')
      .on('end', () => resolve(outputPath))
      .on('error', reject)
      .save(outputPath);
  });
};

// Middleware para subir y convertir directamente a mp3, guardar imagen y vídeo
const uploadAndConvert = [
  upload.fields([
    { name: 'audio', maxCount: 1 },
    { name: 'background_image', maxCount: 1 },
    { name: 'video', maxCount: 1 } // 👈 nuevo campo para vídeo
  ]),
  async (req, res, next) => {
    try {
      // AUDIO
      const audioFile = req.files?.audio?.[0];
      if (audioFile && audioFile.mimetype === 'audio/webm') {
        const uniqueName = `${Date.now()}.mp3`;
        const outputPath = path.join('uploads/mp3', uniqueName);

        console.log("🔁 Convirtiendo audio buffer a mp3...");
        await convertirBufferWebmAMp3(audioFile.buffer, outputPath);

        req.files.audio[0].path = outputPath;
        req.files.audio[0].filename = uniqueName;
        req.files.audio[0].mimetype = 'audio/mp3';
        req.files.audio[0].originalname = uniqueName;
      }

      // IMAGEN
      const imageFile = req.files?.background_image?.[0];
      if (imageFile && imageFile.buffer) {
        const ext = path.extname(imageFile.originalname) || '.png';
        const imageName = `${Date.now()}${ext}`;
        const imagePath = path.join('uploads/images', imageName);
        fs.writeFileSync(imagePath, imageFile.buffer);

        req.files.background_image[0].path = imagePath;
        req.files.background_image[0].filename = imageName;
      }

      // VÍDEO
      const videoFile = req.files?.video?.[0];
      if (videoFile && videoFile.buffer && videoFile.mimetype === 'video/mp4') {
        const videoName = `${Date.now()}.mp4`;
        const videoPath = path.join('uploads/videos', videoName);
        fs.writeFileSync(videoPath, videoFile.buffer);

        req.files.video[0].path = videoPath;
        req.files.video[0].filename = videoName;
      }

      next();
    } catch (err) {
      console.error("❌ Error en subida o conversión:", err);
      res.status(500).json({ error: "Error procesando archivos" });
    }
  }
];

module.exports = uploadAndConvert;
