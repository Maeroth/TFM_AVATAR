const mongoose = require("mongoose");

const PesoSchema = new mongoose.Schema({
  _id: String, // Ej: "ALTO", "IMPORTANTISIMO"
  valor: Number   // Ej: 0.8, 1, etc.
});

module.exports = mongoose.model("Peso", PesoSchema);