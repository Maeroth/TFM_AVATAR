import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Pesos = () => {
  const navigate = useNavigate();
  const [caracteristicas, setCaracteristicas] = useState([]);
  const [pesos, setPesos] = useState([]);
  const [asignaciones, setAsignaciones] = useState({});
  const [mensaje, setMensaje] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);

  // Carga inicial
  useEffect(() => {
    // Traer pesos
    axios.get(`${import.meta.env.VITE_API_URL}/api/pesos`)
      .then(res => setPesos(res.data))
      .catch(err => console.error("Error cargando pesos:", err));

    // Traer características con nombre del peso ya asociado
    axios.get(`${import.meta.env.VITE_API_URL}/api/caracteristicas`)
      .then(res => {
        setCaracteristicas(res.data);
        const inicial = {};
        res.data.forEach(c => {
          inicial[c._id] = c.peso_id; // Ej: "ALTO"
        });
        setAsignaciones(inicial);
      })
      .catch(err => console.error("Error cargando características:", err));
  }, []);

  // Cambio en un select individual
  const handleCambio = (idCaracteristica, nuevoPeso) => {
    setAsignaciones({ ...asignaciones, [idCaracteristica]: nuevoPeso });
  };

  // Guardar todos los cambios
  const guardarCambios = async () => {
    let response;
    try {
      response = await axios.post(`${import.meta.env.VITE_API_URL}/api/caracteristicas/actualizar`, asignaciones);
      setMensaje(response.data.message || "Datos actualizados correctamente");
      setMostrarModal(true); // Mostrar el modal
    } catch (err) {
      console.error("Error al guardar cambios:", err);
      setMensaje(error.response?.data?.error  || "Error al actualizar los pesos.");
      setMostrarModal(true); // Mostrar el modal
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3 gap-3">
        <h2 className="h4 mb-0">Configuración de Pesos de Características Técnicas</h2>
        <button onClick={() => navigate("/Proveedores")} className="btn btn-outline-secondary ms-3">← Volver</button>
      </div>

      <div className="bg-white border p-3 rounded">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Característica Técnica</th>
              <th>Peso Asignado</th>
            </tr>
          </thead>
          <tbody>
            {caracteristicas.map(c => (
              <tr key={c._id}>
                <td className="text-capitalize">{c.caracteristica.replace(/_/g, " ")}</td>
                <td>
                  <select
                    className="form-select"
                    value={asignaciones[c._id] || ""}
                    onChange={e => handleCambio(c._id, e.target.value)}
                  >
                    <option value="">Seleccione un peso</option>
                    {pesos.map(p => (
                      <option key={p._id} value={p._id}>
                        {p._id} ({p.valor})
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={guardarCambios} className="btn btn-primary">Guardar Cambios</button>
      </div>

{mensaje && (
  <div className="alert alert-success">
    {mensaje}
  </div>
)}
      {mostrarModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Cambios Guardados</h5>
                <button type="button" className="btn-close" onClick={() => setMostrarModal(false)}></button>
              </div>
              <div className="modal-body">
                <p>{mensaje}</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-primary" onClick={() => setMostrarModal(false)}>
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

export default Pesos;
