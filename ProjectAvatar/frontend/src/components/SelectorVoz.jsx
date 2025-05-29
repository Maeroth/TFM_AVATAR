import React, { useEffect, useState } from "react";
import axios from "axios";

const SelectorVoz = ({ onSeleccionarVoz }) => {
  const [voces, setVoces] = useState([]);
  const [vozSeleccionada, setVozSeleccionada] = useState("");

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/api/did/voces/microsoft`)
      .then((res) => setVoces(res.data))
      .catch((err) => console.error("Error cargando voces:", err));
  }, []);

  const handleChange = (e) => {
    setVozSeleccionada(e.target.value);
    onSeleccionarVoz(e.target.value);
  };

  return (
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
  );
};

export default SelectorVoz;
