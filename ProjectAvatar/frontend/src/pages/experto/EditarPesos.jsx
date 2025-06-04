// Importación de React y hooks necesarios para gestionar estado y efectos secundarios
import React, { useEffect, useState } from "react";

// Librería HTTP para llamadas al backend
import axios from "axios";

// Hook de React Router para navegar entre rutas
import { useNavigate } from "react-router-dom";

  // Componente principal para configurar los pesos asociados a cada característica técnica
  const Pesos = () => {
    const navigate = useNavigate(); // Permite redirigir a otra pantalla

    // Estados del componente
    const [caracteristicas, setCaracteristicas] = useState([]); // Lista de características disponibles
    const [pesos, setPesos] = useState([]); // Lista de posibles valores de peso
    const [asignaciones, setAsignaciones] = useState({}); // Relación característica → peso
    const [alerta, setAlerta] = useState(null); // Mensaje de éxito o error

  // useEffect que oculta la alerta después de 5 segundos
  useEffect(() => {
    if (alerta) {
      const timer = setTimeout(() => setAlerta(null), 5000);
      return () => clearTimeout(timer); // Limpia el temporizador al desmontar el componente
    }
  }, [alerta]);

  // Carga inicial de los datos desde el backend (pesos y características)
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // Trae los pesos disponibles (por ejemplo: ALTO, MEDIO, BAJO)
        const responsePesos = await axios.get(`${import.meta.env.VITE_API_URL}/api/pesos`);
        setPesos(responsePesos.data);
      } catch (err) {
        console.error("Error cargando pesos:", err);
      }

      try {
        // Trae las características y las asignaciones actuales de peso
        const responseCaract = await axios.get(`${import.meta.env.VITE_API_URL}/api/caracteristicas`);
        setCaracteristicas(responseCaract.data);

        // Preparamos las asignaciones actuales en el estado
        const inicial = {};
        responseCaract.data.forEach(c => {
          inicial[c._id] = c.peso_id; // Ejemplo: { "resolucion_del_video": "ALTO" }
        });
        setAsignaciones(inicial);
      } catch (err) {
        console.error("Error cargando características:", err);
      }
    };

    cargarDatos(); // Ejecutamos la función al montar el componente
  }, []);

  // Función para actualizar el peso asignado a una característica concreta
  const handleCambio = (idCaracteristica, nuevoPeso) => {
    setAsignaciones({ ...asignaciones, [idCaracteristica]: nuevoPeso });
  };

  // Envía las asignaciones modificadas al backend para guardar los cambios
  const guardarCambios = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/caracteristicas/actualizar`,
        asignaciones
      );
      setAlerta({ tipo: "success", mensaje: response.data.message || "Datos actualizados correctamente" });
    } catch (err) {
      console.error("Error al guardar cambios:", err);
      setAlerta({ tipo: "danger", mensaje: err.response?.data?.error || "Error al actualizar los pesos." });
    }
  };

  return (
    <div className="container py-4 animar-entrada">
      {/* Encabezado con título y botón para volver */}
      <div className="d-flex justify-content-between align-items-center mb-3 gap-3">
        <h2 className="h4 mb-0">Configuración de Pesos de Características Técnicas</h2>
        <button onClick={() => navigate("/Proveedores")} className="btn btn-outline-secondary ms-3">
          ← Volver
        </button>
      </div>

      {/* Contenedor principal del formulario */}
      <div className="bg-white border p-3 rounded">
        {/* Tabla centrada y con ancho limitado */}
        <div className="table-responsive" style={{ maxWidth: "800px", margin: "0 auto" }}>
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Característica Técnica</th>
                <th>Peso Asignado</th>
              </tr>
            </thead>
            <tbody>
              {/* Genera una fila por cada característica */}
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
        </div>

        {/* Alerta de éxito o error al guardar */}
        {alerta && (
          <div className={`alert alert-${alerta.tipo} mt-3`}>
            {alerta.mensaje}
          </div>
        )}

        {/* Botón para enviar los cambios al servidor */}
        <div className="text-center mt-3">
          <button onClick={guardarCambios} className="btn btn-primary mb-4" style={{ minWidth: "180px" }}>
            GUARDAR
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pesos;
