// Importa React y useState para manejar estados del componente
import React, { useState } from "react";

// Importa axios para hacer peticiones HTTP al backend
import axios from "axios";

// Importa useNavigate para redireccionar a otras páginas dentro de la app
import { useNavigate } from 'react-router-dom';

// Lista de todas las características posibles que pueden usarse como filtros en la búsqueda de proveedores
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

// Características que se seleccionan por defecto al cargar la pantalla 
const preseleccionadas = [
  "precio",
  "minutos_de_video_mes",
  "minutos_de_streaming_mes",
  "tiene_streaming",
  "numero_avatares",
  "clonado_de_voz",
  "licencia_comercial"
];

// Componente principal que representa la página de búsqueda de proveedor
const BusquedaProveedor = () => {
  const navigate = useNavigate(); // Para redirigir a otras rutas (por ejemplo, edición de proveedores)

  // Estado que contiene las características disponibles para añadir a la búsqueda
  const [disponibles, setDisponibles] = useState(caracteristicas.filter(c => !preseleccionadas.includes(c)));

  // Estado que contiene las características actualmente seleccionadas para la búsqueda
  const [seleccionadas, setSeleccionadas] = useState(preseleccionadas);

  // Estado que guarda los valores introducidos por el usuario para cada característica
  const [valores, setValores] = useState({});

  // Resultado de la búsqueda, devuelto por el backend tras pulsar "Buscar"
  const [resultado, setResultado] = useState(null);

  // Estado para mostrar u ocultar el modal con los resultados
  const [mostrarPopup, setMostrarPopup] = useState(false);

  // Lista de campos que están vacíos (para mostrar errores de validación visual)
  const [errores, setErrores] = useState([]);

  // Añade una característica al conjunto de seleccionadas y la elimina de las disponibles
  const moverCaracteristica = (item) => {
    if (!seleccionadas.includes(item)) {
      setDisponibles(disponibles.filter(c => c !== item));
      setSeleccionadas([...seleccionadas, item]);
    }
  };

  // Quita una característica del conjunto de seleccionadas y la devuelve a las disponibles
  const devolverCaracteristica = (item) => {
    if (!disponibles.includes(item)) {
      setSeleccionadas(seleccionadas.filter(c => c !== item));
      setDisponibles([...disponibles, item]);
    }
  };

  // Mueve todas las características disponibles al grupo de seleccionadas
  const agregarTodas = () => {
    setSeleccionadas([...seleccionadas, ...disponibles]);
    setDisponibles([]);
  };

  // Quita todas las características seleccionadas y las devuelve al grupo de disponibles
  const eliminarTodas = () => {
    setDisponibles([...disponibles, ...seleccionadas]);
    setSeleccionadas([]);
  };

  // Cierra el modal de resultados
  const cerrarPopup = () => {
    setMostrarPopup(false);
  };

  // Función principal que se ejecuta cuando el usuario pulsa el botón "BUSCAR"
  // Valida que todos los campos seleccionados tengan valores, y si es así, lanza la petición al backend
  const handleBuscar = async () => {
    const criterios = {};         // Objeto que se enviará al backend con los valores de búsqueda
    const camposVacios = [];      // Lista para detectar si algún campo obligatorio está vacío

    // Recorre todas las características seleccionadas
    seleccionadas.forEach((c) => {
      // Si tiene un valor asignado, se añade al objeto de criterios
      if (valores[c] !== undefined && valores[c] !== "") {
        criterios[c] = valores[c];
      } else {
        // Si está vacío, lo marcamos como error para mostrar validación
        camposVacios.push(c);
      }
    });

    // Guardamos los campos con error para mostrar en rojo (con clase is-invalid)
    setErrores(camposVacios);

    // Si no hay errores de validación, realizamos la llamada al backend
    if (camposVacios.length === 0) {
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/proveedores/mejorProveedor`,
          criterios
        );
        console.log("Resultado:", response.data);
        setResultado(response.data);   // Guardamos el resultado
        setMostrarPopup(true);         // Mostramos el modal con los datos
      } catch (error) {
        console.error("Error en la búsqueda:", error);
      }
    }
  };

  // Renderiza el campo de entrada para una característica determinada
  // Si está en el bloque de características disponibles, lo pinta atenuado
  // Si está seleccionada, lo muestra con input habilitado y botón para quitarla
  const renderCampo = (caracteristica, transparente, esSeleccionada) => {
    // Convierte el nombre de la característica a un formato legible (con espacios)
    const label = caracteristica.replace(/_/g, ' ');

    // Define las clases CSS base para los campos
    const baseClass = "p-4 rounded border mb-2 transition";

    // Aplica opacidad si es un campo disponible no seleccionado
    const className = transparente ? `${baseClass} opacity-50 bg-gray-100` : `${baseClass} bg-white`;

    // Lógica para decidir qué tipo de input mostrar (select o input numérico)
    const renderInput = () => {
      switch (caracteristica) {
        // Características tipo booleano (Sí / No)
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

        // Características que implican calidad/resolución en distintos niveles
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

        // Entrada alternativa: sólo texto o texto y audio
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

        // Por defecto, renderiza un input numérico (por ejemplo: precio, minutos, número de avatares, etc.)
        default:
          return (
            <input 
              type="number"
              className={`form-select ${errores.includes(caracteristica) ? 'is-invalid' : ''}`}
              placeholder={caracteristica.replace(/_/g, ' ')}
              value={valores[caracteristica] ?? ""}
              onChange={(e) => setValores({ ...valores, [caracteristica]: e.target.value })}
            />
          );
      }
    };

    // Render del campo individual con su etiqueta, input y botón para moverlo de bloque
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

  // Render del componente completo
  return (
    <div className="container py-4 animar-entrada">
      
      {/* Encabezado de la página con título y botones para editar proveedores/pesos */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="h4 mb-0">Buscar Proveedor Óptimo</h2>
        <div>
          <button onClick={() => navigate('/proveedores/nuevo')} className="btn btn-outline-primary me-2">
            Editar Proveedores
          </button>
          <button onClick={() => navigate('/proveedores/pesos')} className="btn btn-outline-primary me-2">
            Editar Pesos
          </button>
        </div>
      </div>

      {/* Botones para mover todas las características de un bloque a otro */}
      <div className="mb-4 d-flex gap-2">
        <button onClick={agregarTodas} className="btn btn-success">
          Agregar Todas las características
        </button>
        <button onClick={eliminarTodas} className="btn btn-danger">
          Eliminar Todas las características
        </button>
      </div>

      {/* Bloque de características seleccionadas con inputs activos */}
      <div className="bg-white p-3 border rounded mb-4">
        <h5 className="mb-3">Características seleccionadas</h5>
        <div className="row g-3">
          {seleccionadas.map((c) => renderCampo(c, false, true))}
        </div>
      </div>

      {/* Botón central de búsqueda con estilo más ancho */}
      <div className="text-center mt-3">
        <button onClick={handleBuscar} className="btn btn-primary mb-4" style={{ minWidth: '180px' }}>
          BUSCAR
        </button>
      </div>

      {/* Bloque de características disponibles (atenuadas visualmente) */}
      <div className="bg-light p-3 border rounded mb-4">
        <h5 className="mb-3">Características disponibles</h5>
        <div className="row g-3">
          {disponibles.map((c) => renderCampo(c, true, false))}
        </div>
      </div>

      {/* Modal con el resultado de la búsqueda, si se ha recibido respuesta del backend */}
      {mostrarPopup && resultado?.maximos?.length > 0 && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog" style={{ marginTop: '90px' }}>
            <div className="modal-content" style={{ maxHeight: '700px', overflowY: 'auto' }}>

              {/* Cabecera del modal */}
              <div className="modal-header">
                <h5 className="modal-title">Resultado</h5>
                <button type="button" className="btn-close" onClick={cerrarPopup}></button>
              </div>

              {/* Cuerpo del modal: resumen del proveedor óptimo */}
              <div className="modal-body">
                <p>
                  El Proveedor con más similitud a los parámetros introducidos es:
                  <strong> {resultado.maximos[0].proveedor}</strong> del Plan
                  <strong> {resultado.maximos[0].plan}</strong>, con un máximo de
                  <strong> {resultado.maximos[0].similitud.toFixed(2)}</strong> puntos sobre
                  <strong> {resultado.totalPesoConfigurado.toFixed(2)}</strong>.
                </p>
              </div>

              {/* Tabla con todos los resultados de similitud si hay varios */}
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

              {/* Pie del modal con botón de cierre */}
              <div className="modal-footer">
                <button type="button" className="btn btn-danger" onClick={cerrarPopup}>
                  Cerrar
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default BusquedaProveedor;
