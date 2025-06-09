import { useEffect } from "react";
import { Tooltip } from "bootstrap";
import { useNavigate } from "react-router-dom";

const ConexionAvatarStream = () => {
  const navigate = useNavigate();

  useEffect(() => {
    import("./main.js");
    const script = document.createElement("script");
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return (
    <div className="container-fluid animar-entrada">
      
      <div
        className="row justify-content-center"
        style={{ maxWidth: "1400px" }}
        id="container"
      >
        <div className="d-flex col-12 col-md-6 mb-4">
        <button
          className="btn btn-outline-secondary"
          onClick={() => navigate("/")}
        >
          Volver
        </button>
      </div>
        {/* Encabezado + vídeo */}
        <div className="animar-entrada-izquierda col-12 col-md-6 mb-4">
          <div className="bg-primary text-white px-4 py-3 rounded shadow mb-3 d-flex justify-content-between align-items-center">
            <h5 id="previewName" className="mb-0 fw-bold"></h5>
            <span id="connectionLabel" className="text-end small">Conectando...</span>
          </div>

          <div className="text-center">
            <video
              id="videoElement"
              autoPlay
              loop
              className="rounded border shadow w-100"
              style={{ height: "auto" }}
            ></video>
          </div>
        </div>

        {/*Entrada, botón y respuestas */}
        <div className="animar-entrada-derecha col-12 col-md-6 mb-4">
          <div className="mb-3">
            <label htmlFor="textArea" className="form-label fw-semibold">Escribe tu mensaje</label>
            <textarea
              id="textArea"
              className="form-control"
              rows="4"
              placeholder="Escribe un mensaje para el asesor..."
              autoFocus
            ></textarea>
          </div>

          <div className="text-center mb-3">
            <button
              id="chatButton"
              className="btn btn-primary"
              data-bs-toggle="tooltip"
              data-bs-placement="top"
              title="agentManager.chat() → Comunica con el agente"
            >
              Enviar
            </button>
          </div>


          <div
            id="answers"
            className="border rounded p-3 bg-light"
            style={{ minHeight: "200px", maxHeight: "300px", overflowY: "auto" }}
          ></div>
        </div>
      </div>

      {/* Contenedor oculto para reconexión */}
      <div id="hidden" style={{ display: "none" }}>
        <h2 id="hidden_h2"></h2>
        <button
          id="reconnectButton"
          className="btn btn-warning mt-3"
          title="agentManager.reconnect() → Reconecta la sesión WebRTC previa"
        >
          Reconectar
        </button>
      </div>
    </div>
  );
};

export default ConexionAvatarStream;
