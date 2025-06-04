// Importamos React y el hook useState para manejar los datos del formulario (usuario y contraseña),
// y useEffect para manejar efectos colaterales (como ocultar alertas tras unos segundos).
import React, { useEffect, useState } from "react";

// Importamos axios para realizar peticiones HTTP al backend.
import axios from 'axios';

// Hook de navegación para redirigir según el tipo de usuario.
import { useNavigate } from 'react-router-dom';

// Componente principal de la página de Login
export default function Login() {
  // Estados para almacenar los valores de los campos del formulario
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [alerta, setAlerta] = useState(null); // Almacena mensajes de error o información
  const navigate = useNavigate(); // Permite la navegación a otras rutas

  // Función que se ejecuta al enviar el formulario de login
  const handleLogin = async (e) => {
    e.preventDefault(); // Evita la recarga de la página al enviar el formulario
    setAlerta(''); // Limpiamos cualquier alerta previa

    try {
      // Enviamos una petición POST al backend con los datos de login
      const respuesta = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        usuario,
        password,
      });

      // Si la autenticación es correcta, almacenamos el token en localStorage
      localStorage.setItem('token', respuesta.data.token);
      localStorage.setItem('usuario', respuesta.data.usuario);
      
      // Redireccionamos al usuario a la sección correspondiente según su rol
      if (usuario.toLowerCase() === 'admin') {
        navigate('/admin');
      } else if (usuario.toLowerCase() === 'experto') {
        navigate('/proveedores');
      } else {
        // Si el usuario no tiene acceso asignado, se muestra un mensaje
        setAlerta({ tipo: "danger", mensaje: "Usuario sin acceso asignado" });
      }

    } catch (err) {
      // Si el login falla (credenciales incorrectas o error del servidor), mostramos una alerta
      setAlerta({ tipo: "danger", mensaje: "Usuario o contraseña incorrectos" });
    }
  };

  // useEffect que hace desaparecer la alerta tras 5 segundos
  useEffect(() => {
    if (alerta) {
      const timer = setTimeout(() => setAlerta(null), 5000);
      return () => clearTimeout(timer); // Limpieza del temporizador si se desmonta el componente
    }
  }, [alerta]);

  // Renderizado del formulario de inicio de sesión con estilos Bootstrap
  return (
    <div className="d-flex animar-entrada flex-column align-items-center justify-content-start pt-5" style={{ minHeight: "80vh" }}>
      <div className="w-100" style={{ maxWidth: "350px" }}>
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
              onChange={(e) => setUsuario(e.target.value)} // Actualiza el estado del input
            />
          </div>

          {/* Campo de contraseña */}
          <div className="mb-3">
            <label>Contraseña</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)} // Actualiza el estado del input
            />
          </div>

          {/* Alerta si existe un mensaje que mostrar */}
          {alerta && (
            <div className={`alert alert-${alerta.tipo} mt-3`}>
              {alerta.mensaje}
            </div>
          )}
          
          {/* Botón de envío del formulario */}
          <div className="text-center mt-3">
            <button className="btn btn-primary px-5 py-1 fs-5">Entrar</button>
          </div>
        </form>

        {/* Botón secundario que permite redirigir al usuario a la pantalla de asesoramiento */}
        <div className="mt-5 pt-4 border-top text-center">
          <button
            type="button"
            className="btn btn-warning btn-lg fw-bold px-4"
            onClick={() => navigate('/conexionStream')}
          >
            ¿Necesitas asesoramiento? 💬
          </button>
        </div>
      </div>
    </div>
  );
}
