import React, { useState, useEffect } from "react";
import axios from "axios";
import SubidaVideo from "../../components/SubidaVideo"; // Asegúrate de ajustar la ruta

const CrearAvatar = () => {
  const [nombre, setNombre] = useState("");
  const [genero, setGenero] = useState("");
  const [video, setVideo] = useState(null);
  const [videoValido, setVideoValido] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [guardando, setGuardando] = useState(false);

const [videoKey, setVideoKey] = useState(Date.now()); // clave inicial



  const esFormularioValido =
    nombre.trim().length > 0 &&
    genero &&
    videoValido;

  const handleCrearAvatar = async () => {
    if (!nombre.trim() || !genero || !video) {
      setMensaje({ tipo: "danger", texto: "Por favor, completa todos los campos." });
      return;
    }

    const formData = new FormData();
    formData.append("nombre", nombre.trim());
    formData.append("genero", genero);
    formData.append("video", video, "avatar.mp4");

    try {
      setGuardando(true); // Mostrar spinner en botón
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/did/crearAvatar`, formData);
      setMensaje({ tipo: "success", texto: res.data.message || "Avatar creado correctamente." });
      setNombre(""); setGenero(""); setVideo(null); setVideoKey(Date.now());
    } catch (err) {
      console.error(err.response.data.message);
      setMensaje({ tipo: "danger", texto: "Error al crear el avatar: "+err.response.data.message });
    }finally{
          setGuardando(false); // Mostrar spinner en botón
    }
  };

  return (
    <div className="container py-4">
      <h2 className="mb-4">Crear Avatar desde vídeo</h2>

      {mensaje && <div className={`alert alert-${mensaje.tipo}`}>{mensaje.texto}</div>}

      <div className="mb-3">
        <SubidaVideo
          key={videoKey} // esta es la clave para que el elemento pueda cambiar de estado
          onChange={(archivo) => {
            setVideo(archivo);
            const valido = archivo?.type === "video/mp4" && archivo?.size <= 2 * 1024 * 1024 * 1024;
            setVideoValido(valido);
          }}
        />
      </div>

      <div className="mb-3">
        <label className="form-label fw-semibold">Nombre del avatar <span className="text-danger">*</span></label>
        <input
          type="text"
          className="form-control"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ej. Sara"
        />
      </div>

      <div className="mb-3">
        <label className="form-label fw-semibold">Género <span className="text-danger">*</span></label>
        <select
          className="form-select"
          value={genero}
          onChange={(e) => setGenero(e.target.value)}
        >
          <option value="">Selecciona género</option>
          <option value="male">Masculino</option>
          <option value="female">Femenino</option>
        </select>
      </div>

          <div className="d-flex justify-content-center mt-4">
            <button className="btn btn-success" onClick={handleCrearAvatar} disabled={!esFormularioValido}>
              {guardando ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Guardando...
                </>
              ) : (
                "Crear avatar"
              )}
            </button>
          </div>
    </div>
  );
};

export default CrearAvatar;