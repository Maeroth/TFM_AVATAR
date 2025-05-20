const mongoose = require('mongoose');

const CaracteristicaTecnicaSchema = new mongoose.Schema({
  caracteristica: String,
  peso_id: {
    type: String,
    ref: "Peso"
  }
});

module.exports = mongoose.model("caracteristicas_tecnicas", CaracteristicaTecnicaSchema);