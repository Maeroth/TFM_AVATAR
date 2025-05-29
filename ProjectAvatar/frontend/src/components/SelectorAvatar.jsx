import React, { useEffect, useState } from "react";
import axios from "axios";

const SelectorAvatar = ({ onSeleccionarAvatar }) => {
  const [presentadores, setPresentadores] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [busqueda, setBusqueda] = useState("");
  const elementosPorPagina = 9;

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/api/did/avatares`)
      .then(res => setPresentadores(res.data.presenters || []))
      .catch(err => console.error("Error al cargar presentadores:", err));
  }, []);

  const presentadoresFiltrados = presentadores.filter((p) =>
    p.name.toLowerCase().includes(busqueda.toLowerCase())
  );

  const totalPaginas = Math.ceil(presentadoresFiltrados.length / elementosPorPagina);

  const presentadoresVisibles = presentadoresFiltrados.slice(
    (pagina - 1) * elementosPorPagina,
    pagina * elementosPorPagina
  );

  return (
    <div className="my-3">
      <input
        type="text"
        className="form-control mb-3"
        placeholder="Buscar por nombre..."
        value={busqueda}
        onChange={(e) => {
          setBusqueda(e.target.value);
          setPagina(1);
        }}
      />

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
                onClick={() => onSeleccionarAvatar(avatar)}
              />
              <div className="card-body text-center">
                <strong className="text-capitalize">{avatar.name}</strong>
              </div>
            </div>
          </div>
        ))}
      </div>

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
    </div>
  );
};

export default SelectorAvatar;