// Importación de React y hooks necesarios
import React, { useEffect, useState } from "react";

// Importación de herramientas de navegación entre rutas
import { useNavigate } from 'react-router-dom';

// Librería para llamadas HTTP al backend
import axios from "axios";

// Importación de componentes reutilizables personalizados
import SelectorAvatar from "../../components/SelectorAvatar";
import EditorGuion from "../../components/EditorGuion";
import SelectorFondo from "../../components/SelectorFondo";

const CreacionVideo = () => {
  const navigate = useNavigate(); // Permite redirigir al usuario a otras rutas

  // Estados principales del formulario
  const [avatar, setAvatar] = useState(null); // Avatar seleccionado
  const [mostrarSelector, setMostrarSelector] = useState(false); // Muestra u oculta el selector de avatar
  const [guion, setGuion] = useState(null); // Contenido del guion (texto o audio)
  const [fondo, setFondo] = useState(null); // Fondo de vídeo (color o imagen)
  const [titulo, setTitulo] = useState(""); // Título del vídeo
  const [descripcion, setDescripcion] = useState(""); // Descripción opcional
  const [alerta, setAlerta] = useState(null); // Mensaje de éxito o error
  const [generando, setGenerando] = useState(false);

  // Temporizador para ocultar la alerta después de 5 segundos
  useEffect(() => {
    if (alerta) {
      const timer = setTimeout(() => setAlerta(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [alerta]);

   // Verifica que el formulario tenga todos los campos requeridos antes de habilitar el botón
  const esFormularioValido =
    titulo &&
    avatar &&
    guion &&
    (
      (guion.type === "text" && guion.input?.trim() && guion.voice_id) ||
      (guion.type === "audio" && guion.blob)
    );

      // Envía todos los datos al backend para crear un nuevo vídeo
  const handleGenerarVideo = async () => {
    try {
      const formData = new FormData();
      setGenerando(true); // Mostrar spinner en botón

      // Campos comunes
      formData.append("avatar_id", avatar.id);
      formData.append("voice_id", guion.voice_id || "");
      formData.append("subtitles", guion.subtitles);
      formData.append("titulo", titulo.trim());
      formData.append("descripcion", descripcion.trim());

      // Según el tipo de entrada, se envía texto o archivo de audio
      if (guion.type === "text") {
        formData.append("type", "text");
        formData.append("input", guion.input);
      } else if (guion.type === "audio" && guion.blob) {
        formData.append("type", "audio");
        formData.append("audio", guion.blob, "audio.webm", { type: "audio/webm" });
      }

      // Fondo de vídeo: color o imagen
      if (fondo) {
        if (fondo.tipo === "color") {
          formData.append("background_type", "color");
          formData.append("background_color", fondo.valor);
        } else if (fondo.tipo === "imagen") {
          formData.append("background_type", "image");
          formData.append("background_image", fondo.valor, "fondo.jpg");
        }
      }

      // Llamada al backend para crear el vídeo
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/did/generarVideo`, formData);
      console.log(response.data.message);
      setAlerta({ tipo: "success", mensaje: response.data.message });

    } catch (error) {
      if(error.response){
        console.error("Error generando vídeo:", error.response.data.error);
        setAlerta({ tipo: "danger", mensaje: "Hubo un error al generar el vídeo: " + error.response.data.error});
      }else{
        console.error("Error generando vídeo:", error.message);
        setAlerta({ tipo: "danger", mensaje: "Hubo un error al generar el vídeo: " + error.message});
      }
    } finally{
      setGenerando(false); // Mostrar spinner en botón
    }
  };

    return (
    <div className="container animar-entrada d-flex justify-content-center">
      <div className="w-100" style={{ maxWidth: "720px" }}>
        {/* Cabecera con título y botón de volver */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-0">Generación de Vídeo</h2>
          <button onClick={() => navigate("/admin")} className="btn btn-outline-secondary">
            ← Volver
          </button>
        </div>
        {/* Muestra mensajes de éxito o error */}
        {alerta && (
          <div className={`alert alert-${alerta.tipo} mt-3`}>
            {alerta.mensaje}
          </div>
        )}
        <div className="mb-3">
          <label className="form-label fw-semibold">
            Título del vídeo <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            className="form-control"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            required
            placeholder="Introduce un título para el vídeo"
          />
        </div>
        <div className="mb-4">
          <label className="form-label fw-semibold">Descripción (opcional)</label>
          <textarea
            className="form-control"
            rows="3"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Breve descripción del vídeo..."
          />
        </div>
        <div className="mb-4">
          {avatar ? (
            <div className="border rounded p-3 bg-light d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-3">
                <img
                  src={avatar.thumbnail}
                  alt={avatar.name}
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "5px",
                    objectFit: "cover"
                  }}
                />
                <strong className="text-capitalize">{avatar.name}</strong>
                <input type="hidden" name="avatarId" value={avatar.id} />
              </div>
              <button
                className="btn btn-outline-primary btn-sm"
                onClick={() => setMostrarSelector(true)}
              >
                Cambiar Avatar
              </button>
            </div>
          ) : (
            <div className="text-center">
              <button
                className="btn btn-primary"
                onClick={() => setMostrarSelector(true)}
              >
                Elegir Avatar
              </button>
            </div>
          )}
        </div>
        {mostrarSelector && (
          <SelectorAvatar
            onSeleccionarAvatar={(avatarElegido) => {
              setAvatar(avatarElegido);
              setMostrarSelector(false);
            }}
          />
        )}
        {/* Componente para editar el guion (texto o audio) */}
        <EditorGuion onChangeGuion={setGuion} />


        {/* Componente para seleccionar fondo (color o imagen) */}
        <SelectorFondo onSeleccionarFondo={(data) => setFondo(data)} />

        {/* Botón de Generar Vídeo*/}
        <div className="d-flex justify-content-center mt-4">
          <button className="btn btn-success" onClick={handleGenerarVideo} disabled={!esFormularioValido || generando}>
            {generando ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                🎬 Generando Vídeo
              </>
            ) : (
              "🎬 Generar Vídeo"
            )}
          </button>
        </div>
       
      </div>
    </div>  
  );
};

export default CreacionVideo;
