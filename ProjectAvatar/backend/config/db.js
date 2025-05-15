const mongoose = require('mongoose');

// Función que conecta a la base de datos
const connectDB = async () => {
  try {
    // Conexión a MongoDB usando la URI definida en el .env
    await mongoose.connect(process.env.MONGO_URI, {
      
    });

    console.log('MongoDB conectado');

  } catch (error) {
    console.error('Error al conectar con MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;