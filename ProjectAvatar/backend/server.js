const app = require('./app');

const PORT = process.env.PORT || 5000; // Define el puerto de escucha (usa el de .env o 5000 por defecto)

// Arranca el servidor y escucha peticiones
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
