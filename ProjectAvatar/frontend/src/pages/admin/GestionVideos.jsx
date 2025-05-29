import React, { useEffect, useState } from "react";
import axios from "axios";

let debounceTimer;

const GestionVideos = () => {
  const [videos, setVideos] = useState([]);
  const [titulo, setTitulo] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  const fetchVideos = async () => {
    try {
      const params = {};
      if (titulo) params.titulo = titulo;
      if (desde) params.desde = desde;
      if (hasta) params.hasta = hasta;

      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/did/buscarVideos`, { params });
      setVideos(res.data);
    } catch (err) {
      console.error("Error al cargar vídeos:", err);
    }
  };

  useEffect(() => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      fetchVideos();
    }, 500); // espera 500ms tras dejar de escribir/seleccionar
  }, [titulo, desde, hasta]);

  const publicarEnX = async (videoId) => {
  try {
    const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/X/publicarVideoEnX`, {
      videoId
    });

    alert("✅ Vídeo publicado correctamente en X");
    fetchVideos();
  } catch (err) {
    console.error("Error publicando en X:", err);
    alert("❌ Error al publicar en X");
  }
};
  return (
    <div className="container py-4">
      <h2>Gestión de Vídeos</h2>

      <div className="row my-3">
        <div className="col-md-4">
          <input
            type="text"
            className="form-control"
            placeholder="Buscar por título"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <input
            type="date"
            className="form-control"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <input
            type="date"
            className="form-control"
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
          />
        </div>
      </div>

      <table className="table table-bordered table-striped">
        <thead className="table-light">
          <tr>
            <th>Título</th>
            <th>Descripción</th>
            <th>Fecha</th>
            <th>Estado</th>
            <th>Publicado</th>
            <th>Descargar</th>
          </tr>
        </thead>
        <tbody>
          {videos.map((video) => (
            <tr key={video._id}>
              <td>{video.titulo}</td>
              <td>{video.descripcion}</td>
              <td>{new Date(video.fechaCreacion).toLocaleString()}</td>
              <td>{video.estado_peticion_did}</td>
              <td>{video.publicado ? (
                    <a
                    href={video.url_publicacion}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-outline-info"
                    >
                    🐦 Ver Tweet
                    </a>
                ) : (
                    <button
                    className="btn btn-sm btn-success"
                    onClick={() => publicarEnX(video._id)}
                    >
                    📤 Publicar en X
                    </button>
                )}</td>
              <td>
                {video.url ? (
                  <a href={video.url} download={`video_${video._id}.mp4`} >
                    <video
                      src={video.url}
                      width="160"
                      height="90"
                      muted
                      style={{ cursor: "pointer", borderRadius: "6px" }}
                    />
                    </a>
                    ) : (
                    "—"
                    )}
                </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GestionVideos;