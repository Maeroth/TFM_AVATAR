// Componente completo para configurar dinámicamente una búsqueda de proveedores mediante criterios seleccionables
import React, { useState } from "react";
import axios from "axios";

// Lista completa de características disponibles para configurar
const caracteristicas = [
  "precio",
  "minutos_de_video_mes",
  "minutos_de_streaming_mes",
  "tiene_streaming",
  "streaming_con_sdk",
  "traduccion_automatica",
  "resolucion_del_video",
  "duracion_maxima_video",
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
  const [disponibles, setDisponibles] = useState(caracteristicas.filter(c => !preseleccionadas.includes(c)));
  const [seleccionadas, setSeleccionadas] = useState(preseleccionadas);
  const [valores, setValores] = useState({});
  const [resultado, setResultado] = useState(null);
  const [mostrarPopup, setMostrarPopup] = useState(false);

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
    seleccionadas.forEach((c) => {
      if (valores[c] !== undefined && valores[c] !== "") {
        criterios[c] = valores[c];
      }
  
    });

  try {
      const response = await axios.post("http://localhost:5000/api/bestProvider", criterios);
      console.log("Resultado:", response.data);
      setResultado(response.data);
      setMostrarPopup(true);
    } catch (error) {
      console.error("Error en la búsqueda:", error);
    }
  };

  // Renderiza cada campo con input o select según el tipo de dato
  const renderCampo = (caracteristica, transparente, esSeleccionada) => {
    const baseClass = "p-4 rounded border mb-2 transition";
    const className = transparente ? `${baseClass} opacity-50 bg-gray-100` : `${baseClass} bg-white`;

    const renderInput = () => {
      switch (caracteristica) {
        case "tiene_streaming":
        case "streaming_con_sdk":
        case "traduccion_automatica":
        case "avatares_personales":
        case "licencia_comercial":
        case "clonado_de_voz":
        case "expresiones_del_avatar":
          return (
            <select 
              value={valores[caracteristica] || ""}
              onChange={(e) => setValores({ ...valores, [caracteristica]: e.target.value })}
              className="border p-2 rounded w-full">
              <option value="">Seleccione una opción</option>
              <option value="1">Sí</option>
              <option value="0">No</option>
            </select>
          );
        case "resolucion_del_video":
          return (
            <select 
              value={valores[caracteristica] || ""}
              onChange={(e) => setValores({ ...valores, [caracteristica]: e.target.value })}
              className="border p-2 rounded w-full">
              <option value="">Seleccione resolución</option>
              <option value="0">720p</option>
              <option value="1">1080p</option>
              <option value="2">4k</option>
            </select>
          );
        case "sincronizacion_labial":
        case "calidad_api":
          return (
            <select 
              value={valores[caracteristica] || ""}
              onChange={(e) => setValores({ ...valores, [caracteristica]: e.target.value })}
              className="border p-2 rounded w-full">
              <option value="">Seleccione calidad</option>
              <option value="0">BAJA</option>
              <option value="1">NORMAL</option>
              <option value="2">ALTA</option>
            </select>
          );
        case "entrada_alternativa":
          return (
            <select 
              value={valores[caracteristica] || ""}
              onChange={(e) => setValores({ ...valores, [caracteristica]: e.target.value })}
              className="border p-2 rounded w-full">
              <option value="">Seleccione tipo</option>
              <option value="0">Sólo Texto</option>
              <option value="1">Texto y Audio</option>
            </select>
          );
        default:
          return (
            <input type="number" className="border p-2 rounded w-full" placeholder={caracteristica.replace(/_/g, ' ')}
             value={valores[caracteristica] || ""}
             onChange={(e) => setValores({ ...valores, [caracteristica]: e.target.value })}
            />
          );
      }
    };

    return (
      <div key={caracteristica} className={className}>
        <label className="block mb-1 capitalize">{caracteristica.replace(/_/g, ' ')}</label>
        {renderInput()}
        <button
          onClick={() => esSeleccionada ? devolverCaracteristica(caracteristica) : moverCaracteristica(caracteristica)}
          className="mt-2 text-sm text-blue-600 underline"
        >
          {esSeleccionada ? "Quitar de la búsqueda" : "Añadir a la búsqueda"}
        </button>
      </div>
    );
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Buscar Proveedor Óptimo</h2>

      {/* Botones de gestión rápida */}
      <div className="flex gap-4 mb-6">
        <button onClick={agregarTodas} className="bg-green-600 text-white px-4 py-2 rounded">Agregar Todas las características</button>
        <button onClick={eliminarTodas} className="bg-red-600 text-white px-4 py-2 rounded">Eliminar Todas las características</button>
      </div>

      {/* Panel de características seleccionadas */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h3 className="font-semibold mb-2">Características seleccionadas</h3>
        <div className="grid grid-cols-3 gap-4">
          {seleccionadas.map((c) => renderCampo(c, false, true))}
        </div>
      </div>

      {/* Panel de características no activas */}
      <div className="bg-gray-50 p-4 rounded shadow">
        <h3 className="font-semibold mb-2">Características disponibles</h3>
        <div className="grid grid-cols-3 gap-4">
          {disponibles.map((c) => renderCampo(c, true, false))}
        </div>
      </div>

      {/* Botón final de búsqueda */}
      <button onClick={handleBuscar} className="mt-6 bg-blue-600 text-white px-6 py-2 rounded">BUSCAR</button>    
       {mostrarPopup && resultado?.maximos?.length > 0 && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-lg text-center">
            <h3 className="text-lg font-semibold mb-4">Resultado</h3>
            <p className="mb-4">
              El Proveedor con más similitud a los parámetros introducidos es: <strong>{resultado.maximos[0].proveedor}</strong> del Plan <strong>{resultado.maximos[0].plan}</strong>, con un máximo de <strong>{resultado.maximos[0].similitud.toFixed(2)}</strong> puntos sobre un total de <strong>{resultado.totalPesoConfigurado.toFixed(2)}</strong>.
            </p>
            <button onClick={cerrarPopup} className="bg-red-500 text-white px-4 py-2 rounded">Cerrar</button>
          </div>
        </div>
      )}

      {resultado && resultado.resultados.length > 0 && (
        <div className="mt-8">
          <h4 className="font-semibold mb-2">Tabla de Resultados</h4>
          <table className="min-w-full table-auto border-collapse border border-gray-300">
            <thead>
              <tr>
                <th className="border px-4 py-2">Proveedor</th>
                <th className="border px-4 py-2">Plan</th>
                <th className="border px-4 py-2">Similitud</th>
              </tr>
            </thead>
            <tbody>
              {resultado.resultados.map((r, i) => (
                <tr key={i}>
                  <td className="border px-4 py-2">{r.proveedor}</td>
                  <td className="border px-4 py-2">{r.plan}</td>
                  <td className="border px-4 py-2">{r.similitud.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>


  );
};

export default BusquedaProveedor;
