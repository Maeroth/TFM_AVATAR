const User = require('../models/User'); // Importamos el modelo de usuario para acceder a la base de datos de usuarios

const bcrypt = require('bcrypt'); // Importamos bcrypt para poder comparar contraseñas cifradas

const jwt = require('jsonwebtoken'); // Importamos jsonwebtoken para generar tokens JWT

// Controlador para el inicio de sesión
const login = async (req, res) => {
  
  const { usuario, password } = req.body; // Extraemos los datos de usuario y contraseña del cuerpo de la petición

  try {
    
    console.log('Usuario que entra: ' + usuario);

    
    const user = await User.findOne({ usuario });// Buscamos en la base de datos un usuario con el nombre proporcionado
    
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' }); // Si no se encuentra el usuario, devolvemos error 404 (no encontrado)

    const valid = await bcrypt.compare(password, user.password); // Comparamos la contraseña ingresada con la almacenada (ya cifrada) en la base de datos

    // Si la contraseña no coincide, devolvemos error 401 (no autorizado)
    if (!valid) return res.status(401).json({ error: 'Contraseña incorrecta' });

    // Si todo es correcto, generamos un token JWT con los datos del usuario
    const token = jwt.sign(
      { id: user._id, usuario: user.usuario }, // payload del token
      process.env.JWT_SECRET,                 // clave secreta definida en variables de entorno
      { expiresIn: '2h' }                     // el token expira en 2 horas
    );

    res.status(200).json({ token, usuario });

  } catch (err) {
    // Si ocurre algún error en el proceso, devolvemos un error 500 (interno del servidor)
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
};

module.exports = { login };
