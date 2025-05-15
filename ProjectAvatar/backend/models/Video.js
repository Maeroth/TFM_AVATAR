const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  fechaCreacion: {
    type: Date,
    default: Date.now
  },
  publicado: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('Video', videoSchema);
