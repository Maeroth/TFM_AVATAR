const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const { Readable } = require('stream');

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

// Crear carpetas si no existen
['uploads/mp3', 'uploads/images'].forEach(dir => {
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

// Middleware para subir y convertir directamente a mp3
const uploadAndConvert = [
  upload.fields([
    { name: 'audio', maxCount: 1 },
    { name: 'background_image', maxCount: 1 }
  ]),
  async (req, res, next) => {
    try {
      const audioFile = req.files?.audio?.[0];

      if (audioFile && audioFile.mimetype === 'audio/webm') {
        const uniqueName = `${Date.now()}.mp3`;
        const outputPath = path.join('uploads/mp3', uniqueName);

        console.log("🔁 Convirtiendo audio buffer a mp3...");

        await convertirBufferWebmAMp3(audioFile.buffer, outputPath);

        // Simula archivo como si multer lo hubiera escrito
        req.files.audio[0].path = outputPath;
        req.files.audio[0].filename = uniqueName;
        req.files.audio[0].mimetype = 'audio/mp3';
        req.files.audio[0].originalname = uniqueName;
      }

      // También guarda imagen si se recibe
      const imageFile = req.files?.background_image?.[0];
      if (imageFile && imageFile.buffer) {
        const ext = path.extname(imageFile.originalname) || '.png';
        const imageName = `${Date.now()}${ext}`;
        const imagePath = path.join('uploads/images', imageName);
        fs.writeFileSync(imagePath, imageFile.buffer);

        req.files.background_image[0].path = imagePath;
        req.files.background_image[0].filename = imageName;
      }

      next();
    } catch (err) {
      console.error("❌ Error en subida o conversión:", err);
      res.status(500).json({ error: "Error procesando archivo de audio" });
    }
  }
];

module.exports = uploadAndConvert;