// src/api_did/test_did.js
require('dotenv').config();
const axios = require('axios');

// Iniciar temporizador
console.time("⏱️ Tiempo de respuesta");

// URL del endpoint de D-ID para generación de vídeo (ejemplo real)
const url = 'https://api.d-id.com/talks';

const data = {
  script: {
    type: 'text',
    input: 'Hola, soy un avatar generado por inteligencia artificial.',
    provider: {
        type: 'microsoft', 
        voice_id: 'Sara'},
  },
  config: {
    fluent: true,
    pad_audio: 0.5,
    output_resolution: 1280
  },
  source_url: 'https://d-id-public-bucket.s3.us-west-2.amazonaws.com/alice.jpg'
};

const headers = {
  Authorization: `Basic ${process.env.DID_API_KEY}`,
  'Content-Type': 'application/json'
};

axios.post(url, data, { headers })
  .then(res => {
    console.log('✅ Video generado correctamente');
    console.log('➡️  Id:', res.data.id);
    console.timeEnd("⏱️ Tiempo de respuesta"); // Mostrar duración en consola
  })
  .catch(err => {
    console.error('❌ Error en la solicitud:');
    console.error(err.response.data.message);
    console.timeEnd("⏱️ Tiempo de respuesta"); // Mostrar duración en consola
  });