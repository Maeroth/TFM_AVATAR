// Carga las variables de entorno desde el archivo .env (como claves de API)
require('dotenv').config();

// Librerías para hacer peticiones HTTP y manipular archivos del sistema
const axios = require('axios');
const fs = require('fs');

// Modelos de Mongoose para acceder a la base de datos de MongoDB
const Video = require('../models/Video');
const Avatars = require('../models/Avatars');
const AvatarStreams = require('../models/AvatarStreams');

// URLs y claves de la API de D-ID obtenidas desde las variables de entorno
const DID_API_URL = process.env.DID_API_URL;
const DID_API_KEY = process.env.DID_API_KEY;

// -------------------------------------------------------------------------
// OBTENER AVATARES DISPONIBLES
// Este endpoint obtiene una lista de presentadores (avatares humanos virtuales)
// desde la API de D-ID, filtra solo los campos útiles y los devuelve al frontend
// -------------------------------------------------------------------------
const obtenerAvatares = async (req, res) => {
  // Se definen los parámetros de paginación con valores por defecto
  const limit = parseInt(req.query.limit) || 12;
  const page = parseInt(req.query.page) || 1;
  const offset = (page - 1) * limit;

  try {
    // Se hace una llamada GET a la API de D-ID para traer los presentadores disponibles
    const response = await fetch(`${process.env.DID_API_URL}/clips/presenters?limit=100`, {
      headers: {
        accept: 'application/json',                            // Indicamos que queremos respuesta JSON
        authorization: `Bearer ${process.env.DID_API_KEY}`     // Autenticación con token de API
      }
    });

    // Se parsea la respuesta a JSON
    const data = await response.json();

    // Se mapea la información para devolver solo los campos relevantes
    const filtro = data.presenters.map(p => ({
      id: p.presenter_id,                   // ID único del presentador
      name: p.name,                         // Nombre público del avatar
      gender: p.gender,                     // Género del avatar
      talkingPreview: p.talking_preview_url, // Vídeo de demostración
      thumbnail: p.thumbnail_url            // Miniatura del avatar
    }));

    // Se responde al frontend con los avatares filtrados
    res.json({ presenters: filtro });

  } catch (err) {
    // En caso de error, se muestra en consola y se devuelve código 500
    console.error("Error al cargar presentadores:", err);
    res.status(500).json({ error: "Error al obtener presentadores." });
  }
};

// -------------------------------------------------------------------------
// OBTENER VOCES DE MICROSOFT DISPONIBLES EN LA API DE D-ID
// Este endpoint obtiene las voces de texto a voz disponibles del proveedor Microsoft
// Filtra y ordena las voces, priorizando aquellas en español para mejorar la UX
// -------------------------------------------------------------------------
const obtenerVocesMicrosoft = async (req, res) => {
  try {
    // Llamada GET a la API de D-ID para obtener voces del proveedor Microsoft
    const response = await fetch(`${process.env.DID_API_URL}/tts/voices?provider=microsoft`, {
      method: "GET",
      headers: {
        accept: "application/json",
        authorization: `Basic ${process.env.DID_API_KEY}` // Se usa autenticación básica con API Key
      }
    });

    // Si la respuesta no es exitosa, se muestra el error
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error en D-ID:", errorText);
      return res.status(response.status).json({ error: "Error en la API de D-ID" });
    }

    // Se transforma la respuesta en JSON
    const voices = await response.json();

    // Se procesan las voces para priorizar aquellas en español y formatear su visualización
    const resultado = voices
      .map((v) => ({
        id: v.id, // Identificador de la voz
        label: `${v.name}, ${v.gender} - (${v.languages?.[0]?.language || "Desconocido"})`, // Descripción
        isSpanish: v.languages?.[0]?.language?.toLowerCase().includes("spanish") || false // Marcamos si es español
      }))
      .sort((a, b) => (a.isSpanish === b.isSpanish ? 0 : a.isSpanish ? -1 : 1)) // Ordena primero las voces en español
      .map(({ id, label }) => ({ id, label })); // Se dejan solo los campos necesarios

    // Se responde al frontend con la lista de voces ordenadas
    res.json(resultado);

  } catch (err) {
    // Captura y respuesta en caso de error
    console.error("Error al obtener voces:", err);
    res.status(500).json({ error: "Error al obtener voces de Microsoft" });
  }
};


// -------------------------------------------------------------------------
// GENERAR VIDEO CON AVATAR
// Este método se encarga de construir una petición a la API de D-ID
// para generar un vídeo con un avatar, a partir de texto o un archivo de audio.
// También se guarda el registro de la petición en la base de datos.
// -------------------------------------------------------------------------
const generarVideo = async (req, res) => {
  try {
    // Extraemos los parámetros enviados desde el frontend
    const {
      avatar_id,
      voice_id,
      subtitles,
      type,
      input,
      background_type,
      background_color,
      titulo,
      descripcion
    } = req.body;

    // Obtenemos las rutas físicas de los archivos cargados (audio e imagen)
    const audioPath = req.files?.audio?.[0]?.path;
    const imagePath = req.files?.background_image?.[0]?.path;

    // Definimos la URL base pública para generar rutas accesibles externamente
    const ngrokBaseUrl = process.env.PUBLIC_URL;

    // Convertimos las rutas físicas en rutas relativas desde la carpeta /uploads
    const audioRelative = audioPath ? audioPath.split("uploads")[1] : null;
    const imageRelative = imagePath ? imagePath.split("uploads")[1] : null;

    // Construimos las URLs accesibles que D-ID necesita para acceder al audio e imagen
    const audio_url = audioRelative ? `${ngrokBaseUrl}/upload${audioRelative.replace(/\\/g, '/')}` : null;
    const image_url = imageRelative ? `${ngrokBaseUrl}/upload${imageRelative.replace(/\\/g, '/')}` : null;

    // Creamos el objeto script dependiendo del tipo de entrada: texto o audio
    let script;
    if (type === "text") {
      // Si se usa texto, se indica el input, si tiene subtítulos, y qué voz usar
      script = {
        type: "text",
        input,
        subtitles: subtitles === "true",
        ssml: false,
        provider: {
          type: "microsoft",
          voice_id
        }
      };
    } else if (type === "audio" && audio_url) {
      // Si se usa audio, se pasa la URL al archivo previamente subido
      script = {
        type: "audio",
        audio_url: audio_url,
        subtitles: subtitles === "true"
      };
    }

    // Construimos el cuerpo de la petición a la API de D-ID
    const body = {
      presenter_id: avatar_id, // ID del avatar seleccionado
      script,                  // Instrucciones de entrada (texto o audio)
      config: {
        result_format: "mp4"  // Formato de salida
      },
      presenter_config: {
        crop: {
          type: "wide"        // Ajuste de encuadre del avatar
        }
      },
      webhook: `${process.env.PUBLIC_URL}/api/did/webhook`, // URL a la que D-ID notificará cuando el vídeo esté listo

      // Configuración del fondo del vídeo: puede ser un color sólido o una imagen
      background: background_type === "color"
        ? { color: background_color }
        : { color: false, source_url: image_url }
    };

    // Mostramos por consola el cuerpo completo que se enviará a D-ID (útil para depuración)
    console.log("Body a enviar a D-ID:", JSON.stringify(body, null, 2));

    // Enviamos la petición POST a la API de D-ID para generar el vídeo
    const didRes = await axios.post(
      "https://api.d-id.com/clips",
      body,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${process.env.DID_API_KEY}` // Autenticación con la API Key
        }
      }
    );

    // Obtenemos los datos de respuesta de D-ID (ID de la petición, estado, etc.)
    const data = await didRes.data;

    // Guardamos en la base de datos la petición realizada, para poder consultarla luego
    await Video.create({
      id_peticion_did: data.id,
      titulo,
      descripcion,
      url: null, // No se conoce todavía, llegará en el webhook
      peticion_did: JSON.stringify(body), // Guardamos el JSON enviado por si hay que revisarlo
      estado_peticion_did: data.status,   // Estado inicial (created)
      publicado: false,
      fecha_creacion: data.created_at,
      fecha_respuesta_did: null,          // Se actualizará en el webhook
      ruta_audio: audio_url,
      ruta_fisica_audio: audioRelative ? `uploads${audioRelative.replace(/\\/g, '/')}` : null,
      ruta_imagen: image_url,
      ruta_fisica_imagen: imageRelative ? `uploads${imageRelative.replace(/\\/g, '/')}` : null,
      avatar_id,
      voice_id,
      background_color,
      tiene_subtitulos: subtitles === "true"
    });

    // Respondemos al frontend con un mensaje de éxito
    res.json({ message: 'Petición de vídeo realizada correctamente al proveedor. Cuando esté listo aparecerá en el menú de Gestión de Vídeos' });

  } catch (error) {
    // Manejamos errores que puedan venir de la API de D-ID u otros problemas
    if (error.response?.data) {
      console.error("Error generando video:", error.response.data.description);
      res.status(500).json({ error: error.response.data.description });
    } else {
      console.error("Error generando video:", error);
      res.status(500).json({ error: error.message });
    }
  }
};

// -------------------------------------------------------------------------
// RECIBIR WEBHOOK DE LA API DE D-ID
// Este método es llamado automáticamente por D-ID cuando finaliza el procesamiento
// del vídeo solicitado. Actualiza el estado del vídeo y elimina archivos temporales.
// -------------------------------------------------------------------------
const recibirWebhook = async (req, res) => {
  // Mostramos por consola el cuerpo completo recibido desde D-ID
  console.log("Webhook recibido:", JSON.stringify(req.body, null, 2));

  try {
    // Extraemos los campos clave enviados por la API de D-ID
    const { id, status, result_url } = req.body;

    // Validamos que venga el ID, que es imprescindible para identificar el vídeo
    if (!id) {
      return res.status(400).send("ID de petición D-ID no proporcionado en el Webhook");
    }

    // Buscamos el vídeo correspondiente en base de datos y actualizamos su estado
    const video = await Video.findOneAndUpdate(
      { id_peticion_did: id },       // Se busca por el ID asignado al crearlo
      {
        estado_peticion_did: status, // Se actualiza el estado (e.g. done, error)
        ...(status === 'done' && {   // Si el estado es 'done', también se guarda la URL del vídeo final
          url: result_url,
          fecha_respuesta_did: new Date()
        })
      },
      { new: true } // Devuelve el documento actualizado
    );

    // Si no se encuentra el vídeo, mostramos advertencia y devolvemos error
    if (!video) {
      console.warn(`No se encontró video con id_peticion_did: ${id}`);
      return res.status(404).send("Video no encontrado");
    }

    // Eliminamos archivos temporales del servidor (audio e imagen usados para generar el vídeo)
    const archivos = [video.ruta_fisica_audio, video.ruta_fisica_imagen];
    archivos.forEach((url) => {
      if (url) {
        const localPath = url.replace(process.env.PUBLIC_URL, '.'); // Convertimos a ruta local
        fs.unlink(localPath, (err) => {
          if (err) console.error(`Error al eliminar archivo ${localPath}:`, err);
          else console.log(`Archivo eliminado: ${localPath}`);
        });
      }
    });

    // Respondemos con OK si todo fue bien
    res.status(200).send("OK");

  } catch (error) {
    // Captura de errores inesperados
    console.error("Error en recibirWebhook:", error);
    res.status(500).send("Error interno del servidor");
  }
};

// -------------------------------------------------------------------------
// RECIBIR WEBHOOK PARA CREACIÓN DE AVATAR
// Similar al anterior, pero se usa cuando se está creando un avatar personalizado.
// Actualiza estado y elimina recursos locales temporales.
// -------------------------------------------------------------------------
const recibirWebhookCrearAvatar = async (req, res) => {
  // Mostramos por consola el contenido recibido del webhook
  console.log("Webhook recibido de la creación del avatar:", JSON.stringify(req.body, null, 2));

  try {
    // Extraemos los valores enviados por la API de D-ID
    const { id, status, result_url } = req.body;

    // Si no viene ID, no podemos continuar
    if (!id) {
      return res.status(400).send("ID de petición D-ID no proporcionado en el Webhook");
    }

    // Actualizamos el vídeo correspondiente con el nuevo estado y la URL (si aplica)
    const video = await Video.findOneAndUpdate(
      { id_peticion_did: id },
      {
        estado_peticion_did: status,
        ...(status === 'done' && {
          url: result_url,
          fecha_respuesta_did: new Date()
        })
      },
      { new: true }
    );

    // Si no se encuentra el vídeo, se informa
    if (!video) {
      console.warn(`No se encontró video con id_peticion_did: ${id}`);
      return res.status(404).send("Video no encontrado");
    }

    // Eliminamos del sistema los archivos temporales usados para crear el avatar
    const archivos = [video.ruta_fisica_audio, video.ruta_fisica_imagen];
    archivos.forEach((url) => {
      if (url) {
        const localPath = url.replace(process.env.PUBLIC_URL, '.'); // Convertimos URL pública en ruta local
        fs.unlink(localPath, (err) => {
          if (err) console.error(`Error al eliminar archivo ${localPath}:`, err);
          else console.log(`🧹 Archivo eliminado: ${localPath}`);
        });
      }
    });

    // Respondemos a D-ID con éxito
    res.status(200).send("OK");

  } catch (error) {
    // Capturamos y mostramos errores si algo sale mal
    console.error("Error en recibirWebhook:", error);
    res.status(500).send("Error interno del servidor");
  }
};


// -------------------------------------------------------------------------
// BUSCAR VÍDEOS EN BASE DE DATOS SEGÚN FILTROS (título, fecha)
// Permite aplicar búsqueda dinámica desde el frontend
// -------------------------------------------------------------------------
const buscarVideos = async (req, res) => {
  try {
    // Extraemos los posibles filtros enviados como parámetros de la URL
    const { titulo, desde, hasta } = req.query;

    const filtro = {}; // Objeto de filtro para MongoDB

    // Si se busca por título, aplicamos una expresión regular insensible a mayúsculas
    if (titulo) {
      filtro.titulo = { $regex: titulo, $options: 'i' };
    }

    // Si se incluyen fechas de rango, añadimos al filtro
    if (desde || hasta) {
      filtro.fechaCreacion = {};
      if (desde) filtro.fechaCreacion.$gte = new Date(desde); // fecha desde (inclusive)
      if (hasta) filtro.fechaCreacion.$lte = new Date(hasta); // fecha hasta (inclusive)
    }

    // Consultamos en la base de datos aplicando el filtro y ordenamos del más reciente al más antiguo
    const videos = await Video.find(filtro).sort({ fechaCreacion: -1 });

    // Devolvemos el listado encontrado
    res.json(videos);
  } catch (err) {
    // Si ocurre un error, lo registramos y devolvemos un mensaje de error
    console.error("Error al obtener vídeos:", err);
    res.status(500).json({ error: "Error al obtener los vídeos" });
  }
};


// -------------------------------------------------------------------------
// CREAR AGENTE INTERACTIVO EN D-ID
// Este método crea un agente conversacional usando un presentador de D-ID y GPT
// El agente podrá responder a preguntas en tiempo real, dentro de ciertas instrucciones
// -------------------------------------------------------------------------
const crearAgente = async (req, res) => {
  try {
    // Construimos el cuerpo de la petición con configuración del presentador y LLM
    const body = {
      presenter: {
        type: 'clip',                             // Tipo de avatar (clip = vídeo)
        voice: { type: 'microsoft', voice_id: 'es-ES-AbrilNeural' }, // Voz que se utilizará
        presenter_id: 'v2_public_amy@seiu0o2gby'  // ID de un avatar público en D-ID
      },
      llm: {
        provider: 'openai', // Proveedor del modelo conversacional
        instructions: 'Habla sólo sobre Baldur\'s Gate 3, no hables de otra cosa.'
      },
      preview_name: 'TEST' // Nombre del agente para vista previa
    };

    // Enviamos una solicitud POST a la API de D-ID para crear el agente
    const didRes = await axios.post(
      "https://api.d-id.com/agents",
      body,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${process.env.DID_API_KEY}`
        }
      }
    );

    const data = await didRes.data; // Capturamos la respuesta por si se requiere
    // Nota: aquí no se hace nada con 'data', pero podrías guardarlo si fuera necesario

  } catch (err) {
    // En caso de error, se informa al usuario
    console.error("Error:", err);
    res.status(500).json({ error: "Error" });
  }
};

// -------------------------------------------------------------------------
// ACTUALIZAR AVATAR DE STREAMING GUARDADO EN BASE DE DATOS
// Envia una petición PATCH a D-ID para actualizar el comportamiento del avatar en vivo
// y guarda la configuración en MongoDB
// -------------------------------------------------------------------------
const guardarAvatarStream = async (req, res) => {
  try {
    // Extraemos los datos enviados desde el frontend
    const {
      id_avatar_stream,
      avatar_id,
      voice_id,
      idioma,
      saludo,
      instrucciones
    } = req.body;

    // Construimos el cuerpo que se enviará a D-ID para modificar el agente
    const body = {
      presenter: {
        type: "clip",
        presenter_id: avatar_id,
        voice: {
          type: 'microsoft',
          voice_id: voice_id
        }
      },
      llm: {
        provider: 'openai',
        instructions: "Importante, debes responder en este idioma específicamente: " + idioma + ". " + instrucciones
      },
      embed: 'true',           // El agente se podrá incrustar como widget
      greetings: [saludo]      // Mensaje de saludo inicial al usuario
    };

    console.info("Body a enviar a D-ID:", JSON.stringify(body, null, 2));

    // Hacemos la petición PATCH a D-ID para actualizar el agente
    const didRes = await axios.patch(
      `${process.env.DID_API_URL}/agents/${id_avatar_stream}`,
      body,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${process.env.DID_API_KEY}`
        }
      }
    );

    const data = await didRes.data;

    // Guardamos (o actualizamos si ya existe) el avatar de streaming en nuestra base de datos
    const actualizado = await AvatarStreams.findOneAndUpdate(
      { id_avatar: id_avatar_stream }, // Búsqueda por ID del avatar
      {
        saludo: saludo,
        instrucciones: instrucciones,
        presentador: {
          voice_id: voice_id,
          presenter_id: avatar_id
        }
      },
      { upsert: true, new: true } // Si no existe, se crea. new=true devuelve el doc actualizado
    );

    // Si hubo algún problema guardando en MongoDB
    if (!actualizado) {
      console.error("Error al guardar el avatar de stream:", error);
      res.status(500).json({ error: "Error al guardar el avatar de stream: " + error.message });
    }

    // Todo correcto
    res.json({ message: 'El avatar de streaming ha sido correctamente actualizado.' });

  } catch (error) {
    console.error("Error al guardar el avatar de stream:", error);
    res.status(500).json({ error: "Error al guardar el avatar de stream: " + error.message });
  }
};

// -------------------------------------------------------------------------
// CARGAR AVATAR DE STREAMING CONFIGURADO
// Recupera del backend la configuración local del avatar interactivo almacenada
// en MongoDB y la complementa con los datos actualizados desde la API de D-ID.
// Esto permite mostrar información precisa del avatar en el frontend.
// -------------------------------------------------------------------------
const cargarAvatarStream = async (req, res) => {
  try {
    // Obtenemos el único registro de avatar interactivo que se guarda en la base de datos
    const avatarStream = await AvatarStreams.findOne();

    // Usamos el ID del presentador guardado para obtener sus datos actuales desde la API de D-ID
    const didRes = await axios.get(
      `${process.env.DID_API_URL}/clips/presenters/${avatarStream.presentador.presenter_id}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${process.env.DID_API_KEY}`
        }
      }
    );

    // Extraemos la información del presentador desde la respuesta de D-ID
    const actor = didRes.data.presenters?.[0];

    // Si no se encuentra el actor, devolvemos un error 404
    if (!actor) {
      return res.status(404).json({ error: "No se encontró presentador en la API de D-ID." });
    }

    // Combinamos la configuración local (de MongoDB) con la información en vivo del presentador
    res.json({
      ...avatarStream.toObject(), // Convertimos el documento Mongoose a objeto plano
      actor: actor                // Adjuntamos los datos actuales del presentador desde la API
    });

  } catch (error) {
    // Capturamos cualquier error (fallos de red, token inválido, etc.)
    console.error("Error generando video:", error);
    res.status(500).json({ error: "Error al guardar el avatar de stream: " + error.message });
  }
};


// -------------------------------------------------------------------------
// CREAR UN NUEVO AVATAR PERSONALIZADO EN D-ID
// 1. Elimina el avatar anterior si existía (tanto en D-ID como en la base de datos)
// 2. Solicita consentimiento obligatorio a D-ID (para uso de imagen/vídeo)
// 3. Crea el nuevo avatar personalizado y guarda su configuración localmente
// -------------------------------------------------------------------------
const crearAvatar = async (req, res) => {
  try {
    // Obtenemos el archivo de vídeo subido y los datos del formulario
    const videoFile = req.files?.video?.[0].path;
    const { nombre, genero } = req.body;

    // Validamos que todos los campos requeridos estén presentes
    if (!videoFile || !nombre || !genero) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    // Verificamos si ya existe un avatar personalizado guardado
    const avatarActual = await Avatars.findOne();
    if (avatarActual) {
      // Si existe, lo eliminamos primero de la plataforma D-ID
      try {
        console.info(`Llamada a ${process.env.DID_API_URL}/clips/presenters/${avatarActual.id_avatar}`);
        const didRes = await axios.delete(
          `${process.env.DID_API_URL}/clips/presenters/${avatarActual.id_avatar}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Basic ${process.env.DID_API_KEY}`
            }
          }
        );
      } catch (error) {
        // Si ocurre un error al borrar en D-ID, lo mostramos pero no detenemos el proceso
        if (error.response?.data) {
          console.error("Error generando borrando Avatar de D-ID:", error.response.data.description);
        } else {
          console.error("Error generando borrando Avatar de D-ID", error);
        }
      }

      // También eliminamos el avatar antiguo de nuestra base de datos
      console.info("Borramos el avatar anterior de Base de datos");
      const borrado = await Avatars.deleteOne({ id_avatar: avatarActual.id_avatar });
    }

    // Enviamos una solicitud de consentimiento a D-ID (obligatorio para crear avatares personalizados)
    const body = { language: "spanish" };
    console.info(`Llamada a ${process.env.DID_API_URL}/consents/`);
    const didRes = await axios.post(
      `${process.env.DID_API_URL}/consents/`,
      body,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${process.env.DID_API_KEY}`
        }
      }
    );

    // Guardamos el ID del consentimiento para usarlo en la creación del avatar
    const id_consentimiento = didRes.data.id;
    console.info("Hemos obtenido el id del consentimiento");

    // Transformamos la ruta física del vídeo en una URL pública accesible por D-ID
    const videoRelative = videoFile ? videoFile.split("uploads")[1] : null;
    const video_url = videoRelative ? `${process.env.PUBLIC_URL}/upload${videoRelative.replace(/\\/g, '/')}` : null;

    // Construimos el cuerpo de la petición para crear el avatar personalizado
    const body2 = {
      gender: genero, // Género del avatar (masculino/femenino)
      webhook: `${process.env.PUBLIC_URL}/api/did/webhookCrearAvatar`, // Dónde enviar notificación cuando esté listo
      config: { is_greenscreen: 'false' }, // No usamos fondo verde
      source_url: video_url, // URL del vídeo grabado
      name: nombre, // Nombre para el avatar
      consent_id: id_consentimiento // ID de consentimiento obligatorio
    };

    // Mostramos por consola el cuerpo que se enviará a D-ID
    console.log("Body a enviar a D-ID:", JSON.stringify(body2, null, 2));

    // Enviamos la petición de creación del avatar a la API de D-ID
    console.info(`Llamada a ${process.env.DID_API_URL}/clips/avatars/`);
    const didRes2 = await axios.post(
      "https://api.d-id.com/clips/avatars",
      body2,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${process.env.DID_API_KEY}`
        }
      }
    );

    // Extraemos el ID y estado del nuevo avatar creado
    const idNuevoAvatar = didRes2.data.id;
    const status = didRes2.data.status;

    // Guardamos los datos del nuevo avatar en nuestra base de datos
    console.info("Guardamos los datos del nuevo avatar en base de datos");
    const avatarGuardar = await Avatars.create({
      id_avatar: idNuevoAvatar,
      ruta_video: video_url,
      ruta_fisica_video: videoRelative ? `uploads${videoRelative.replace(/\\/g, '/')}` : null,
      status: status,
      errores: '' // Campo para guardar errores futuros si fuera necesario
    });

    console.info("Guardado correcto de los datos del avatar");

    // Respondemos con mensaje de éxito
    return res.status(200).json({
      message: "Avatar creado correctamente",
    });

  } catch (err) {
    // Captura y manejo de errores generales
    console.error("Error al crear avatar:", err);
    res.status(500).json({ error: "Error interno al crear el avatar" });
  }
};

// -------------------------------------------------------------------------
// BORRAR UN VIDEO MANUALMENTE DESDE LA INTERFAZ DE ADMINISTRACIÓN - GESTIÓN DE VÍDEOS
// Este método se utiliza para eliminar manualmente un vídeo desde el panel de administración.
// Recibe el ID del vídeo como parámetro y lo elimina de la base de datos si existe.
// -------------------------------------------------------------------------
const borrarVideo = async (req, res) => {
  // Extraemos el ID del vídeo desde los parámetros de la URL
  const { id } = req.params;

  try {
    // Intentamos eliminar el vídeo con el ID proporcionado
    const resultado = await Video.findByIdAndDelete(id);

    // Si no se encuentra ningún vídeo con ese ID, devolvemos error 404
    if (!resultado) {
      return res.status(404).json({ error: "Vídeo no encontrado" });
    }

    // Si se eliminó correctamente, respondemos con un mensaje de éxito
    res.json({ message: "Vídeo borrado correctamente" });

  } catch (error) {
    // Si ocurre algún error en el proceso, lo registramos y devolvemos error 500
    console.error("Error al borrar el vídeo:", error);
    res.status(500).json({ error: "Error al borrar el vídeo" });
  }
};



module.exports = { obtenerAvatares, generarVideo, obtenerVocesMicrosoft, recibirWebhook, recibirWebhookCrearAvatar, buscarVideos, crearAgente, guardarAvatarStream, cargarAvatarStream, crearAvatar, borrarVideo };