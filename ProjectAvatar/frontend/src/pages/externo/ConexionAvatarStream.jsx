import { useEffect } from "react";

const ConexionAvatarStream = () => {
 
  useEffect(() => {
    import("./main.js");
    const script = document.createElement("script");
    //script.src = "./webSpeechAPI.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return (
    <>
      <div id="container">
        <div className="header">
          <span id="previewName">Your Agent</span>
          <span id="connectionLabel">Connecting..</span>
        </div>

        <div>
          <video id="videoElement" autoPlay loop></video>
        </div>

        <div>
          <button
            id="chatButton"
            title="agentManager.chat() -> Communicate with your Agent (D-ID LLM)"
          >
            Chat
          </button>
          <button
            id="speakButton"
            title="agentManager.speak() -> Streaming API (Bring your own LLM)"
          >
            Speak
          </button>
        </div>

        <div className="inputsDiv">
          <textarea
            id="textArea"
            placeholder="Type a message"
            autoFocus
          ></textarea>
        </div>

        <div style={{ display: "flex" }}>
          <select
            id="langSelect"
            title="Speech to Text - Language Selection"
            defaultValue="es_ES"
          >
            <option value="en_US" disabled>
              TTS Language
            </option>
            <option value="en_US">English</option>
            <option value="es_ES">Spanish</option>
            <option value="fr_FR">French</option>
            <option value="it_IT">Italian</option>
            <option value="de_DE">German</option>
            <option value="he_IL">Hebrew</option>
            <option value="ru_RU">Russian</option>
          </select>
          <button
            id="speechButton"
            title="Speech to Text - Web Speech API (MDN)"
          >
            🎤
          </button>
        </div>

        <div id="answers"></div>
      </div>

      <div id="hidden" style={{ display: "none" }}>
        <h2 id="hidden_h2"></h2>
        <button
          id="reconnectButton"
          title="agentManager.reconnect() -> Reconnects the previous WebRTC session"
        >
          Reconnect
        </button>
      </div>
    </>
  );
}

export default ConexionAvatarStream;
