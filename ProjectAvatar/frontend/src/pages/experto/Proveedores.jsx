// Componente completo para configurar dinámicamente una búsqueda de proveedores mediante criterios seleccionables
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';

// Lista completa de características disponibles para configurar
const caracteristicas = [
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

// Características preseleccionadas que aparecen activas inicialmente
const preseleccionadas = [
  "precio",
  "minutos_de_video_mes",
  "minutos_de_streaming_mes",
  "tiene_streaming",
  "numero_avatares",
  "clonado_de_voz",
  "licencia_comercial"
];

const BusquedaProveedor = () => {
  const navigate = useNavigate();
  const [disponibles, setDisponibles] = useState(caracteristicas.filter(c => !preseleccionadas.includes(c)));
  const [seleccionadas, setSeleccionadas] = useState(preseleccionadas);
  const [valores, setValores] = useState({});
  const [resultado, setResultado] = useState(null);
  const [mostrarPopup, setMostrarPopup] = useState(false);
  const [errores, setErrores] = useState([]); //Para las validaciones

  // Añade una característica al bloque seleccionado
  const moverCaracteristica = (item) => {
    if (!seleccionadas.includes(item)) {
      setDisponibles(disponibles.filter(c => c !== item));
      setSeleccionadas([...seleccionadas, item]);
    }
  };

  // Devuelve una característica al bloque disponible
  const devolverCaracteristica = (item) => {
    if (!disponibles.includes(item)) {
      setSeleccionadas(seleccionadas.filter(c => c !== item));
      setDisponibles([...disponibles, item]);
    }
  };

  // Mueve todas al bloque seleccionado
  const agregarTodas = () => {
    setSeleccionadas([...seleccionadas, ...disponibles]);
    setDisponibles([]);
  };

  // Devuelve todas al bloque disponible
  const eliminarTodas = () => {
    setDisponibles([...disponibles, ...seleccionadas]);
    setSeleccionadas([]);
  };

  const cerrarPopup = () => {
    setMostrarPopup(false);
  };

  // Envia la búsqueda al backend con los valores actuales
  const handleBuscar = async () => {
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
          const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/proveedores/mejorProveedor`, criterios);
          console.log("Resultado:", response.data);
          setResultado(response.data);
          setMostrarPopup(true);
        } catch (error) {
          console.error("Error en la búsqueda:", error);
        }
    }
  };

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
  <button
    onClick={() => esSeleccionada ? devolverCaracteristica(caracteristica) : moverCaracteristica(caracteristica)}
    className="btn btn-link btn-sm p-0 mt-1"
  >
    {esSeleccionada ? "Quitar de la búsqueda" : "Añadir a la búsqueda"}
  </button>
</div>
    );
  };

   return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
  <h2 className="h4 mb-0">Buscar Proveedor Óptimo</h2>
  <div>
    <button onClick={() => navigate('/proveedores/nuevo')} className="btn btn-outline-primary me-2">Editar Proveedores</button>
    <button onClick={() => navigate('/proveedores/pesos')} className="btn btn-outline-primary me-2">Editar Pesos</button>
 </div>
</div>

<div className="mb-4 d-flex gap-2">
  <button onClick={() => setSeleccionadas([...seleccionadas, ...disponibles]) || setDisponibles([])} className="btn btn-success">Agregar Todas las características</button>
  <button onClick={() => setDisponibles([...disponibles, ...seleccionadas]) || setSeleccionadas([])} className="btn btn-danger">Eliminar Todas las características</button>
</div>
      <div className="bg-white p-3 border rounded mb-4">
        <h5 className="mb-3">Características seleccionadas</h5>
        <div className="row g-3">
          {seleccionadas.map((c) => renderCampo(c, false, true))}
        </div>
      </div>
      
      <button onClick={handleBuscar} className="btn btn-primary mb-4">BUSCAR</button>

      <div className="bg-light p-3 border rounded mb-4">
        <h5 className="mb-3">Características disponibles</h5>
        <div className="row g-3">
          {disponibles.map((c) => renderCampo(c, true, false))}
        </div>
      </div>

      

      {mostrarPopup && resultado?.maximos?.length > 0 && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{maxHeight: '500px', overflowY: 'auto'}}>
              <div className="modal-header">
                <h5 className="modal-title">Resultado</h5>
                <button type="button" className="btn-close" onClick={cerrarPopup}></button>
              </div>
              <div className="modal-body">
                <p>
                  El Proveedor con más similitud a los parámetros introducidos es: <strong>{resultado.maximos[0].proveedor}</strong> del Plan <strong>{resultado.maximos[0].plan}</strong>, con un máximo de <strong>{resultado.maximos[0].similitud.toFixed(2)}</strong> puntos sobre <strong>{resultado.totalPesoConfigurado.toFixed(2)}</strong>.
                </p>
              </div>
              {resultado && resultado.resultados.length > 0 && (
                  <div className="mt-4 table-responsive">
                    <h5 className="text-center">Tabla de Resultados</h5>
                    <table className="table table-bordered table-striped mx-auto w-auto">
                      <thead>
                        <tr>
                          <th>Proveedor</th>
                          <th>Plan</th>
                          <th>Similitud</th>
                        </tr>
                      </thead>
                      <tbody>
                        {resultado.resultados.map((r) => (
                          <tr key={`${r.proveedor}-${r.plan}`}>
                            <td>{r.proveedor}</td>
                            <td>{r.plan}</td>
                            <td>{r.similitud.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              
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

export default BusquedaProveedor;
