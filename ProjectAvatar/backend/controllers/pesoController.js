const Peso = require('../models/Peso');

// Controlador que obtiene todos los registros de la colección de pesos
const getPesos = async (req, res) => {
  try {
    // Buscamos todos los documentos de la colección "pesos" sin aplicar ningún filtro
    const pesos = await Peso.find({});

    // Enviamos la lista completa como respuesta en formato JSON
    res.json(pesos);
  } catch (err) {
    // Si ocurre un error, lo mostramos en consola y enviamos un error 500
    console.error('Error al obtener pesos:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};


module.exports = { getPesos };
