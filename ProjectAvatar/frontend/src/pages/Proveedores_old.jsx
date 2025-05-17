import React from "react";

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
  const renderCampo = (caracteristica) => {
    if (
      [
        "tiene_streaming",
        "streaming_con_sdk",
        "traduccion_automatica",
        "sincronizacion_labial",
        "avatares_personales",
        "entrada_alternativa",
        "licencia_comercial",
        "clonado_de_voz"
      ].includes(caracteristica)
    ) {
      return (
        <select className="border p-2 rounded">
          <option value="">Seleccione una opción</option>
          <option value="1">Sí</option>
          <option value="0">No</option>
        </select>
      );
    }
    return <input type="text" placeholder={caracteristica.replace(/_/g, ' ')} className="border p-2 rounded" />;
  };

  return (
    <div className="p-4 max-w-3xl mx-auto space-y-4">
      <h2 className="text-xl font-bold">Buscar Proveedor Óptimo</h2>
      {caracteristicas.map((c) => (
        <div key={c} className="flex flex-col">
          <label className="mb-1 capitalize">{c.replace(/_/g, ' ')}</label>
          {renderCampo(c)}
        </div>
      ))}
      <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">BUSCAR</button>
    </div>
  );
};

export default BusquedaProveedor;