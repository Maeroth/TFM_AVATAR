require('dotenv').config(); // Carga las variables de entorno desde el archivo .env

const express = require('express'); // Importa Express (framework de servidor)

const cors = require('cors'); // Importa CORS para permitir peticiones entre dominios distintos

const connectDB = require('./config/db'); 

const app = express();  // Crea la instancia de la aplicación Express

const authRoutes = require('./routes/auth');

const videoRoutes = require('./routes/videos'); //Importa Videos

app.use(cors()); // Habilita CORS (permite llamadas desde el frontend)

app.use(express.json()); // Permite procesar JSON en el cuerpo de las peticiones (body-parser integrado)

app.use('/api/videos', videoRoutes); //Petición a videoRoutes

app.use('/api/auth', authRoutes);

connectDB(); // Ejecuta la conexión con la base de datos MongoDB

// Ruta de prueba para comprobar que el servidor está corriendo
app.get('/', (req, res) => {
  res.send('API funcionando');
});

module.exports = app;