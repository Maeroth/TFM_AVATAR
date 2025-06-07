require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const Video = require('../models/Video');
const Avatars = require('../models/Avatars');
const AvatarStreams = require('../models/AvatarStreams');


const DID_API_URL = process.env.DID_API_URL;
const DID_API_KEY = process.env.DID_API_KEY;



const obtenerAvatares = async (req, res) => {
  const limit = parseInt(req.query.limit) || 12;
  const page = parseInt(req.query.page) || 1;
  const offset = (page - 1) * limit;

  try {
    const response = await fetch(`${process.env.DID_API_URL}/clips/presenters?limit=100`, {
      headers: {
        accept: 'application/json',
        authorization: `Bearer ${process.env.DID_API_KEY}`
      }
    });

    const data = await response.json();

    const filtro = data.presenters.map(p => ({
      id: p.presenter_id,
      name: p.name,
      gender: p.gender,
      talkingPreview: p.talking_preview_url,
      thumbnail: p.thumbnail_url
    }));

    res.json({ presenters: filtro });
  } catch (err) {
    console.error("Error al cargar presentadores:", err);
    res.status(500).json({ error: "Error al obtener presentadores." });
  }
};

const obtenerVocesMicrosoft = async (req, res) => {
  try {
    const response = await fetch(`${process.env.DID_API_URL}/tts/voices?provider=microsoft`, {
      method: "GET",
      headers: {
        accept: "application/json",
        authorization: `Basic ${process.env.DID_API_KEY}`  // Usa variable de entorno
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error en D-ID:", errorText);
      return res.status(response.status).json({ error: "Error en la API de D-ID" });
    }

  const voices = await response.json();

     //Las voces españolas aparecerán las primeras para facilitar la elección
     const resultado = voices
        .map((v) => ({
          id: v.id,
          label: `${v.name}, ${v.gender} - (${v.languages?.[0]?.language || "Desconocido"})`,
          isSpanish: v.languages?.[0]?.language?.toLowerCase().includes("spanish") || false,
        }))
        .sort((a, b) => (a.isSpanish === b.isSpanish ? 0 : a.isSpanish ? -1 : 1))
        .map(({ id, label }) => ({ id, label }));

      res.json(resultado);
    } catch (err) {
      console.error("Error al obtener voces:", err);
      res.status(500).json({ error: "Error al obtener voces de Microsoft" });
    }
};


const generarVideo = async (req, res) => {
  //Antes de nada, procesamos los ficheros de audio o foto si vienen en la petición para guardarlos en el servidor,
  //éstos se utilizarán como ruta absoluta en la petición a D-ID (no se pueden enviar como información en la petición)
    //si no hay error en el upload, continuamos con la petición
    try {
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

      const audioPath = req.files?.audio?.[0]?.path;
      const imagePath = req.files?.background_image?.[0]?.path;

    // URL base: usa NGROK_URL si está definida
    const ngrokBaseUrl = process.env.PUBLIC_URL;

    // Convertir rutas locales en URLs accesibles
    const audioRelative = audioPath ? audioPath.split("uploads")[1] : null;
    const imageRelative = imagePath ? imagePath.split("uploads")[1] : null;


    const audio_url = audioRelative ? `${ngrokBaseUrl}/upload${audioRelative.replace(/\\/g, '/')}` : null;
    const image_url = imageRelative ? `${ngrokBaseUrl}/upload${imageRelative.replace(/\\/g, '/')}` : null;

      if (type === "text") {
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
        script = {
          type: "audio",
          audio_url: audio_url,
          subtitles: subtitles === "true"
        };
      }

      const body = {
      presenter_id: avatar_id,
      script,
      config: {
        result_format: "mp4"
      },
      presenter_config: {
        crop: {
          type: "wide"
        }
      },
      webhook: `${process.env.PUBLIC_URL}/api/did/webhook`,        
      
      background: background_type === "color"
        ? { color: background_color } 
        : 
        {color: false, source_url: image_url}
    };

      console.log("Body a enviar a D-ID:", JSON.stringify(body, null, 2));

      const didRes = await axios.post(
        "https://api.d-id.com/clips",
        body,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${process.env.DID_API_KEY}`
          }
        }
      );

      const data = await didRes.data;
      
      //TEST: 
      // const data = {created_at: '2025-05-25T12:38:47.009Z', id: 'clp_Tc-bDSYTfImFpB0zzLhDd', object: 'clip', status: 'created'};

      //Ejemplo de tipo de salida: 
      /*
      {
        "id": "clp_s4d-SZd2xs",
        "object": "clip",
        "created_at": "2020-09-03T13:56:54.995",
        "status": "created" -> Los estados pueden ser created done error started rejected
      }
      

      */
    
      
      await Video.create({
        id_peticion_did: data.id,
        titulo,
        descripcion,
        url: null,
        peticion_did: JSON.stringify(body),
        estado_peticion_did: data.status,
        publicado: false,
        fecha_creacion: data.created_at,
        fecha_respuesta_did: null,
        ruta_audio: audio_url,
        ruta_fisica_audio: audioRelative?`uploads${audioRelative.replace(/\\/g, '/')}` : null,
        ruta_imagen: image_url,
        ruta_fisica_imagen: imageRelative?`uploads${imageRelative.replace(/\\/g, '/')}` : null,
        avatar_id,
        voice_id,
        background_color,
        tiene_subtitulos: subtitles === "true"
      });

      res.json({ message: 'Petición de vídeo realizada correctamente al proveedor. Cuando esté listo aparecerá en el menú de Gestión de Vídeos'});

    } catch (error) {
      if(error.response.data){
        console.error("Error generando video:", error.response.data.description);
        res.status(500).json({ error: error.response.data.description });
      }else{
        console.error("Error generando video:", error);
        res.status(500).json({ error: error.message });
      }
    } 

};

const recibirWebhook = async (req, res) => {
  console.log("🎯 Webhook recibido:", JSON.stringify(req.body, null, 2));

  try{
  
    //obtenermos la petición devuelta por did
    const { id, status, result_url } = req.body;

    if(!id){
       return res.status(400).send("ID de petición D-ID no proporcionado en el Webhook");
    }
    
    const video = await Video.findOneAndUpdate(
        {id_peticion_did: id},
        {
        estado_peticion_did: status,
        ...(status === 'done' && {
          url: result_url,
          fecha_respuesta_did: new Date()
        })
      },
      {new: true}
    );
  
    if (!video) {
      console.warn(`⚠️ No se encontró video con id_peticion_did: ${id_peticion_did}`);
      return res.status(404).send("Video no encontrado");
    }

   // Borrar archivos temporales del servidor
    const archivos = [video.ruta_fisica_audio, video.ruta_fisica_imagen];
    archivos.forEach((url) => {
      if (url) {
        const localPath = url.replace(process.env.PUBLIC_URL, '.');
        fs.unlink(localPath, (err) => {
          if (err) console.error(`⚠️ Error al eliminar archivo ${localPath}:`, err);
          else console.log(`🧹 Archivo eliminado: ${localPath}`);
        });
      } 
    });

    res.status(200).send("OK");

  }catch(error){
    console.error("❌ Error en recibirWebhook:", error);
    res.status(500).send("Error interno del servidor");
  }
    
};

const recibirWebhookCrearAvatar = async (req, res) => {
  console.log("🎯 Webhook recibido de la creación del avatar:", JSON.stringify(req.body, null, 2));

  try{
  
    //obtenermos la petición devuelta por did
    const { id, status, result_url } = req.body;

    if(!id){
       return res.status(400).send("ID de petición D-ID no proporcionado en el Webhook");
    }
    
    const video = await Video.findOneAndUpdate(
        {id_peticion_did: id},
        {
        estado_peticion_did: status,
        ...(status === 'done' && {
          url: result_url,
          fecha_respuesta_did: new Date()
        })
      },
      {new: true}
    );
  
    if (!video) {
      console.warn(`⚠️ No se encontró video con id_peticion_did: ${id_peticion_did}`);
      return res.status(404).send("Video no encontrado");
    }

   // Borrar archivos temporales del servidor
    const archivos = [video.ruta_fisica_audio, video.ruta_fisica_imagen];
    archivos.forEach((url) => {
      if (url) {
        const localPath = url.replace(process.env.PUBLIC_URL, '.');
        fs.unlink(localPath, (err) => {
          if (err) console.error(`⚠️ Error al eliminar archivo ${localPath}:`, err);
          else console.log(`🧹 Archivo eliminado: ${localPath}`);
        });
      } 
    });

    res.status(200).send("OK");

  }catch(error){
    console.error("❌ Error en recibirWebhook:", error);
    res.status(500).send("Error interno del servidor");
  }
    
};

const buscarVideos = async (req, res) => {
  try {
    const { titulo, desde, hasta } = req.query;
    const filtro = {};

    if (titulo) {
      filtro.titulo = { $regex: titulo, $options: 'i' }; // búsqueda parcial e insensible a mayúsculas
    }

    if (desde || hasta) {
      filtro.fechaCreacion = {};
      if (desde) filtro.fechaCreacion.$gte = new Date(desde);
      if (hasta) filtro.fechaCreacion.$lte = new Date(hasta);
    }

    const videos = await Video.find(filtro).sort({ fechaCreacion: -1 });
    res.json(videos);
  } catch (err) {
    console.error("❌ Error al obtener vídeos:", err);
    res.status(500).json({ error: "Error al obtener los vídeos" });
  }
};

const crearAgente = async (req, res) => {
    try{
      const body ={
        presenter: {
          type: 'clip',
          voice: {type: 'microsoft', voice_id: 'es-ES-AbrilNeural'},
          presenter_id: 'v2_public_amy@seiu0o2gby'
        },
        llm: {
          provider: 'openai',
          instructions: 'Habla sólo sobre Baldur\'s Gate 3, no hables de otra cosa.'
        },
        preview_name: 'TEST'
      };
    
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

    const data = await didRes.data;
  }catch (err) {
    console.error("❌ Error:", err);
    res.status(500).json({ error: "Error" });
  }
};

const guardarAvatarStream = async (req, res) => {
  
    try {
      const {
        id_avatar_stream,
        avatar_id,
        voice_id,
        idioma,
        saludo,
        instrucciones
      } = req.body;

      

    const body = {
      presenter: {
        type: "clip",
        presenter_id: avatar_id,
        voice:{
          type: 'microsoft',
          voice_id: voice_id
          }
        },
        llm:{
          provider: 'openai',
          instructions: "Importante, debes responder en este idioma específicamente: "+idioma+". "+instrucciones
        },
        embed: 'true',
        greetings: [saludo]
    };

      console.info("Body a enviar a D-ID:", JSON.stringify(body, null, 2));

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
      //Si todo ha ido bien, guardamos en base de datos
      const data = await didRes.data;
      
       const actualizado = await AvatarStreams.findOneAndUpdate(
      { id_avatar: id_avatar_stream },   // busca por idAvatarStream
      { saludo: saludo,
        instrucciones: instrucciones,
        presentador:{
          voice_id: voice_id,
          presenter_id: avatar_id
        }
      },
      { upsert: true, new: true }          // si no existe, lo crea
      );
    
      if(!actualizado){
        console.error("Error al guardar el avatar de stream:", error);
        res.status(500).json({ error: "Error al guardar el avatar de stream: "+error.message });
      }

      res.json({ message: 'El avatar de streaming ha sido correctamente actualizado.'});

    } catch (error) {
        console.error("Error al guardar el avatar de stream:", error);
        res.status(500).json({ error: "Error al guardar el avatar de stream: "+error.message });
    } 

};

const cargarAvatarStream = async (req, res) => {
  
  try{
      //Obtenemos el único registro que hay en base de datos
      const avatarStream = await AvatarStreams.findOne();

      //Buscamos el id del avatar elegido para las presentaciones
      const didRes = await axios.get(
        `${process.env.DID_API_URL}/clips/presenters/${avatarStream.presentador.presenter_id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${process.env.DID_API_KEY}`
          }
        }
      );
    const actor = didRes.data.presenters?.[0];
     if (!actor) {
      return res.status(404).json({ error: "No se encontró presentador en la API de D-ID." });
    }
      // 4. Combinar con la información local y enviar como respuesta
      res.json({
        ...avatarStream.toObject(),
        actor: actor
      });
   

    } catch (error) {
        console.error("Error generando video:", error);
        res.status(500).json({ error: "Error al guardar el vatar de stream: "+error.message });
    } 

};

const crearAvatar = async (req, res) => {
  try {
    const videoFile = req.files?.video?.[0].path;
    const { nombre, genero } = req.body;

    if (!videoFile || !nombre || !genero) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    //Antes de nada, vemos si existe ya un avatar en base de datos
     const avatarActual = await Avatars.findOne();
     if(avatarActual){ //Eliminamos el avatar actual de D-ID y de base de datos
      try{
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
            }catch(error){
            if(error.response.data){
                    console.error("Error generando borrando Avatar de D-ID:", error.response.data.description);
            }else{
                    console.error("Error generando borrando Avatar de D-ID", error);
                  }
            }
      //Borramos de base de datos
        console.info("Borramos el avatar anterior de Base de datos");
        const borrado = await Avatars.deleteOne({ id_avatar: avatarActual.id_avatar });
     }

    //Hacemos un consentimiento (dato necesario para la creación del avatar)
      const body = {
        language: "spanish"
      } ;

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
      //recogemos didRes.data.id
    
    const id_consentimiento = didRes.data.id;
      console.info("Hemos obtenido el id del consentimiento")

    // Convertir rutas locales en URLs accesibles
    const videoRelative = videoFile ? videoFile.split("uploads")[1] : null;

    const video_url = videoRelative ? `${process.env.PUBLIC_URL}/upload${videoRelative.replace(/\\/g, '/')}` : null;

     
      body2 = {
      gender: genero,
      webhook: `${process.env.PUBLIC_URL}/api/did/webhookCrearAvatar`,        
      config: {is_greenscreen: 'false'},
      source_url: video_url,
      name: nombre,
      consent_id: id_consentimiento
    };

      console.log("Body a enviar a D-ID:", JSON.stringify(body2, null, 2));

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

    const idNuevoAvatar = didRes2.data.id;
    const status = didRes2.data.status;
    console.info("Guardamos los datos del nuevo avatar en base de datos");
    const avatarGuardar = await Avatars.create({
      id_avatar: idNuevoAvatar,
      ruta_video: video_url,
      ruta_fisica_video: videoRelative?`uploads${videoRelative.replace(/\\/g, '/')}` : null,
      status: status,
      errores: ''
      });

    console.info("Guardado correcto de los datos del avatar");

    return res.status(200).json({
      message: "Avatar creado correctamente",
    });
  } catch (err) {
    console.error("❌ Error al crear avatar:", err);
    res.status(500).json({ error: "Error interno al crear el avatar" });
    }
  };

const borrarVideo = async (req, res) => {
  const { id } = req.params;

  try {
    const resultado = await Video.findByIdAndDelete(id); 
    if (!resultado) {
      return res.status(404).json({ error: "Vídeo no encontrado" });
    }

    res.json({ message: "Vídeo borrado correctamente" });

  } catch (error) {
    console.error("Error al borrar el vídeo:", error);
    res.status(500).json({ error: "Error al borrar el vídeo" });
  }
};


module.exports = { obtenerAvatares, generarVideo, obtenerVocesMicrosoft, recibirWebhook, recibirWebhookCrearAvatar, buscarVideos, crearAgente, guardarAvatarStream, cargarAvatarStream, crearAvatar, borrarVideo };