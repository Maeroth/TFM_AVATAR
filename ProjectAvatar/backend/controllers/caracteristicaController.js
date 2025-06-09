const CaracteristicaTecnica = require('../models/CaracteristicasTecnicas');

// Controlador que obtiene todas las características técnicas junto con su peso asociado
const getCaracteristicasConPesos = async (req, res) => {
  try {
    // Ejecutamos una agregación que une (lookup) la colección 'pesos' con 'caracteristicas_tecnicas'
    const resultado = await CaracteristicaTecnica.aggregate([
      {
        $lookup: {
          from: 'pesos',               // Nombre de la colección con los pesos
          localField: 'peso_id',       // Campo en CaracteristicasTecnicas que referencia el peso
          foreignField: '_id',         // Campo _id en la colección de pesos
          as: 'peso'                   // El resultado del join se guarda en el array 'peso'
        }
      },
      { 
        $unwind: '$peso'              // Convertimos el array 'peso' en un objeto individual
      }
    ]);

    // Enviamos como respuesta el array con todas las características y sus pesos unidos
    res.json(resultado);
  } catch (err) {
    // En caso de error, mostramos el mensaje en consola y respondemos con error 500
    console.error('Error en lookup de características:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};


// Controlador que actualiza el peso asociado a una o varias características técnicas
const actualizarPesos = async (req, res) => {
  try {
    // El cuerpo de la petición debe tener el formato: { idCaracteristica1: "ALTO", idCaracteristica2: "MEDIO", ... }
    const actualizaciones = req.body;

    // Creamos un array de promesas para actualizar cada característica técnica
    const operaciones = Object.entries(actualizaciones).map(
      ([id, peso_id]) =>
        CaracteristicaTecnica.findByIdAndUpdate(
          id,                // ID de la característica técnica a actualizar
          { peso_id },       // Nuevo ID del peso
          { new: true }      // Opción para que devuelva el documento actualizado
        )
    );

    // Ejecutamos todas las operaciones de forma concurrente
    await Promise.all(operaciones);

    // Respondemos con un mensaje de éxito
    res.json({ message: 'Pesos actualizados correctamente.' });
  } catch (err) {
    // En caso de error, lo mostramos por consola y enviamos error 500
    console.error('Error al actualizar pesos:', err);
    res.status(500).json({ message: 'Error interno al guardar pesos' });
  }
};


module.exports = { getCaracteristicasConPesos, actualizarPesos };
