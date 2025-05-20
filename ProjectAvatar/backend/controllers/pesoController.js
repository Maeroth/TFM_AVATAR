const Peso = require('../models/Peso');

const getPesos = async (req, res) => {
  try {
    const pesos = await Peso.find({});
    res.json(pesos);
  } catch (err) {
    console.error('Error al obtener pesos:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

module.exports = { getPesos };
