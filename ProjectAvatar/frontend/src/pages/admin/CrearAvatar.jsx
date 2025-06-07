// Importación de React y hooks de estado y efecto
import React, { useState, useEffect } from "react";

// Importación de axios para llamadas HTTP al backend
import axios from "axios";

// Componente reutilizable para subir un archivo de vídeo
import SubidaVideo from "../../components/SubidaVideo";

// Componente principal para permitir la creación de un avatar personalizado a partir de un vídeo
const CrearAvatar = () => {
  // Estados del formulario
  const [nombre, setNombre] = useState("");           // Nombre del avatar introducido por el usuario
  const [genero, setGenero] = useState("");           // Género seleccionado del avatar
  const [video, setVideo] = useState(null);           // Archivo de vídeo cargado
  const [videoValido, setVideoValido] = useState(false); // Valida si el vídeo cumple requisitos
  const [mensaje, setMensaje] = useState(null);       // Mensaje de feedback (error o éxito)
  const [guardando, setGuardando] = useState(false);  // Indica si se está guardando (para mostrar spinner)

  // Clave usada para forzar el reinicio del componente SubidaVideo cuando se reinicia el formulario
  const [videoKey, setVideoKey] = useState(Date.now());

  // Validación del formulario: se activa el botón solo si todos los campos son válidos
  const esFormularioValido =
    nombre.trim().length > 0 &&
    genero &&
    videoValido;

  // Función que se ejecuta al pulsar el botón para crear el avatar
  const handleCrearAvatar = async () => {
    // Validación rápida adicional
    if (!nombre.trim() || !genero || !video) {
      setMensaje({ tipo: "danger", texto: "Por favor, completa todos los campos." });
      return;
    }

    // Preparación del formulario multipart/form-data para el backend
    const formData = new FormData();
    formData.append("nombre", nombre.trim());
    formData.append("genero", genero);
    formData.append("video", video, "avatar.mp4");

    try {
      setGuardando(true); // Mostramos spinner mientras se guarda

      // Llamada POST al backend
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/did/crearAvatar`, formData);

      // Mensaje de éxito y limpieza de formulario
      setMensaje({ tipo: "success", texto: res.data.message || "Avatar creado correctamente." });
      setNombre(""); setGenero(""); setVideo(null); setVideoKey(Date.now()); // Reiniciamos el estado

    } catch (err) {
      // Captura y muestra error en la consola y en pantalla
      console.error(err.response.data.message);
      setMensaje({ tipo: "danger", texto: "Error al crear el avatar: " + err.response.data.message });
    } finally {
      setGuardando(false); // Ocultamos spinner
    }
  };

  return (
    <div className="container py-4">
      {/* Título de la página */}
      <h2 className="mb-4">Crear Avatar desde vídeo</h2>

      {/* Mensaje de éxito o error si existe */}
      {mensaje && <div className={`alert alert-${mensaje.tipo}`}>{mensaje.texto}</div>}

      {/* Componente de subida de vídeo */}
      <div className="mb-3">
        <SubidaVideo
          key={videoKey} // Clave que reinicia el componente cuando se reinicia el formulario
          onChange={(archivo) => {
            setVideo(archivo);
            // Validación del archivo: tipo MP4 y tamaño < 2GB
            const valido = archivo?.type === "video/mp4" && archivo?.size <= 2 * 1024 * 1024 * 1024;
            setVideoValido(valido);
          }}
        />
      </div>

      {/* Campo de entrada para el nombre del avatar */}
      <div className="mb-3">
        <label className="form-label fw-semibold">
          Nombre del avatar <span className="text-danger">*</span>
        </label>
        <input
          type="text"
          className="form-control"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ej. Sara"
        />
      </div>

      {/* Selector de género */}
      <div className="mb-3">
        <label className="form-label fw-semibold">
          Género <span className="text-danger">*</span>
        </label>
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

      {/* Botón para enviar el formulario */}
      <div className="d-flex justify-content-center mt-4">
        <button
          className="btn btn-success"
          onClick={handleCrearAvatar}
          disabled={!esFormularioValido}
        >
          {guardando ? (
            <>
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              ></span>
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
