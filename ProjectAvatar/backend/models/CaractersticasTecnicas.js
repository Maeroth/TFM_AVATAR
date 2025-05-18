const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  caracteristica: { type: String, required: true, unique: true },
  peso_id: { type: Number, required: true, unique: false }
});

module.exports = mongoose.model('caracteristicas_tecnicas', userSchema);