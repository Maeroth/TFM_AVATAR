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

const BusquedaProveedor = () => {
  const [disponibles, setDisponibles] = useState(caracteristicas);
  const [seleccionadas, setSeleccionadas] = useState([]);

  const moverCaracteristica = (item) => {
    setDisponibles(disponibles.filter(c => c !== item));
    setSeleccionadas([...seleccionadas, item]);
  };

  const devolverCaracteristica = (item) => {
    setSeleccionadas(seleccionadas.filter(c => c !== item));
    setDisponibles([...disponibles, item]);
  };

  const renderCampo = (caracteristica, transparente, esSeleccionada) => {
    const baseClass = "p-4 rounded border mb-2 transition cursor-pointer";
    const className = transparente ? `${baseClass} opacity-50 bg-gray-100` : `${baseClass} bg-white`;

    const handleClick = () => {
      if (esSeleccionada) devolverCaracteristica(caracteristica);
      else moverCaracteristica(caracteristica);
    };

    return (
      <div className={className} onClick={handleClick}>
        <label className="block mb-1 capitalize">{caracteristica.replace(/_/g, ' ')}</label>
        {[
          "tiene_streaming",
          "streaming_con_sdk",
          "traduccion_automatica",
          "sincronizacion_labial",
          "avatares_personales",
          "entrada_alternativa",
          "licencia_comercial",
          "clonado_de_voz"
        ].includes(caracteristica) ? (
          <select className="border p-2 rounded w-full">
            <option value="">Seleccione una opción</option>
            <option value="1">Sí</option>
            <option value="0">No</option>
          </select>
        ) : (
          <input type="text" className="border p-2 rounded w-full" placeholder={caracteristica.replace(/_/g, ' ')} />
        )}
      </div>
    );
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Buscar Proveedor Óptimo</h2>
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-gray-50 p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Características disponibles</h3>
          {disponibles.map((c) => renderCampo(c, true, false))}
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Características seleccionadas</h3>
          {seleccionadas.map((c) => renderCampo(c, false, true))}
        </div>
      </div>
      <button className="mt-6 bg-blue-600 text-white px-6 py-2 rounded">BUSCAR</button>
    </div>
  );
};

export default BusquedaProveedor;
