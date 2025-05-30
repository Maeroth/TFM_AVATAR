import { useEffect } from "react";

const ConexionAvatarStream = () => {
 
  useEffect(() => {
    import("./main.js");
    const script = document.createElement("script");
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return (
    <>
      <div id="container">
        <div className="header">
          <span id="previewName">Tu agente</span>
          <span id="connectionLabel">Connectando..</span>
        </div>

        <div>
          <video id="videoElement" autoPlay loop></video>
        </div>

        <div className="inputsDiv">
          <textarea
            id="textArea"
            placeholder="Escribe un mensaje"
            autoFocus
          ></textarea>
        </div>

         <div>
          <buttonG
            id="chatButton"
            title="agentManager.chat() -> Communicate with your Agent (D-ID LLM)"
          >
            Enviar
          </buttonG>
        </div>

        

        <div id="answers"></div>
      </div>

      <div id="hidden" style={{ display: "none" }}>
        <h2 id="hidden_h2"></h2>
        <button
          id="reconnectButton"
          title="agentManager.reconnect() -> Reconnects the previous WebRTC session"
        >
          Reconectar
        </button>
      </div>
    </>
  );
}

export default ConexionAvatarStream;
