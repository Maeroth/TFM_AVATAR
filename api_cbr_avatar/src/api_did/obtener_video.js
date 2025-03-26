// src/api_did/test_did.js
require('dotenv').config();
const axios = require('axios');

const url = 'https://api.d-id.com/talks/tlk_iRW1DbFtB3TvsPSTKZImC';
const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    authorization: `Basic ${process.env.DID_API_KEY}`
   }
};

fetch(url, options)
  .then(res => res.json())
  .then(json => console.log(json))
  .catch(err => console.error(err));