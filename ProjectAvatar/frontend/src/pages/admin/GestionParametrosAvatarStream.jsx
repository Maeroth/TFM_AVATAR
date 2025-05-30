import { useState, useEffect } from "react";
import SelectorAvatar from "../../components/SelectorAvatar";
import SelectorVoz from "../../components/SelectorVoz";
import axios from "axios";

const GestionParametrosAvatarStream = () => {
  const [avatar, setAvatar] = useState(null);
  const [saludo, setSaludo] = useState("");

  const [loading, setLoading] = useState(true);
  
  const [instrucciones, setInstrucciones] = useState("");
  const [idAvatarStreaming, setIdAvatarStreaming] = useState(null);
  const [mostrarSelector, setMostrarSelector] = useState(false); // ⬅️ empieza oculto

  //Para el combo de voces
  const [voces, setVoces] = useState([]);
  const [vozSeleccionada, setVozSeleccionada] = useState(null);
  //Estados generales
  const[datosCargados, setDatosCargados] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [alerta, setAlerta] = useState(null);


  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/api/did/voces/microsoft`)
      .then((res) => {
        setVoces(res.data);
         })
      .catch((err) => console.error("Error cargando voces:", err));
  }, []);

  useEffect(() =>{
    if(!datosCargados){
        cargarDatos();
        setDatosCargados(true);
    }
  });

    const cargarDatos = async () => {
        try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/did/cargarAvatarStream`);
        const datos = res.data;
        setIdAvatarStreaming(datos.id_avatar)
        setSaludo(datos.saludo);
        setInstrucciones(datos.instrucciones);
        setVozSeleccionada(datos.presentador.voice_id);
        setAvatar(datos.actor);
        } catch (err) {
        console.error("Error al cargar los datos del avatar:", err);
        }finally {
          setLoading(false); // Oculta el loading cuando termina
        }
    };

  const handleGuardar = async () => {
  try {
    setGuardando(true); // Mostrar spinner en botón
   const datos = {
      id_avatar_stream: idAvatarStreaming,
      avatar_id: avatar.presenter_id || avatar.id,
      voice_id: vozSeleccionada,
      saludo,
      instrucciones
    };

    const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/did/guardarAvatarStream`, datos);

    console.log(response.data.message);
    setAlerta({ tipo: "success", mensaje: response.data.message });

  } catch (error) {
    console.error("Error generando vídeo:", error);
    setAlerta({ tipo: "danger", mensaje: "Hubo un error al guardar los datos: "+error });
  }finally{
     setGuardando(false); // Oculta spinner cuando termina
  }
};

useEffect(() => {
  if (alerta) {
    const timer = setTimeout(() => setAlerta(null), 5000); // Oculta después de 5s
    return () => clearTimeout(timer); // Limpieza por si cambia antes
  }
}, [alerta]);

//Pantalla de Loading
if (loading) {
    return (
          <div className="d-flex justify-content-center align-items-center vh-100">
            <div className="text-center">
              <div className="spinner-border text-primary" role="status" style={{ width: "3rem", height: "3rem" }}></div>
            </div>
          </div>
    );
  }else{
    //Pantalla
    return (
      <div className="container py-4">
        <h2 className="mb-4">Configuración de Avatar Stream</h2>
          {alerta && (
            <div className={`alert alert-${alerta.tipo} mt-3`} role="alert">
              {alerta.mensaje}
            </div>
          )}
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
              onChange={(e)=>setSaludo(e.target.value)}
            ></textarea>
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Instrucciones</label>
            <textarea
              className="form-control"
              rows="3"
              value={instrucciones}
              onChange={(e)=>setInstrucciones(e.target.value)}
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
          <div className="d-flex justify-content-center mt-4">
            <button className="btn btn-success" onClick={handleGuardar} disabled={guardando}>
              {guardando ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Guardando...
                </>
              ) : (
                "💾 Guardar cambios"
              )}
            </button>
          </div>
                
              </div>

              
              
          );
        }
  

}


export default GestionParametrosAvatarStream;