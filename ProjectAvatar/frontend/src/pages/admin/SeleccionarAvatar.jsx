import React, { useEffect, useState } from "react";
import axios from "axios";

const SeleccionarAvatar = () => {
  const [presentadores, setPresentadores] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(false);
  const [avatarSeleccionado, setAvatarSeleccionado] = useState(null);
  const [mostrarPanel, setMostrarPanel] = useState(true);

  const elementosPorPagina = 9;

  useEffect(() => {
    const cargarTodos = async () => {
      setCargando(true);
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/did/avatares`);
        setPresentadores(res.data.presenters || []);
      } catch (err) {
        console.error("Error al cargar presentadores:", err);
      }
      setCargando(false);
    };

    cargarTodos();
  }, []);

  const manejarSeleccion = (avatar) => {
    setAvatarSeleccionado(avatar);
    setMostrarPanel(false);
  };

  const presentadoresFiltrados = presentadores.filter((p) =>
    p.name.toLowerCase().includes(busqueda.toLowerCase())
  );

  const totalPaginas = Math.ceil(presentadoresFiltrados.length / elementosPorPagina);

  const presentadoresVisibles = presentadoresFiltrados.slice(
    (pagina - 1) * elementosPorPagina,
    pagina * elementosPorPagina
  );

  return (
    <div className="container py-4">
      <h2 className="mb-4">Selecciona un Avatar</h2>

      {/* Avatar seleccionado */}
      {avatarSeleccionado && (
        <div className="alert alert-info d-flex align-items-center justify-content-start gap-3">
          <img
            src={avatarSeleccionado.thumbnail}
            alt={avatarSeleccionado.name}
            style={{ width: "50px", height: "50px", borderRadius: "5px", objectFit: "cover" }}
          />
          <strong className="text-capitalize">{avatarSeleccionado.name}</strong>
          <input type="hidden" value={avatarSeleccionado.id} name="avatarId" />
          <button className="btn btn-sm btn-outline-secondary ms-auto" onClick={() => setMostrarPanel(true)}>
            Cambiar Avatar
          </button>
        </div>
      )}

      {/* Buscador */}
      {mostrarPanel && (
        <>
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Buscar por nombre..."
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setPagina(1);
              }}
            />
          </div>

          {/* Lista de avatares */}
          {cargando ? (
            <p>Cargando avatares...</p>
          ) : (
            <>
              <div className="row">
                {presentadoresVisibles.map((avatar) => (
                  <div key={avatar.id} className="col-md-4 mb-4">
                    <div className="card shadow-sm h-100">
                      <video
                        src={avatar.talkingPreview}
                        className="card-img-top"
                        autoPlay
                        loop
                        muted
                        playsInline
                        preload="none"
                        style={{
                          width: "100%",
                          height: "250px",
                          objectFit: "contain",
                          backgroundColor: "#000",
                          cursor: "pointer"
                        }}
                        onClick={() => manejarSeleccion(avatar)}
                      />
                      <div className="card-body text-center">
                        <strong className="text-capitalize">{avatar.name}</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Paginación */}
              <div className="d-flex justify-content-between align-items-center mt-4">
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => setPagina(pagina - 1)}
                  disabled={pagina === 1}
                >
                  ← Anterior
                </button>

                <span>Página {pagina} de {totalPaginas}</span>

                <button
                  className="btn btn-outline-primary"
                  onClick={() => setPagina(pagina + 1)}
                  disabled={pagina >= totalPaginas}
                >
                  Siguiente →
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default SeleccionarAvatar;
