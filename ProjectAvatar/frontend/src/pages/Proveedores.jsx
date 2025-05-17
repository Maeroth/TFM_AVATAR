import React, { useState } from "react";

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

const preseleccionadas = [
  "precio",
  "minutos_de_video_mes",
  "minutos_de_streaming_mes",
  "tiene_streaming",
  "numero_avatares",
  "numero_de_voces",
  "licencia_comercial"
];

const BusquedaProveedor = () => {
  const [disponibles, setDisponibles] = useState(caracteristicas.filter(c => !preseleccionadas.includes(c)));
  const [seleccionadas, setSeleccionadas] = useState(preseleccionadas);

  const moverCaracteristica = (item) => {
    if (!seleccionadas.includes(item)) {
      setDisponibles(disponibles.filter(c => c !== item));
      setSeleccionadas([...seleccionadas, item]);
    }
  };

  const devolverCaracteristica = (item) => {
    if (!disponibles.includes(item)) {
      setSeleccionadas(seleccionadas.filter(c => c !== item));
      setDisponibles([...disponibles, item]);
    }
  };

  const agregarTodas = () => {
    setSeleccionadas([...seleccionadas, ...disponibles]);
    setDisponibles([]);
  };

  const eliminarTodas = () => {
    setDisponibles([...disponibles, ...seleccionadas]);
    setSeleccionadas([]);
  };

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
            <select className="border p-2 rounded w-full">
              <option value="">Seleccione una opción</option>
              <option value="1">Sí</option>
              <option value="0">No</option>
            </select>
          );
        case "resolucion_del_video":
          return (
            <select className="border p-2 rounded w-full">
              <option value="">Seleccione resolución</option>
              <option value="0">720p</option>
              <option value="1">1080p</option>
              <option value="2">4k</option>
            </select>
          );
        case "sincronizacion_labial":
        case "calidad_api":
          return (
            <select className="border p-2 rounded w-full">
              <option value="">Seleccione calidad</option>
              <option value="0">BAJA</option>
              <option value="1">NORMAL</option>
              <option value="2">ALTA</option>
            </select>
          );
        case "entrada_alternativa":
          return (
            <select className="border p-2 rounded w-full">
              <option value="">Seleccione tipo</option>
              <option value="Sólo Texto">Sólo Texto</option>
              <option value="Texto y Audio">Texto y Audio</option>
            </select>
          );
        default:
          return (
            <input type="number" className="border p-2 rounded w-full" placeholder={caracteristica.replace(/_/g, ' ')} />
          );
      }
    };

    return (
      <div className={className}>
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

      <div className="flex gap-4 mb-6">
        <button onClick={agregarTodas} className="bg-green-600 text-white px-4 py-2 rounded">Agregar Todas las características</button>
        <button onClick={eliminarTodas} className="bg-red-600 text-white px-4 py-2 rounded">Eliminar Todas las características</button>
      </div>

      <div className="bg-white p-4 rounded shadow mb-6">
        <h3 className="font-semibold mb-2">Características seleccionadas</h3>
        <div className="grid grid-cols-3 gap-4">
          {seleccionadas.map((c) => renderCampo(c, false, true))}
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded shadow">
        <h3 className="font-semibold mb-2">Características disponibles</h3>
        <div className="grid grid-cols-3 gap-4">
          {disponibles.map((c) => renderCampo(c, true, false))}
        </div>
      </div>

      <button className="mt-6 bg-blue-600 text-white px-6 py-2 rounded">BUSCAR</button>
    </div>
  );
};

export default BusquedaProveedor;
