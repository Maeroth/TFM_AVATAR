import React, { useState, useRef } from "react";

const GrabarAudio = ({ onAudioGrabado, onAudioEliminado }) => {
  const [grabando, setGrabando] = useState(false);
  const [blob, setBlob] = useState(null);
  const [previewURL, setPreviewURL] = useState(null);
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);

  const comenzarGrabacion = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder.current = new MediaRecorder(stream);
    audioChunks.current = [];

    mediaRecorder.current.ondataavailable = (e) => {
      audioChunks.current.push(e.data);
    };

    mediaRecorder.current.onstop = () => {
      const nuevoBlob = new Blob(audioChunks.current, { type: "audio/webm" });
      const url = URL.createObjectURL(nuevoBlob);
      setBlob(nuevoBlob);
      setPreviewURL(url);
      onAudioGrabado(nuevoBlob); // envía solo el blob al padre
    };

    mediaRecorder.current.start();
    setGrabando(true);
  };

  const detenerGrabacion = () => {
    mediaRecorder.current.stop();
    setGrabando(false);
  };

  const eliminarAudio = () => {
    setBlob(null);
    setPreviewURL(null);
    onAudioEliminado();
  };

  return (
    <div className="my-3">
      <h6>Entrada de voz<span className="text-danger"> *</span></h6>

      {!blob && !grabando && (
        <button className="btn btn-primary" onClick={comenzarGrabacion}>
          🎙️ Grabar 
        </button>
        
      )}

      {grabando && (
        <button className="btn btn-danger" onClick={detenerGrabacion}>
          ⏹️ Detener grabación
        </button>
      )}

      {blob && previewURL && !grabando && (
        <div className="mt-3">
          <audio src={previewURL} controls />
          <div className="mt-2">
            <button className="btn btn-outline-danger btn-sm" onClick={eliminarAudio}>
              🗑️ Eliminar audio
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GrabarAudio;