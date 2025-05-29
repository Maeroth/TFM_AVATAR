require('dotenv').config(); // Carga las variables de entorno desde el archivo .env

const express = require('express'); // Importa Express (framework de servidor)
const cors = require('cors'); // Importa CORS para permitir peticiones entre dominios distintos
const connectDB = require('./config/db'); 
const path = require("path");
const app = express();  // Crea la instancia de la aplicación Express


//Redirecciones:
const authRoutes = require('./routes/auth'); //Autenticación
const providersRoutes = require('./routes/providers'); //Para los proveedores (editar, nuevo y borrar)
const pesosRoutes = require('./routes/pesos');
const caracteristicasRoutes = require('./routes/caracteristicas');
const didRoutes = require('./routes/did');
const XRoutes = require('./routes/x'); //Para publicar en X (Twitter)


//Usos
app.use(cors()); // Habilita CORS (permite llamadas desde el frontend)
app.use(express.json()); // Permite procesar JSON en el cuerpo de las peticiones (body-parser integrado)
app.use('/api/auth', authRoutes);
app.use('/api/proveedores', providersRoutes); //Petición a Proveedor
app.use('/api/pesos', pesosRoutes);
app.use('/api/caracteristicas', caracteristicasRoutes);
app.use('/api/did', didRoutes);
app.use("/api/X", XRoutes);
app.use("/upload", express.static(path.join(__dirname, "uploads"))); //hace visible la carpeta uploads

connectDB(); // Ejecuta la conexión con la base de datos MongoDB

// Ruta de prueba para comprobar que el servidor está corriendo
app.get('/', (req, res) => {
  res.send('API funcionando');
});

module.exports = app;
