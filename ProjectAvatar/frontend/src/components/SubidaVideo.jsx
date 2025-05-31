import React, { useEffect, useRef, useState } from 'react';
import { Tooltip } from 'bootstrap';

const SubidaVideo = ({ onChange }) => {
  const [videoInfo, setVideoInfo] = useState(null);
  const tooltipRef = useRef(null);

  const handleArchivo = (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;

    if (archivo.type !== "video/mp4") {
      alert("El archivo debe estar en formato MP4.");
      return;
    }

    if (archivo.size > 2 * 1024 * 1024 * 1024) {
      alert("El archivo no puede superar los 2GB.");
      return;
    }

    const video = document.createElement("video");
    video.preload = "metadata";
    video.src = URL.createObjectURL(archivo);

    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      const duracion = video.duration;

      if (duracion < 30) {
        alert("El vídeo debe durar al menos 30 segundos.");
        return;
      }

      if (duracion > 300) {
        alert("El vídeo no puede superar los 5 minutos.");
        return;
      }

      // Destruir el tooltip al seleccionar vídeo
      if (tooltipRef.current) {
        tooltipRef.current.dispose();
        tooltipRef.current = null;
      }

      setVideoInfo(archivo);
      onChange(archivo);
    };
  };

  const eliminarVideo = () => {
    setVideoInfo(null);
    onChange(null);
    document.getElementById("videoInput").value = "";

    // Reactivar el tooltip al volver a mostrar el botón
    setTimeout(() => {
      const el = document.querySelector('[data-bs-toggle="tooltip"]');
      if (el) {
        tooltipRef.current = new Tooltip(el, {
          delay: { show: 0, hide: 100 },
        });
      }
    }, 0);
  };

  useEffect(() => {
    const el = document.querySelector('[data-bs-toggle="tooltip"]');
    if (el) {
      tooltipRef.current = new Tooltip(el, {
        delay: { show: 0, hide: 100 },
      });
    }

    return () => {
      if (tooltipRef.current) {
        tooltipRef.current.dispose();
        tooltipRef.current = null;
      }
    };
  }, []);

  return (
    <div className="d-flex justify-content-center mt-4">
      {!videoInfo ? (
        <label
          htmlFor="videoInput"
          className="btn btn-primary position-relative"
          data-bs-toggle="tooltip"
          data-bs-placement="top"
          data-bs-html="true"
          data-bs-title={`<div class='text-start'>
            <strong>📋 Instrucciones:</strong><br/>
            - Rostro visible y mirar a la cámara.<br/>
            - Entorno silencioso y bien iluminado.<br/>
            - Pausas entre frases, boca cerrada al final.<br/>
            - <strong>Duración:</strong> 30s - 5min.<br/>
            - <strong>Formato:</strong> MP4 (máx. 2GB).
          </div>`}
        >
          🎥 Adjuntar vídeo
        </label>
      ) : (
        <div className="border rounded p-2 bg-light d-flex justify-content-between align-items-center">
          <span className="text-truncate">{videoInfo.name}</span>
          <button
            type="button"
            className="btn btn-sm btn-outline-danger ms-3"
            onClick={eliminarVideo}
          >
            ❌ Quitar
          </button>
        </div>
      )}

      <input
        type="file"
        accept="video/mp4"
        id="videoInput"
        onChange={handleArchivo}
        hidden
      />
    </div>
  );
};

export default SubidaVideo;
