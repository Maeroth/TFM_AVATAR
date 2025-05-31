import React, { useEffect, useState } from "react";
import axios from "axios";
import SelectorAvatar from "../../components/SelectorAvatar";
import EditorGuion from "../../components/EditorGuion";
import SelectorFondo from "../../components/SelectorFondo";

const CreacionVideo = () => {
  const [avatar, setAvatar] = useState(null);
  const [mostrarSelector, setMostrarSelector] = useState(false); // ⬅️ empieza oculto
  const [guion, setGuion] = useState(null);
  const [fondo, setFondo] = useState(null);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [alerta, setAlerta] = useState(null);
  
useEffect(() => {
  if (alerta) {
    const timer = setTimeout(() => setAlerta(null), 5000); //5 segundos
    return () => clearTimeout(timer);
  }
}, [alerta]);

const esFormularioValido =
  titulo &&
  avatar &&
  guion &&
  (
    (guion.type === "text" && guion.input?.trim() && guion.voice_id) ||
    (guion.type === "audio" && guion.blob)
  );

const handleGenerarVideo = async () => {
  try {
    const formData = new FormData();

    formData.append("avatar_id", avatar.id);
    formData.append("voice_id", guion.voice_id || "");
    formData.append("subtitles", guion.subtitles);
    formData.append("titulo", titulo.trim());
    formData.append("descripcion", descripcion.trim());

    if (guion.type === "text") {
      formData.append("type", "text");
      formData.append("input", guion.input);
    } else if (guion.type === "audio" && guion.blob) {
      formData.append("type", "audio");
      formData.append("audio", guion.blob, "audio.webm", {type: "audio/webm"});
    }

    if (fondo) {
      if (fondo.tipo === "color") {
        formData.append("background_type", "color");
        formData.append("background_color", fondo.valor);
      } else if (fondo.tipo === "imagen") {
        formData.append("background_type", "image");
        formData.append("background_image", fondo.valor, "fondo.jpg");
      }
    }

    const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/did/generarVideo`, formData);

    console.log(response.data.message);
    setAlerta({ tipo: "success", mensaje: response.data.message });

  } catch (error) {
    console.error("Error generando vídeo:", error.response.data.error);
    setAlerta({ tipo: "danger", mensaje: "Hubo un error al generar el vídeo: "+error.response.data.error });
  }
};
  

  return (
   <div className="container animar-entrada d-flex justify-content-center">
  <div className="w-100" style={{ maxWidth: "720px" }}>
    <h2 className="mb-4 text-center">Generación de Vídeo</h2>

    {alerta && (
      <div className={`alert alert-${alerta.tipo} mt-3`}>
        {alerta.mensaje}
      </div>
    )}

    {/* Campo: Título */}
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

    {/* Campo: Descripción */}
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

    {/* Selector de Avatar */}
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

    <EditorGuion onChangeGuion={setGuion} />
    <SelectorFondo onSeleccionarFondo={(data) => setFondo(data)} />

    <div className="text-center">
      <button
        className="btn btn-success mt-4"
        onClick={handleGenerarVideo}
        disabled={!esFormularioValido}
      >
        🎬 Generar Vídeo
      </button>
    </div>
  </div>
</div>  
  );
};

export default CreacionVideo;
