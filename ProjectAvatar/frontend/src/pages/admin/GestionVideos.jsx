import React, { useEffect, useState } from "react";
import axios from "axios";
// Importación del hook para navegar entre rutas
import { useNavigate } from 'react-router-dom';
import { Tooltip } from "bootstrap"; //Tooltips de bootstrap para indicaciones

let debounceTimer;

const GestionVideos = () => {
  const navigate = useNavigate(); // Permite redirigir al usuario a otra pantalla
  const [videos, setVideos] = useState([]);
  const [titulo, setTitulo] = useState("");
  const [desde, setDesde] = useState("");
  const [loading, setLoading] = useState(true);// Control de carga inicial
  const [loadingDelete, setLoadingDelete] = useState(null); //control para el borrado de un vídeo
  const [hasta, setHasta] = useState("");
  const [videoEnProceso, setVideoEnProceso] = useState(null);


  /*
    Busca los vídeos que hay en base de datos. Se puede buscar por criterios.
  */
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
    } finally{
      setLoading(false); // Desactiva la pantalla de carga
    }
  };

  //Importante: Esto no debe cargar hasta que se haya cargado la página, si no no mostrará los tooltips
  useEffect(() => {
    if(loading) return; //Esperamos a que termine de cargar el contenido
    // Inicializa los tooltips de Bootstrap sobre cualquier elemento que tenga el atributo data-bs-toggle="tooltip"
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');

    // Se crean los tooltips permitiendo HTML, alineación rápida, y ocultándose al perder el foco
    const tooltips = [...tooltipTriggerList].map((el) =>
      new Tooltip(el, {
        trigger: 'hover focus',  // evita que el tooltip se quede abierto tras clic
        delay: { show: 0, hide: 100 }, // muestra inmediato, oculta suavemente
        html: true // permite incluir <strong>, <br>, etc. dentro del tooltip
      })
    );

    // Limpieza de los tooltips al desmontar el componente (buena práctica para evitar fugas de memoria)
    return () => {
      tooltips.forEach(t => t.dispose());
    };
  }, [loading]);

  /*
    Tiempo de espera para una nueva búsqueda en caso de estar escribiendo en algún criterio
  */
  useEffect(() => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      fetchVideos();
    }, 500); // espera 500ms tras dejar de escribir/seleccionar
  }, [titulo, desde, hasta]);

   /*
    Publica en la red social X (antiguo Twitter)
  */
  const publicarEnX = async (videoId) => {
    try {
      setVideoEnProceso(videoId); // activa el spinner para este vídeo

      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/X/publicarVideoEnX`, {
        videoId
      });

      fetchVideos(); // recarga la tabla
    } catch (err) {
      console.error("Error publicando en X:", err);
      alert("Error al publicar en X");
    } finally {
      setVideoEnProceso(null); // desactiva el spinner
    }
  };


/*
  Elimina el vídeo seleccionado en la tabla
*/
const handleBorrar = async (id) => {
  const confirmar = confirm("¿Estás seguro de que deseas borrar este vídeo?");
  if (!confirmar) return;

  try {
    setLoadingDelete(id);
    await axios.delete(`${import.meta.env.VITE_API_URL}/api/did/borrarVideo/${id}`);
    
    fetchVideos(); // Refresca la lista
  } catch (err) {
    console.error("Error al borrar vídeo:", err.error || err.message);
    alert(err.error || err.message);
  }finally{
    setLoadingDelete(null);
  }
};

if (loading) { //Si la pantalla se está cargando todavía de la búsqueda inicial...
  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="text-center">
        <div
          className="spinner-border text-primary"
          role="status"
          style={{ width: "3rem", height: "3rem" }}
        ></div>
      </div>
    </div>
  );
} else { //ya ha cargado la página
    return (
     <div className="container animar-entrada d-flex justify-content-center">
     <div className="w-100" style={{ maxWidth: "1100px" }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
         <h2>Gestión de Vídeos</h2>
         <button onClick={() => navigate("/admin")} className="btn btn-outline-secondary">
           ← Volver
         </button>
        </div>
        <div className="row my-3">
          <div className="col-md-4">
            <label className="form-label fw-semibold">Título:</label>
            <input
              type="text"
              className="form-control"
              placeholder="Buscar por título"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
            />
          </div>
          <div className="col-md-3">
            <label className="form-label fw-semibold">Fecha desde:</label>
            <div className="input-group">
              <input
                type="date"
                className="form-control"
                value={desde}
                onChange={(e) => setDesde(e.target.value)}
              />
              <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={() => setDesde("")}
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
                  data-bs-title="Borrar fecha"
                >
                  ❌
              </button>
            </div>
          </div>
          <div className="col-md-3">
            <label className="form-label fw-semibold">Fecha hasta:</label>
            <div className="input-group">
              <input
                type="date"
                className="form-control"
                value={hasta}
                onChange={(e) => setHasta(e.target.value)}
              />
              
              <button
                className="btn btn-outline-secondary"
                type="button"
                onClick={() => setHasta("")}
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                data-bs-title="Borrar fecha"
              >
                ❌
              </button>
            </div>
          </div>

          
        </div>

        <table className="table table-bordered table-striped">
          <thead className="table-light">
            <tr>
              <th className="text-center">Título</th>
              <th className="text-center">Descripción</th>
              <th className="text-center">Fecha</th>
              <th className="text-center">Estado</th>
              <th className="text-center">Publicado</th>
              <th className="text-center">Descargar</th>
              <th className="text-center">Eliminar</th>
            </tr>
          </thead>
          <tbody>
            {videos.map((video) => (
              <tr key={video._id}>
                <td className="align-middle text-start">{video.titulo}</td>
                <td className="align-middle text-start">{video.descripcion}</td>
                <td className="align-middle text-start">{new Date(video.fechaCreacion).toLocaleString()}</td>
               <td className="align-middle text-center">
                  {video.estado_peticion_did === "created" ? (
                    <span className="text-primary fw-bold text-uppercase d-flex justify-content-center align-items-center gap-2">
                      <div
                        className="spinner-border spinner-border-sm text-primary"
                        role="status"
                        style={{ width: "1rem", height: "1rem" }}
                        data-bs-toggle="tooltip"
                        data-bs-placement="top"
                        data-bs-title="El vídeo aún se está generando actualmente."
                      ></div>
                    </span>
                  ) : video.estado_peticion_did === "done" ? (
                    <div
                      data-bs-toggle="tooltip"
                      data-bs-placement="top"
                      data-bs-title="Vídeo generado correctamente."
                    >
                      <i className="bi bi-check-circle-fill text-success fs-4"></i>
                    </div>
                  ) : (
                    <span className="fw-bold text-uppercase">{video.estado_peticion_did}</span>
                  )}
                </td>
                <td className="align-middle text-center">
                   <div className="d-flex justify-content-center align-items-center h-100">
                      {video.estado_peticion_did === "done" && (
                        video.publicado ? (
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
                            className="btn btn-sm btn-success d-flex align-items-center justify-content-center gap-2"
                            onClick={() => publicarEnX(video._id)}
                            disabled={videoEnProceso === video._id}
                          >
                            {videoEnProceso === video._id ? (
                              <>
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                Publicando...
                              </>
                            ) : (
                              "📤 Publicar en X"
                            )}
                          </button>
                        )
                      )}
                    </div>
                </td>
                <td className="align-middle text-center">
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
                      " "
                      )}
                  </td>
                  <td className="align-middle text-center">
                     <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleBorrar(video._id)}
                        disabled={loadingDelete === video._id}
                      >
                        {loadingDelete === video._id ? (
                          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        ) : (
                          "❌"
                        )}
                      </button>
                  </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>
    );
  }
};

export default GestionVideos;