const CaractersticasTecnicas = require('../models/CaracteristicasTecnicas');
const Proveedor = require('../models/Proveedor');
const User = require('../models/Proveedor');

/**
 * Este método calcula y devuelve una lista ordenada de proveedores,
 * clasificados según su similitud con los criterios técnicos seleccionados por el usuario.
 * También devuelve el proveedor/es con la mayor puntuación.
 */
const obtenerMejorProveedor = async (req, res) => {
  // Obtenemos los criterios enviados desde el frontend (ej: precio, resolución, etc.)
  const criterios = req.body;

  // Extraemos las claves (nombres de las características seleccionadas) para usarlas en la búsqueda
  const camposSeleccionados = Object.keys(criterios);

  try {
    // Se define una proyección inicial con campos fijos que siempre se necesitan en la búsqueda
    const proyeccion = {
      proveedor: 1,
      plan: 1
    };

    // Se añaden dinámicamente a la proyección los campos enviados desde el frontend
    Object.keys(criterios).forEach(campo => {
      proyeccion[campo] = 1;
    });

    // Buscamos todos los proveedores, pero solo con los campos seleccionados (para eficiencia)
    const proveedores = await Proveedor.find({}, proyeccion).lean();

    // Consultamos las características técnicas seleccionadas, junto con su peso asociado
    const caracteristicas = await CaractersticasTecnicas.aggregate([
      {
        $match: { caracteristica: { $in: camposSeleccionados } } // Solo características elegidas
      },
      {
        $lookup: {
          from: "pesos",                // Hacemos JOIN con la colección de pesos
          localField: "peso_id",        // campo en CaracteristicasTecnicas
          foreignField: "_id",          // campo en la colección de pesos
          as: "peso"                    // el resultado del JOIN se almacena en un array llamado "peso"
        }
      },
      {
        $unwind: "$peso" // Convertimos el array "peso" en un objeto individual por cada característica
      }
    ]);

    // Creamos un diccionario para mapear nombre de característica -> valor del peso
    const pesosMap = {};
    caracteristicas.forEach(c => {
      pesosMap[c.caracteristica] = c.peso.valor;
    });

    // Inicializamos array para almacenar los resultados
    const resultados = [];

    // Recorremos cada proveedor para calcular su puntuación de similitud
    proveedores.forEach(proveedor => {
      let similitudTotal = 0;

      // Evaluamos cada criterio comparando el valor del proveedor vs valor introducido
      for (const campo in criterios) {
        const entrada = criterios[campo];      // Valor introducido por el usuario
        const valor = proveedor[campo];        // Valor que tiene el proveedor
        let similitud = 0;                     // Valor ponderado para ese campo
        let similitudBase = 0;                 // Valor puro de similitud antes de ponderar

        // Evaluamos según el tipo de campo
        switch (campo) {
          case 'precio':
            if (valor == 0) {
              similitudBase = entrada == 0 ? 1 : 0;
            } else {
              similitudBase = valor <= entrada ? 1 : Math.max(0, 1 - ((valor - entrada) / valor));
            }
            similitud = similitudBase * pesosMap[campo];
            break;

          // Campos donde más es mejor
          case 'minutos_de_video_mes':
          case 'minutos_de_streaming_mes':
          case 'duracion_maxima_video':
          case 'numero_avatares':
          case 'avatares_personales':
          case 'numero_de_voces':
          case 'idiomas_soportados':
            if (entrada == 0) {
              similitudBase = valor == 0 ? 1 : 0;
            } else {
              similitudBase = valor >= entrada ? 1 : Math.max(0, 1 - ((entrada - valor) / entrada));
            }
            similitud = similitudBase * pesosMap[campo];
            break;

          // Campos booleanos: se busca coincidencia exacta
          case 'tiene_streaming':
          case 'streaming_con_sdk':
          case 'traduccion_automatica':
          case 'clonado_de_voz':
          case 'expresiones_del_avatar':
          case 'licencia_comercial':
          case 'entrada_alternativa':
            similitudBase = entrada == valor ? 1 : 0;
            similitud = similitudBase * pesosMap[campo];
            break;

          // Resolución: se considera superior si es igual o mejor que la solicitada
          case 'resolucion_del_video':
            similitudBase = entrada <= valor ? 1 : 0;
            similitud = similitudBase * pesosMap[campo];
            break;

          // Campos cualitativos categóricos
          case 'sincronizacion_labial':
          case 'calidad_api':
          case 'velocidad_de_generacion':
            similitudBase = entrada == valor ? 1 : 0;
            similitud = similitudBase * pesosMap[campo];
            break;
        }

        // Acumulamos la similitud ponderada
        similitudTotal += similitud;
      }

      // Guardamos el proveedor con su puntuación total de similitud
      resultados.push({ proveedor: proveedor.proveedor, plan: proveedor.plan, similitud: similitudTotal });
    });

    // Ordenamos los resultados de mayor a menor similitud
    resultados.sort((a, b) => b.similitud - a.similitud);

    // Buscamos el valor máximo alcanzado de similitud
    const maximoSimilitud = Math.max(...resultados.map(r => r.similitud));

    // Filtramos todos los proveedores que hayan alcanzado ese valor máximo
    const maximos = resultados.filter(r => r.similitud === maximoSimilitud);

    // Calculamos la suma total de pesos de los campos elegidos
    const totalPesoConfigurado = camposSeleccionados.reduce((acc, campo) => acc + (pesosMap[campo] || 0.5), 0);

    // Devolvemos los resultados como JSON
    res.json({ totalPesoConfigurado, maximos, resultados });

  } catch (error) {
    // Captura de errores generales y respuesta de error al cliente
    console.error("Error:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};

module.exports = { obtenerMejorProveedor };
