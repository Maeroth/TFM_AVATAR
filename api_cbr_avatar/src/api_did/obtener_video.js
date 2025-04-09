// src/api_did/test_did.js
require('dotenv').config();
const axios = require('axios');

const url = 'https://api.d-id.com/talks/tlk_iRW1DbFtB3TvsPSTKZImC';

const headers = {
  Accept: 'application/json',
  Authorization: `Basic ${process.env.DID_API_KEY}`
};

axios.get(url, { headers })
  .then(response => {
    console.log('✅ Respuesta de la API:', response.data);
  })
  .catch(error => {
    console.error('❌ Error en la solicitud:', error.response?.data || error.message);
  });