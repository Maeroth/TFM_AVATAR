const CaracteristicaTecnica = require('../models/CaracteristicasTecnicas');

const getCaracteristicasConPesos = async (req, res) => {
  try {
    const resultado = await CaracteristicaTecnica.aggregate([
      {
        $lookup: {
          from: 'pesos',
          localField: 'peso_id',
          foreignField: '_id',
          as: 'peso'
        }
      },
      { $unwind: '$peso' }
    ]);
    res.json(resultado);
  } catch (err) {
    console.error('Error en lookup de características:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const actualizarPesos = async (req, res) => {
  try {
    const actualizaciones = req.body; // { idMongo1: "ALTO", idMongo2: "MEDIO", ... }

    const operaciones = Object.entries(actualizaciones).map(
      ([id, peso_id]) =>
        CaracteristicaTecnica.findByIdAndUpdate(id, { peso_id }, { new: true })
    );

    await Promise.all(operaciones);
    res.json({ message: 'Pesos actualizados correctamente.' });
  } catch (err) {
    console.error('Error al actualizar pesos:', err);
    res.status(500).json({ message: 'Error interno al guardar pesos' });
  }
};

module.exports = { getCaracteristicasConPesos, actualizarPesos };
