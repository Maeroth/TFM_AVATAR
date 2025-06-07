import React, { useState, useEffect } from "react";
import GrabarAudio from "./GrabarAudio";
import SelectorVoz from "./SelectorVoz";

const EditorGuion = ({ onChangeGuion }) => {
  const [tipo, setTipo] = useState("text");
  const [texto, setTexto] = useState("");
  const [audioBlob, setAudioBlob] = useState(null);
  const [subtitles, setSubtitles] = useState(false);
  const [voiceId, setVoiceId] = useState("");
  const [audioPreviewURL, setAudioPreviewURL] = useState("");

  useEffect(() => {
    if (tipo === "text") {
      onChangeGuion({
        type: "text",
        input: texto,
        voice_id: voiceId,
        subtitles
      });
    } else if (tipo === "audio") {
      onChangeGuion({
        type: "audio",
        blob: audioBlob || null,
        subtitles
      });
    }
  }, [tipo, texto, audioBlob, subtitles, voiceId]);

  return (
    <div className="my-4">
      <label className="form-label fw-semibold">Tipo de entrada</label>
      <select
        className="form-select mb-3"
        value={tipo}
        onChange={(e) => setTipo(e.target.value)}
      >
        <option value="text">Texto</option>
        <option value="audio">Audio</option>
      </select>

      {tipo === "text" && (
        <div>
          <label className="form-label">Texto del guion <span className="text-danger">*</span></label>
          <textarea
            className="form-control"
            maxLength={40000} // ← Límite de caracteres
            rows={4}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Escribe aquí lo que debe decir el avatar... (máximo 40.000 caracteres)"
            
          />
          <small className="text-muted">
            {texto.length} / 40.000 caracteres
          </small>
          <SelectorVoz onSeleccionarVoz={(vozId) => setVoiceId(vozId)} />
        </div>
        
      )}
     
      {tipo === "audio" && (
        <GrabarAudio
          onAudioGrabado={(blob) => {
            setAudioBlob(blob);
            setAudioPreviewURL(URL.createObjectURL(blob));
          }}
          onAudioEliminado={() => {
            setAudioBlob(null);
            setAudioPreviewURL("");
          }}
        />
      )}

      {/* Subtítulos: visible en ambos casos : Al final no los usamos, parece que hay un problema con la API (documentado)

      <div className="form-check mt-3">
        <input
          className="form-check-input"
          type="checkbox"
          checked={subtitles}
          onChange={(e) => setSubtitles(e.target.checked)}
          id="subCheck"
        />
        <label className="form-check-label" htmlFor="subCheck">
          Generar subtítulos automáticamente
        </label>
      </div>
    */}
    </div>
  );
};

export default EditorGuion;
