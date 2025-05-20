// Importa React y el hook useState para manejar los datos del formulario
import { useState } from 'react';
// Importa axios para hacer peticiones HTTP al backend
import axios from 'axios';

import { useNavigate } from 'react-router-dom';


// Componente principal de Login
export default function Login() {
  // Estados para guardar el texto del input "usuario" y "password"
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // Para mostrar mensaje de error si falla el login
  const navigate = useNavigate();
  
  // Función que se ejecuta al enviar el formulario
  const handleLogin = async (e) => {
    e.preventDefault(); // Previene que el formulario recargue la página
    setError(''); // Limpia errores anteriores

    try {
      // Envía los datos al backend con axios (usuario y contraseña)
      const respuesta = await axios.post('http://localhost:5000/api/auth/login', {
        usuario,
        password,
      });

      // Si el login es correcto, guarda el token en el navegador
      localStorage.setItem('token', respuesta.data.token);
      
      // Redirigir según el nombre de usuario
      if (usuario.toLowerCase() === 'admin') {
        navigate('/parametros');
      } else if (usuario.toLowerCase() === 'experto') {
        navigate('/proveedores');
      } else {
        alert('Usuario sin acceso asignado');
      }

    } catch (err) {
      // Si hay un error (usuario incorrecto o servidor caído), muestra mensaje
      setError('Usuario o contraseña incorrectos');
    }
  };

  // (formulario con Bootstrap)
  return (
    <div className="container mt-5">
      <h2>Iniciar sesión</h2>

      {/* Formulario de login */}
      <form onSubmit={handleLogin}>
        {/* Campo de texto para el usuario */}
        <div className="mb-3">
          <label>Usuario</label>
          <input
            type="text"
            className="form-control"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)} // Actualiza el estado
          />
        </div>

        {/* Campo de contraseña */}
        <div className="mb-3">
          <label>Contraseña</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)} // Actualiza el estado
          />
        </div>

        {/* Si hay error, se muestra aquí en rojo */}
        {error && <p className="text-danger">{error}</p>}

        {/* Botón para enviar el formulario */}
        <button type="submit" className="btn btn-primary">Entrar</button>
      </form>
    </div>
  );
}