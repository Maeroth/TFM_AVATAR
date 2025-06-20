import React from "react";
import { Outlet, useNavigate } from "react-router-dom";

const Layout = () => {
  const navigate = useNavigate();

  // Recuperamos el nombre de usuario desde el localStorage si está logueado
  const usuario = localStorage.getItem('usuario');

  // Función para cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/'); // Redirige al login
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Banda superior */}
      <header
        className="bg-dark text-white py-3 shadow position-relative"
        style={{ width: "100vw", height: "70px" }}
      >
        {/* Título centrado en pantalla */}
        <h1
          className="position-absolute top-50 start-50 translate-middle m-0 text-center"
          style={{ fontSize: "2.5rem", whiteSpace: "nowrap" }}
        >
          Plataforma de gestión <strong className="titulo_cabecera_layout">GO-AVATAR</strong>
        </h1>

        {/* Usuario logueado en esquina superior derecha */}
        {usuario && (
          <div className="position-absolute top-50 end-0 translate-middle-y d-flex align-items-center gap-3 me-4">
            <span className="small mb-0">
              Usuario: <strong>{usuario}</strong>
            </span>
            <button
              className="btn btn-outline-light px-4 py-1"
              onClick={handleLogout}
            >
              Salir
            </button>
          </div>
        )}
      </header>


      {/* Contenido principal */}
      <main className="flex-grow-1 py-4">
        <div className="container-sd">
          <Outlet />
        </div>
      </main>

      {/* Pie de página */}
      <footer className="bg-dark text-white text-center py-2 mt-auto" style={{ width: "100vw" }}>
        Proyecto TFM – {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default Layout;