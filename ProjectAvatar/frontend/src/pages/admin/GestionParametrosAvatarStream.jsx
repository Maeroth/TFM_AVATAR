// Importación de React con sus hooks principales
import { useState, useEffect } from "react";

// Importación del hook para navegar entre rutas
import { useNavigate } from 'react-router-dom';

// Componentes reutilizables: selector visual de avatares y voces
import SelectorAvatar from "../../components/SelectorAvatar";
import SelectorVoz from "../../components/SelectorVoz";

import { Tooltip } from "bootstrap"; //Tooltips de bootstrap para indicaciones

// Cliente HTTP para conectar con el backend
import axios from "axios";

const GestionParametrosAvatarStream = () => {
  const navigate = useNavigate(); // Permite redirigir al usuario a otra pantalla

  // Estado del avatar actual cargado
  const [avatar, setAvatar] = useState(null);

  // Texto del saludo que el avatar pronunciará al iniciar
  const [saludo, setSaludo] = useState("");

  // Control de carga inicial
  const [loading, setLoading] = useState(true);

  // Instrucciones específicas para el avatar (para el comportamiento del stream)
  const [instrucciones, setInstrucciones] = useState("");

  // ID único del avatar de streaming actual (usado para actualizarlo en backend)
  const [idAvatarStreaming, setIdAvatarStreaming] = useState(null);

  // Control para mostrar u ocultar el selector visual de avatar
  const [mostrarSelector, setMostrarSelector] = useState(false);

    // Lista completa de voces disponibles (obtenidas desde la API)
  const [voces, setVoces] = useState([]);

  // ID de la voz actualmente seleccionada para el avatar
  const [vozSeleccionada, setVozSeleccionada] = useState(null);

    // Bandera para asegurar que los datos iniciales se cargan una sola vez
  const [datosCargados, setDatosCargados] = useState("");

  // Indica si se está guardando para mostrar spinner
  const [guardando, setGuardando] = useState(false);

  // Alerta para mostrar mensajes de éxito o error
  const [alerta, setAlerta] = useState(null);

  //Importante: Esto no debe cargar hasta que se haya cargado la página, si no no mostrará los tooltips
  useEffect(() => {
    if(loading) return; //Esperamos a que termine de cargar el contenido
    // Inicializa los tooltips de Bootstrap sobre cualquier elemento que tenga el atributo data-bs-toggle="tooltip"
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');

    // Se crean los tooltips permitiendo HTML, alineación rápida, y ocultándose al perder el foco
    const tooltips = [...tooltipTriggerList].map((el) =>
      new Tooltip(el, {
        trigger: 'hover focus',  // evita que el tooltip se quede abierto tras clic
        delay: { show: 0, hide: 100 }, // muestra inmediato, oculta suavemente
        html: true // permite incluir <strong>, <br>, etc. dentro del tooltip
      })
    );

    // Limpieza de los tooltips al desmontar el componente (buena práctica para evitar fugas de memoria)
    return () => {
      tooltips.forEach(t => t.dispose());
    };
  }, [loading]);


  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/api/did/voces/microsoft`)
      .then((res) => {
        setVoces(res.data); // Guardamos las voces disponibles en el estado
      })
      .catch((err) => console.error("Error cargando voces:", err));
  }, []);

    useEffect(() => {
    if (!datosCargados) {
      cargarDatos();         // Llama a la función de carga solo si aún no se ha hecho
      setDatosCargados(true); // Evita que se repita innecesariamente
    }
  });

  const handleChange = (e) => {
    setVozSeleccionada(e.target.value);
    onSeleccionarVoz(e.target.value);
  };

  // Función que carga la configuración actual del avatar de streaming desde el backend
  const cargarDatos = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/did/cargarAvatarStream`);
      const datos = res.data;

      setIdAvatarStreaming(datos.id_avatar);
      setSaludo(datos.saludo);
      setInstrucciones(datos.instrucciones);
      setVozSeleccionada(datos.presentador.voice_id); // Carga la voz actual
      setAvatar(datos.actor); // Carga la información del avatar

    } catch (err) {
      console.error("Error al cargar los datos del avatar:", err);
    } finally {
      setLoading(false); // Desactiva la pantalla de carga
    }
  };

  const handleGuardar = async () => {
  try {
    setGuardando(true); // Activa spinner y desactiva botón

    // Buscamos el objeto completo de la voz seleccionada
    const vozCompleta = voces.find(v => v.id === vozSeleccionada);

    // Extraemos el idioma a partir del formato del label (entre paréntesis)
    const match = vozCompleta.label.match(/\((.*)\)$/);
    const idioma = match ? match[1] : "";

    // Construimos el objeto con todos los parámetros
    const datos = {
      id_avatar_stream: idAvatarStreaming,
      avatar_id: avatar.presenter_id || avatar.id,
      voice_id: vozSeleccionada,
      idioma: idioma,
      saludo,
      instrucciones
    };

    // Enviamos los datos al backend
    const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/did/guardarAvatarStream`, datos);

    console.log(response.data.message);
    setAlerta({ tipo: "success", mensaje: response.data.message }); // Mostramos éxito

    } catch (error) {
      // Captura y muestra error
      console.error("Error generando vídeo:", error);
      setAlerta({ tipo: "danger", mensaje: "Hubo un error al guardar los datos: " + error });
    } finally {
      setGuardando(false); // Restablece estado de guardado
    }
  };

useEffect(() => {
if (alerta) {
  const timer = setTimeout(() => setAlerta(null), 5000); // Se borra después de 5s
  return () => clearTimeout(timer); // Limpieza por si se lanza una nueva antes de que expire
}
}, [alerta]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
          <div
            className="spinner-border text-primary"
            role="status"
            style={{ width: "3rem", height: "3rem" }}
          ></div>
        </div>
      </div>
    );
  } else {
    return (
      <div className="container animar-entrada d-flex justify-content-center">
        <div className="w-100" style={{ maxWidth: "720px" }}>
          {/* Cabecera con título y botón de volver */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="mb-0">Configuración de Avatar Stream</h2>
            <button onClick={() => navigate("/admin")} className="btn btn-outline-secondary">
              ← Volver
            </button>
          </div>

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
      
          <div
            className="mb-3"
            data-bs-toggle="tooltip"
            data-bs-placement="right"
            data-bs-html="true"
            data-bs-title="<strong>Escribe el saludo</strong> que usará el avatar al iniciar el stream. El saludo saldrá por el chat."
          >
            <label className="form-label fw-semibold">Saludo</label>
            <textarea
              className="form-control"
              rows="2"
              value={saludo}
              onChange={(e) => setSaludo(e.target.value)}
            ></textarea>
          </div>
      
          <div
            className="mb-3"
            data-bs-toggle="tooltip"
            data-bs-placement="right"
            data-bs-html="true"
            data-bs-title={`Estas <strong>instrucciones serán las que acate el Avatar</strong>. Se utiliza el proveedor OpenAI. Por ejemplo: "Eres un asistente especializado en repsonder preguntas relacionadas con Educación, si te hacen una pregunta fuera de este contexto responderás con 'No puedo hablar de eso'."`}
          >
            <label className="form-label fw-semibold">Instrucciones</label>
            <textarea
              className="form-control"
              rows={6}
              maxLength={8000} // ← Límite de caracteres
              value={instrucciones}
              placeholder="Escribe aquí las instrucciones del agente... (máximo 8.000 caracteres)"
              onChange={(e) => setInstrucciones(e.target.value)}
            ></textarea>
            <small className="text-muted">
              {instrucciones.length} / 8.000 caracteres
            </small>
          </div>

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

            {/* Muestra el selector completo si está activado */}
            {mostrarSelector && (
              <SelectorAvatar
                onSeleccionarAvatar={(avatarElegido) => {
                  setAvatar(avatarElegido);
                  setMostrarSelector(false);
                }}
              />
            )}
          </div>
          {/* Muestra las voces disponibles*/}
          <div className="mt-3">
            <label className="form-label fw-semibold">Selecciona una voz <span className="text-danger">*</span></label>
            <select
              className="form-select"
              value={vozSeleccionada}
              onChange={handleChange}
            >
              <option value="">Elige una voz</option>
              {voces.map((voz) => (
                <option key={voz.id} value={voz.id}>
                  {voz.label}
                </option>
              ))}
            </select>
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
      </div>
    );
  };

}

export default GestionParametrosAvatarStream;

