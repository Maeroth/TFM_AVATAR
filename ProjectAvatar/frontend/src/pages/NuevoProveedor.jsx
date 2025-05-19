// Componente completo para configurar dinámicamente una búsqueda de proveedores mediante criterios seleccionables
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';

// Lista completa de características disponibles para configurar
const caracteristicas = [
  "proveedor",
  "plan",
  "precio",
  "minutos_de_video_mes",
  "minutos_de_streaming_mes",
  "tiene_streaming",
  "sdk_de_streaming",
  "traduccion_automatica",
  "resolucion_del_video",
  "duracion_maxima_de_video",
  "sincronizacion_labial",
  "numero_avatares",
  "avatares_personales",
  "numero_de_voces",
  "expresiones_del_avatar",
  "clonado_de_voz",
  "idiomas_soportados",
  "entrada_alternativa",
  "licencia_comercial",
  "calidad_api",
  "velocidad_de_generacion"
];

const NuevoProveedor = () => {
  const navigate = useNavigate();
  const [seleccionadas, setSeleccionadas] = useState(caracteristicas);
  const [valores, setValores] = useState({});
  const [resultado, setResultado] = useState(null);
  const [mostrarPopup, setMostrarPopup] = useState(false);
  const [errores, setErrores] = useState([]); //Para las validaciones
  const [listaProveedores, setListaProveedores] = useState([]);
  const [seleccionado, setSeleccionado] = useState("");

   const cerrarPopup = () => {
    setMostrarPopup(false);
  };

  // Envia la búsqueda al backend con los valores actuales
  const handleGuardar = async () => {
    const criterios = {};
    const camposVacios = [];

    seleccionadas.forEach((c) => {
      if (valores[c] !== undefined && valores[c] !== "") {
        criterios[c] = valores[c];
      }else{
        camposVacios.push(c);
      }
  
    });

    setErrores(camposVacios); //añadimos los campos vacíos

    if(camposVacios.length == 0){ //Si no hay campos vacíos, mandamos la petición al servidor
        try {
          const response = await axios.post("http://localhost:5000/api/proveedores/crear", criterios);
          console.log("Resultado:", response.data);
          setResultado(response.data.message);
          setMostrarPopup(true);
        } catch (error) {
          console.error("Error en el guardado:", error);
          if (error.response && error.response.status === 400 && error.response.data?.error) {
            setResultado(error.response.data.error);
          } else {
            setResultado("Error al guardar proveedor: " + (error.response?.data?.error || "Error desconocido"));
          }
          setMostrarPopup(true);
        }
    }
  };

  useEffect(() => {
    axios.get("http://localhost:5000/api/proveedores/comboProveedores")
      .then(res => setListaProveedores(res.data))
      .catch(err => console.error("Error al cargar proveedores:", err));
  }, []);

  useEffect(() => {
  if (!seleccionado) return; // Si no hay nada seleccionado, no hacemos nada

  axios.get(`http://localhost:5000/api/proveedores/detalle/${seleccionado}`)
    .then(res => setValores(res.data)) // Llenamos el formulario con los datos recibidos
    .catch(err => console.error("Error al cargar detalles del proveedor:", err));
  }, [seleccionado]);

  // Renderiza cada campo con input o select según el tipo de dato
  const renderCampo = (caracteristica, transparente, esSeleccionada) => {
    const label = caracteristica.replace(/_/g, ' ');
    const baseClass = "p-4 rounded border mb-2 transition";
    const className = transparente ? `${baseClass} opacity-50 bg-gray-100` : `${baseClass} bg-white`;

    const renderInput = () => {
      switch (caracteristica) {
        case "tiene_streaming":
        case "sdk_de_streaming":
        case "traduccion_automatica":
        case "licencia_comercial":
        case "clonado_de_voz":
        case "expresiones_del_avatar":
          return (
            <select 
              value={valores[caracteristica] ?? ""}
              onChange={(e) => setValores({ ...valores, [caracteristica]: e.target.value })}
              className={`form-select ${errores.includes(caracteristica) ? 'is-invalid' : ''}`}>
              <option value="">Seleccione una opción</option>
              <option value="1">Sí</option>
              <option value="0">No</option>
            </select>
          );
        case "resolucion_del_video":
          return (
            <select 
              value={valores[caracteristica] ?? ""}
              onChange={(e) => setValores({ ...valores, [caracteristica]: e.target.value })}
              className={`form-select ${errores.includes(caracteristica) ? 'is-invalid' : ''}`}>
              <option value="">Seleccione resolución</option>
              <option value="0">720p</option>
              <option value="1">1080p</option>
              <option value="2">4k</option>
            </select>
          );
        case "sincronizacion_labial":
        case "calidad_api":
        case "velocidad_de_generacion":
          return (
            <select 
              value={valores[caracteristica] ?? ""}
              onChange={(e) => setValores({ ...valores, [caracteristica]: e.target.value })}
              className={`form-select ${errores.includes(caracteristica) ? 'is-invalid' : ''}`}>
              <option value="">Seleccione calidad</option>
              <option value="0">BAJA</option>
              <option value="1">NORMAL</option>
              <option value="2">ALTA</option>
            </select>
          );
        case "entrada_alternativa":
          return (
            <select 
              value={valores[caracteristica] ?? ""}
              onChange={(e) => setValores({ ...valores, [caracteristica]: e.target.value })}
              className={`form-select ${errores.includes(caracteristica) ? 'is-invalid' : ''}`}>
              <option value="">Seleccione tipo</option>
              <option value="0">Sólo Texto</option>
              <option value="1">Texto y Audio</option>
            </select>
          );
        case "proveedor":
          return (
            <input type="string" className={`form-select ${errores.includes(caracteristica) ? 'is-invalid' : ''}`} placeholder={caracteristica.replace(/_/g, ' ')}
             value={valores[caracteristica] || ""}
             onChange={(e) => setValores({ ...valores, [caracteristica]: e.target.value })}
            />
          );  
        case "plan":
          return (
            <input type="string" className={`form-select ${errores.includes(caracteristica) ? 'is-invalid' : ''}`} placeholder={caracteristica.replace(/_/g, ' ')}
             value={valores[caracteristica] || ""}
             onChange={(e) => setValores({ ...valores, [caracteristica]: e.target.value })}
            />
        );  
        default:
          return (
            <input type="number" className={`form-select ${errores.includes(caracteristica) ? 'is-invalid' : ''}`} placeholder={caracteristica.replace(/_/g, ' ')}
             value={valores[caracteristica] ?? ""}
             onChange={(e) => setValores({ ...valores, [caracteristica]: e.target.value })}
            />
          );
      }
    };

    return (
      <div key={caracteristica} className={`col-md-4 ${transparente ? 'opacity-50' : ''} mb-3`}>
  <label className="form-label text-capitalize">{label}</label>
  {renderInput()}
</div>
    );
  };

   return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
  <h2 className="h4 mb-0">Edición de Proveedores</h2>
  <div>
    <button onClick={() => navigate('/proveedores/nuevo')} className="btn btn-outline-primary me-2">Añadir Proveedor</button>
    <button onClick={() => navigate('/proveedores/editar')} className="btn btn-outline-secondary">Editar Proveedor</button>
 </div>
</div>


<div className="mb-3">
  <label className="form-label">Seleccionar proveedor</label>
  <select
    className="form-select"
    value={seleccionado}
    onChange={(e) => setSeleccionado(e.target.value)}
  >
    <option value="">Seleccione un proveedor...</option>
    {listaProveedores.map(p => (
      <option key={p.id} value={p.id}>{p.nombre}</option>
    ))}
  </select>
</div>



<div className="mb-4 d-flex gap-2">
 </div>

      <div className="bg-white p-3 border rounded mb-4">
        <h5 className="mb-3">Características seleccionadas</h5>
        <div className="row g-3">
          {seleccionadas.map((c) => renderCampo(c, false, true))}
        </div>
      </div>

      <button onClick={handleGuardar} className="btn btn-primary mb-4">GUARDAR</button>

      

      {mostrarPopup && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{maxHeight: '500px', overflowY: 'auto'}}>
              <div className="modal-header">
                <h5 className="modal-title">Resultado</h5>
                <button type="button" className="btn-close" onClick={cerrarPopup}></button>
              </div>
              <div className="modal-body">
                <p>
                  {resultado}
                </p>
              </div>
            
              
              <div className="modal-footer">
                <button type="button" className="btn btn-danger" onClick={cerrarPopup}>Cerrar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      
    </div>
  );
};

export default NuevoProveedor;
