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
  const [modoEdicion, setModoEdicion] = useState(false); //es para saber si estamos editando un proveedor o creando uno nuevo

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

    if(camposVacios.length === 0){ //Si no hay campos vacíos, mandamos la petición al servidor
      try{
        let response;

      if (modoEdicion && seleccionado) {
        // Modo edición: actualizamos proveedor existente
        response = await axios.put(`http://localhost:5000/api/proveedores/editar/${seleccionado}`, criterios);
      } else {
        // Modo creación: guardamos uno nuevo
        response = await axios.post("http://localhost:5000/api/proveedores/crear", criterios);
      }

      console.log("Resultado:", response.data);
      setResultado(response.data.message || "Guardado exitosamente");
      setMostrarPopup(true);
      setValores({}); //limpiamos los valores
      setSeleccionado(""); //también se deselecciona el proveedor que estuviera seleccionado (si estuviera)
      cargarProveedores(); // recarga el combo
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

  const handleEliminar = async () => {

    
    if (!seleccionado) return;

    const confirmar = window.confirm("¿Estás seguro de que deseas eliminar este proveedor?");
    if (!confirmar) return;

    try {
      let response;
      response = await axios.delete(`http://localhost:5000/api/proveedores/borrar/${seleccionado}`);
      setResultado(response.data.message || "Borrado exitosamente");
      setMostrarPopup(true);
      setValores({}); //limpiamos los valores
      setSeleccionado(""); //también se deselecciona el proveedor que estuviera seleccionado (si estuviera)
      setModoEdicion(false); //se vuelve a la creación de proveedores
      cargarProveedores(); // <--- recarga el combo
    } catch (error) {
          console.error("Error en el borrado:", error);
          if (error.response && error.response.status === 400 && error.response.data?.error) {
            setResultado(error.response.data.error);
          } else {
            setResultado("Error al borrar proveedor: " + (error.response?.data?.error || "Error desconocido"));
          }
          setMostrarPopup(true);
        }
  };

  const cargarProveedores = () => {
      axios.get("http://localhost:5000/api/proveedores/comboProveedores")
      .then(res => setListaProveedores(res.data))
      .catch(err => console.error("Error al cargar proveedores:", err));
  }

  useEffect(() => {
    cargarProveedores();
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
     <button className="btn btn-outline-secondary me-2" onClick={() => navigate('/proveedores')}>
    ← Volver
  </button>
  
</div>


<div className="mb-3">
  <label className="form-label">Seleccionar proveedor</label>
  <select
    className="form-select"
    value={seleccionado}
    onChange={(e) => {
      setSeleccionado(e.target.value)
      setModoEdicion(true); //editando un proveedor existente
    }
  }
  >
    <option value="">Seleccione un proveedor...</option>
    {listaProveedores.map(p => (
      <option key={p.id} value={p.id}>{p.nombre}</option>
    ))}
  </select>
</div>
<div className="d-flex justify-content-center">
    {modoEdicion ? (
      <span className="badge bg-warning text-dark mb-3">Modo edición de proveedor</span>
    ) : (
      <span className="badge bg-success mb-3">Modo creación de nuevo proveedor</span>
    )}
  </div>

  <button
    className="btn btn-outline-primary me-2"
    onClick={() => {
      setValores({});
      setErrores([]);
      setSeleccionado(""); // limpia el selector
      setModoEdicion(false); // activa modo creación
    }}
  >
    Nuevo Proveedor
  </button>

<div className="mb-4 d-flex gap-2 ">
 </div>

      <div className="bg-white p-3 border rounded mb-4">
        <h5 className="mb-3">Características seleccionadas</h5>
        <div className="row g-3">
          {seleccionadas.map((c) => renderCampo(c, false, true))}
        </div>
      </div>

      <div className="d-flex mb-4 gap-2 justify-content-center">
        <button onClick={handleGuardar} className="btn btn-primary">GUARDAR</button>
        {seleccionado && (
          <button className="btn btn-danger" onClick={handleEliminar}>
            Eliminar proveedor
          </button>
        )}
      </div>
      

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
