const CaractersticasTecnicas = require('../models/CaractersticasTecnicas');
const Proveedor = require('../models/Proveedor');
const User = require('../models/Proveedor');

const obtenerMejorProveedor = async (req, res) => {
  const criterios = req.body;
  const camposSeleccionados = Object.keys(criterios);   //Guardamos los criterios seleccionados por pantalla
  try {
    let number = Math.max(0, 1 - ((30.71 - 12) / 30.71));

    //La idea es buscar los proveedores con los criterios seleccionados, no traerse todos los criterios de BD
// 1. Campos fijos que siempre deben ir. El 1 es que se activa esa caracteristica en la búsqueda
    const proyeccion = {
        proveedor: 1,
        plan: 1
    };

    // 2. Campos dinámicos que vienen del frontend
    const criterios = req.body;
        Object.keys(criterios).forEach(campo => {
        proyeccion[campo] = 1;
    });
   // const proveedores = await Proveedor.find({}).select('proveedor:1 plan:1 precio:1');

    // Traer todos los proveedores, pero solo con los campos Proveedor, Plan y los seleccionados por pantalla
    const proveedores = await Proveedor.find({}, proyeccion).lean();

    // Hacer JOIN entre caracteristicas y pesos
    const caracteristicas = await CaractersticasTecnicas.aggregate([{
          $lookup: {
            from: "pesos",
            localField: "peso_id",
            foreignField: "_id",
            as: "peso"
        }
      },
      { $unwind: "$peso" }, //convierte peso en un objeto plano para poder trabajar con el, por ejemplo: c.peso.valor
      { $match: { caracteristica: { $in: camposSeleccionados } } } //filtramos para que traiga sólo los pesos de las características que hemos seleccionado por pantalla
    ]);

    // Mapeo de pesos por nombre de característica
    const pesosMap = {};
    caracteristicas.forEach(c => {
      pesosMap[c.caracteristica] = c.peso.valor;
    });

    //Comenzamos con la lógica de negocio
    const resultados = []; // Aquí guardamos todos los resultados de los proveedores
    proveedores.forEach(proveedor => {
        let similitudTotal = 0;

        for(const campo in criterios){
            const entrada = criterios[campo]; //obtenemos el valor de pantalla
            const valor = proveedor[campo]; //obtenemos el valor del proveedor
            let similitud = 0; //contendrá la similitudBase * peso
            let similitudBase = 0; //contendrá la similitud de la característica según su entrada por pantalla y lo que ofrezca el proveedor

            switch (campo){
                case 'precio':
                    if (valor == 0) {
                        similitudBase = entrada == 0 ? 1 : 0; // si ambos son 0, similitud total, si no, 0, así evitamos indeterminación con la división
                    } else {
                        similitudBase = valor <= entrada ? 1 : Math.max(0, 1 - ((valor - entrada) / valor));
                    }
                    similitud = similitudBase * pesosMap[campo];
                    break;
                case 'minutos_de_video_mes':
                case 'minutos_de_streaming_mes':
                case 'duracion_maxima_video':
                case 'numero_avatares':
                case 'avatares_personales':
                case 'numero_de_voces':
                case 'idiomas_soportados':
                    if(entrada == 0){
                        similitudBase = valor == 0 ? 1 : 0; // si ambos son 0, similitud total, si no, 0, así evitamos indeterminación con la división
                    } else{
                        similitudBase = valor >= entrada ? 1 : Math.max(0, 1 - ((entrada - valor) / entrada));
                    }
                    similitud = similitudBase * pesosMap[campo];
                    break;
                case 'tiene_streaming':
                case 'streaming_con_sdk':
                case 'traduccion_automatica':
                case 'clonado_de_voz':
                case 'expresiones_del_avatar':
                case 'licencia_comercial':
                case 'entrada_alternativa':
                    //Estas son del tipo SÍ o NO, simplemente deben coincidir
                    similitudBase = entrada == valor ? 1 : 0;
                    similitud = similitudBase * pesosMap[campo];
                    break;
                case 'resolucion_del_video':
                    //resolución puede ser 720p, 1080p y 4K, lo importante aquí es que las opciones superiores vienen contenidas en la elección
                    similitudBase = entrada <= valor ? 1 : 0; 
                    similitud = similitudBase * pesosMap[campo];
                case 'sincronizacion_labial':
                case 'calidad_api':
                case 'velocidad_de_generacion':
                    //Estas son del tipo BAJO/NORMAL/ALTO
                    similitudBase = entrada == valor ? 1 : 0;
                    similitud = similitudBase * pesosMap[campo];
                    break;
                }

            similitudTotal += similitud;
        }

        //Añadimos la similitudTotal obtenida al array de resultados
        resultados.push({ proveedor: proveedor.proveedor, plan: proveedor.plan, similitud: similitudTotal });
    });

    // Ordenamos los resultados por similitud, en orden desdendente para que la tabla sea más legible
    resultados.sort((a, b) => b.similitud - a.similitud);

    // Calcular el valor máximo de similitud
    const maximoSimilitud = Math.max(...resultados.map(r => r.similitud));

    // Obtener todos los proveedores con la máxima similitud
    const maximos = resultados.filter(r => r.similitud === maximoSimilitud);

    // Calcular suma total de pesos de las características elegidas para obtener el máximo de similitud que se puede alcanzar
    const totalPesoConfigurado = camposSeleccionados.reduce((acc, campo) => acc + (pesosMap[campo] || 0.5), 0);

    
    res.json({ totalPesoConfigurado, maximos, resultados });


 

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  } 
};

module.exports = { obtenerMejorProveedor };