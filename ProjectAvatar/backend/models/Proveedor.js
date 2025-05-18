const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  proveedor: { type: String, required: true, unique: false },
  plan: { type: String, required: true, unique: true },
  precio: { type: Number },
  minutos_de_video_mes: { type: Number },
  minutos_de_streaming_mes: { type: Number },
  tiene_streaming: { type: Number }, //1 = SÍ / 0 = NO
  sdk_de_streaming: { type: Number },  //1 = SÍ / 0 = NO
  traduccion_automatica: { type: Number }, //1 = SÍ / 0 = NO
  resolucion_del_video: { type: Number }, //0 = 720p / 1 = 1080p / 2 = 4K
  sincronizacion_labial: { type: Number }, //0 = BAJA / 1 = NORMAL / 2 ALTA
  numero_avatares: { type: Number },
  avatares_pesonales: { type: Number },
  numero_de_voces: { type: Number },
  expresiones_del_avatar: { type: Number }, //1 = SÍ / 0 = NO
  clonado_de_voz: { type: Number }, //1 = SÍ / 0 = NO
  idiomas_soportados: { type: Number },
  entrada_alternativa: { type: Number }, //0 = Sólo Text / 1 = Texto y Audio
  licencia_comercial: { type: Number }, //1 = SÍ / 0 = NO
  calidad_api: { type: Number }, //0 = BAJA / 1 = NORMAL / 2 ALTA
  velocidad_de_generacion: { type: Number } //0 = BAJA / 1 = NORMAL / 2 ALTA
});

module.exports = mongoose.model('proveedores', userSchema);