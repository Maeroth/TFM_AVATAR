// Importa React y el hook useState para manejar los datos del formulario
import React, { useEffect, useState } from "react";
// Importa axios para hacer peticiones HTTP al backend
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


// Componente principal de Login
export default function Login() {
  // Estados para guardar el texto del input "usuario" y "password"
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [alerta, setAlerta] = useState(null); //mostrará los mensajes de error
  const navigate = useNavigate();
  
  // Función que se ejecuta al enviar el formulario
  const handleLogin = async (e) => {
    e.preventDefault(); // Previene que el formulario recargue la página
    setAlerta(''); // Limpia errores anteriores

    try {
      // Envía los datos al backend con axios (usuario y contraseña)
      const respuesta = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        usuario,
        password,
      });

      // Si el login es correcto, guarda el token en el navegador
      localStorage.setItem('token', respuesta.data.token);
      
      // Redirigir según el nombre de usuario
      if (usuario.toLowerCase() === 'admin') {
        navigate('/admin');
      } else if (usuario.toLowerCase() === 'experto') {
        navigate('/proveedores');
      } else {
        setAlerta({ tipo: "danger", mensaje: "Usuario sin acceso asignado"});
      }

    } catch (err) {
      // Si hay un error (usuario incorrecto o servidor caído), muestra mensaje
      setAlerta({ tipo: "danger", mensaje: "Usuario o contraseña incorrectos"});
    }
  };

useEffect(() => {
  if (alerta) {
    const timer = setTimeout(() => setAlerta(null), 5000); //5 segundos
    return () => clearTimeout(timer);
  }
}, [alerta]);

  // (formulario con Bootstrap)
  return (
    <div className="d-flex flex-column align-items-center justify-content-start pt-5" style={{ minHeight: "80vh" }}>
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

        {alerta && (
                    <div className={`alert alert-${alerta.tipo} mt-3`}>
                      {alerta.mensaje}
                    </div>
                  )}
      
        {/* Botón para enviar el formulario */}
       <div className="text-center mt-3">
        <button className="btn btn-primary px-5 py-1 fs-5">Entrar</button>
      </div>
      </form>

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