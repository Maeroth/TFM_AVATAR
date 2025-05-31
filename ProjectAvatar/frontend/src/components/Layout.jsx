import React from "react";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div className="d-flex flex-column min-vh-100">

      {/* Banda superior de ancho total */}
      <header className="bg-dark text-white py-3 shadow" style={{ width: "100vw" }}>
        <h1 className="text-center m-0">Plataforma de Avatares Virtuales</h1>
      </header>

      {/* Contenido principal centrado */}
      <main className="flex-grow-1 py-4">
        <div className="container-sd">
          <Outlet />
        </div>
      </main>

      {/* Banda inferior de ancho total */}
      <footer className="bg-dark text-white text-center py-2 mt-auto" style={{ width: "100vw" }}>
        Proyecto TFM – {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default Layout;
