const mongoose = require('mongoose');

const VideoSchema = new mongoose.Schema({
  id_peticion_did: { type: String, required: true, unique: true },  // ID del vídeo en D-ID
  titulo: { type: String, required: true },
  descripcion: { type: String },
  url: { type: String },
  peticion_did: { type: String},
  estado_peticion_did: { type: String },
  publicado: { type: Boolean, default: false },
  url_publicacion: { type: String },
  fecha_creacion: { type: Date, default: Date.now },
  fecha_respuesta_did: { type: Date }, // Se completará cuando llegue el webhook
  fechaCreacion: { type: Date, default: Date.now },
  ruta_audio: { type: String },
  ruta_fisica_audio: { type: String },
  ruta_imagen: { type: String },
  ruta_fisica_imagen: { type: String },
  avatar_id: { type: String },
  voice_id: { type: String },
  background_color: { type: String },
  tiene_subtitulos: { type: Boolean, default: false }
});

module.exports = mongoose.model('Video', VideoSchema);