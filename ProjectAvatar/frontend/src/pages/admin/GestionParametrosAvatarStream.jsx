import { useState, useEffect } from "react";
import SelectorAvatar from "../../components/SelectorAvatar";
import SelectorVoz from "../../components/SelectorVoz";
import axios from "axios";

const GestionParametrosAvatarStream = () => {
  const [avatar, setAvatar] = useState(null);
  const [saludo, setSaludo] = useState("");
  const[datosCargados, setDatosCargados] = useState("");
  const [vozCargada, setVozCargada] = useState(false);
  
  const [instrucciones, setInstrucciones] = useState("");
  const [voiceId, setVoiceId] = useState("");
  const [idAvatarStreaming, setIdAvatarStreaming] = useState(null);
  const [mostrarSelector, setMostrarSelector] = useState(false); // ⬅️ empieza oculto

  //Para el combo de voces
  const [voces, setVoces] = useState([]);
  const [vozSeleccionada, setVozSeleccionada] = useState(null);

  const [alerta, setAlerta] = useState(null);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/api/did/voces/microsoft`)
      .then((res) => {
        setVoces(res.data);
        setVozCargada(true);
      })
      .catch((err) => console.error("Error cargando voces:", err));
  }, []);

  useEffect(() =>{
    if(!datosCargados){
        cargarDatos();
        setDatosCargados(true);
    }
  });

 /* useEffect(() => {
    if (alerta) {
      const timer = setTimeout(() => setAlerta(null), 5000); //5 segundos
      return () => clearTimeout(timer);
    }
  }, [alerta]);*/

    const cargarDatos = async () => {
        try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/did/cargarAvatarStream`);
        const datos = res.data;
        setIdAvatarStreaming(datos.id_avatar)
        setSaludo(datos.saludo);
        setInstrucciones(datos.instrucciones);
        setVozSeleccionada(datos.presentador.voice_id);
        //SelectorVoz.vozSeleccionada(datos.presentador.voice_id);
        setAvatar(datos.actor);
        console.log("voice_id del backend:", datos.presentador.voice_id);
        console.log("ids en voces:", voces.map(v => v.id));
        const existe = voces.some(v => v.id === datos.presentador.voice_id);
        console.log("¿El voice_id está en la lista de voces?:", existe);
        } catch (err) {
        console.error("Error al cargar los datos del avatar:", err);
        }
    };

  const handleGuardar = async () => {
  try {
    const formData = new FormData();
    formData.append("id_avatar_stream", idAvatarStreaming);
    formData.append("avatar_id", avatar.id);
    formData.append("voice_id", guion.voice_id || "");
    formData.append("saludo", saludo);
    formData.append("instrucciones", instrucciones);

    const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/did/guardarAvatarStream`, formData);

    console.log(response.data.message);
    setAlerta({ tipo: "success", mensaje: response.data.message });

  } catch (error) {
    console.error("Error generando vídeo:", error);
    setAlerta({ tipo: "danger", mensaje: "Hubo un error al generar el vídeo: "+error });
  }
};

  return (
    <div className="container py-4">
      <h2 className="mb-4">Configuración de Avatar Stream</h2>

        <div className="mb-3">
          <label className="form-label fw-semibold">ID Avatar</label>
          <input
            type="text"
            className="form-control"
            value={idAvatarStreaming}
            readOnly
          />
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold">Saludo</label>
          <textarea
            className="form-control"
            rows="2"
            value={saludo}
           ></textarea>
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold">Instrucciones</label>
          <textarea
            className="form-control"
            rows="3"
            value={instrucciones}
          ></textarea>
        </div>


        <div className="mb-3">
        <label className="form-label fw-semibold">Selecciona una voz <span className="text-danger">*</span></label>
        <select
            className="form-select"
            value={vozSeleccionada}
            onChange={(e) => setVozSeleccionada(e.target.value)}
        >
            <option value="">Elige una voz</option>
            {voces.map((voz) => (
            <option key={voz.id} value={voz.id}>
                {voz.label}
            </option>
            ))}
        </select>
        </div>



        {/* Resumen avatar + botón */}
        <div className="mb-4">
        {avatar ? (
            <div className="border rounded p-3 bg-light d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-3">
                <img
                src={avatar.thumbnail || avatar.thumbnail_url}
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
            <div className="d-flex justify-content-center">
            <button
                className="btn btn-primary"
                onClick={() => setMostrarSelector(true)}
            >
                Elegir Avatar
            </button>
            </div>
        )}
        {/* Selector completo (se abre aparte) */}
            {mostrarSelector && (
                <SelectorAvatar
                onSeleccionarAvatar={(avatarElegido) => {
                    setAvatar(avatarElegido);
                    setMostrarSelector(false);
                }}
                />
            )}

        </div>
               
               
            </div>
        );
}

export default GestionParametrosAvatarStream;