// Importación de React y hooks necesarios
import React, { useEffect, useState } from "react";

// Librería para realizar llamadas HTTP al backend
import axios from "axios";

// Hook de navegación para redirigir entre rutas
import { useNavigate } from 'react-router-dom';

// Lista completa de características configurables para un proveedor.
// Estas serán los campos del formulario que el usuario debe rellenar.
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
  const navigate = useNavigate(); // Para redirigir al usuario a otra pantalla

  const [modoEdicion, setModoEdicion] = useState(false); // Indica si estamos editando o creando un proveedor
  const [seleccionadas, setSeleccionadas] = useState(caracteristicas); // Características visibles en el formulario
  const [valores, setValores] = useState({}); // Almacena los valores introducidos por el usuario
  const [resultado, setResultado] = useState(null); // Mensaje del backend tras guardar/eliminar
  const [errores, setErrores] = useState([]); // Lista de campos inválidos (vacíos)
  const [listaProveedores, setListaProveedores] = useState([]); // Lista de proveedores existentes
  const [seleccionado, setSeleccionado] = useState(""); // ID del proveedor seleccionado en el combo
  const [alerta, setAlerta] = useState(null); // Almacena mensajes de error o información
  

  // Cierra el modal
  const cerrarPopup = () => {
    setMostrarPopup(false);
  };

  // useEffect que hace desaparecer la alerta tras 5 segundos
  useEffect(() => {
    if (alerta) {
      const timer = setTimeout(() => setAlerta(null), 5000);
      return () => clearTimeout(timer); // Limpieza del temporizador si se desmonta el componente
    }
  }, [alerta]);

  // Guarda un proveedor nuevo o actualiza uno existente
  const handleGuardar = async () => {
    const criterios = {};        // Objeto que se enviará al backend
    const camposVacios = [];     // Almacena nombres de campos vacíos

    setAlerta(''); // Limpiamos cualquier alerta previa
    
    // Recorremos todas las características para validar que tengan valor
    seleccionadas.forEach((c) => {
      if (valores[c] !== undefined && valores[c] !== "") {
        criterios[c] = valores[c]; // Guardamos el valor
      } else {
        camposVacios.push(c);     // Campo vacío → error
      }
    });

    setErrores(camposVacios); // Mostramos errores si los hay

    // Si no hay errores de validación, se realiza la petición al backend
    if (camposVacios.length === 0) {
      try {
        let response;

        // Si estamos editando un proveedor existente
        if (modoEdicion && seleccionado) {
          response = await axios.put(
            `${import.meta.env.VITE_API_URL}/api/proveedores/editar/${seleccionado}`,
            criterios
          );
        } else {
          // Si es un proveedor nuevo
          response = await axios.post(
            `${import.meta.env.VITE_API_URL}/api/proveedores/crear`,
            criterios
          );
        }

        // Éxito → mostramos mensaje, reseteamos formulario y recargamos combo
        console.log("Resultado:", response.data);
        setAlerta({ tipo: "success", mensaje: response.data.message || "Guardado exitosamente"});
        setValores({});
        setSeleccionado("");
        cargarProveedores();

      } catch (error) {
        // Error → mostramos mensaje de error personalizado si lo hay
        console.error("Error en el guardado:", error);
        if (error.response && error.response.status === 400 && error.response.data?.error) {
          setAlerta({ tipo: "danger", mensaje: error.response.data.error});
        } else {
          setAlerta({ tipo: "danger", mensaje: "Error al guardar proveedor: "+ error.response?.data?.error || "Error desconocido"});
        }
      }
    }
  };

  // Elimina un proveedor seleccionado de la base de datos
  const handleEliminar = async () => {
    if (!seleccionado) return; // Si no hay proveedor seleccionado, no se hace nada

    const confirmar = window.confirm("¿Estás seguro de que deseas eliminar este proveedor?");
    if (!confirmar) return; // Si el usuario cancela, se detiene

    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/proveedores/borrar/${seleccionado}`
      );
      setAlerta({ tipo: "success", mensaje: response.data.message || "Borrado exitosamente"});
      setValores({});
      setSeleccionado("");
      setModoEdicion(false);
      cargarProveedores(); // Recarga la lista actualizada
    } catch (error) {
      console.error("Error en el borrado:", error);
      if (error.response && error.response.status === 400 && error.response.data?.error) {
        setAlerta({ tipo: "danger", mensaje: error.response.data.error});
      } else {
        setAlerta({ tipo: "danger", mensaje: "Error al borrar proveedor: " + error.response?.data?.error || "Error desconocido"});
      }
      setMostrarPopup(true);
    }
  };

  // Carga la lista de proveedores disponibles para el selector (modo async/await)
  const cargarProveedores = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/proveedores/comboProveedores`);
      setListaProveedores(response.data); // Guardamos la lista en el estado
    } catch (err) {
      console.error("Error al cargar proveedores:", err);
    }
  };
  // Al cargar el componente por primera vez, se obtienen los proveedores disponibles
  useEffect(() => {
    cargarProveedores();
  }, []);

  // Cuando cambia el proveedor seleccionado, se cargan sus datos en el formulario
  useEffect(() => {
    if (!seleccionado) return;

    // Definimos una función async dentro del useEffect y la ejecutamos
    const cargarDetalleProveedor = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/proveedores/detalle/${seleccionado}`);
        setValores(response.data);
      } catch (err) {
        console.error("Error al cargar detalles del proveedor:", err);
      }
    };

    cargarDetalleProveedor();
  }, [seleccionado]);

  // Función que renderiza un campo del formulario según su tipo de dato
  // También aplica estilos si es un campo deshabilitado o tiene error
  const renderCampo = (caracteristica, transparente, esSeleccionada) => {
    // Convierte el nombre técnico a un formato legible para el usuario (con espacios)
    const label = caracteristica.replace(/_/g, ' ');

    // Clases base del campo para diseño visual
    const baseClass = "p-4 rounded border mb-2 transition";

    // Si el campo no está activo (por ejemplo, es parte de "disponibles" en otro componente), se atenúa
    const className = transparente ? `${baseClass} opacity-50 bg-gray-100` : `${baseClass} bg-white`;

    // Función auxiliar que define qué tipo de input usar según la característica
    const renderInput = () => {
      switch (caracteristica) {
        // Características tipo booleano → opción sí / no
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
              className={`form-select ${errores.includes(caracteristica) ? 'is-invalid' : ''}`}
            >
              <option value="">Seleccione una opción</option>
              <option value="1">Sí</option>
              <option value="0">No</option>
            </select>
          );

        // Características que representan resolución
        case "resolucion_del_video":
          return (
            <select
              value={valores[caracteristica] ?? ""}
              onChange={(e) => setValores({ ...valores, [caracteristica]: e.target.value })}
              className={`form-select ${errores.includes(caracteristica) ? 'is-invalid' : ''}`}
            >
              <option value="">Seleccione resolución</option>
              <option value="0">720p</option>
              <option value="1">1080p</option>
              <option value="2">4k</option>
            </select>
          );

        // Características de tipo calidad (BAJA / NORMAL / ALTA)
        case "sincronizacion_labial":
        case "calidad_api":
        case "velocidad_de_generacion":
          return (
            <select
              value={valores[caracteristica] ?? ""}
              onChange={(e) => setValores({ ...valores, [caracteristica]: e.target.value })}
              className={`form-select ${errores.includes(caracteristica) ? 'is-invalid' : ''}`}
            >
              <option value="">Seleccione calidad</option>
              <option value="0">BAJA</option>
              <option value="1">NORMAL</option>
              <option value="2">ALTA</option>
            </select>
          );

        // Entrada alternativa: texto o texto+audio
        case "entrada_alternativa":
          return (
            <select
              value={valores[caracteristica] ?? ""}
              onChange={(e) => setValores({ ...valores, [caracteristica]: e.target.value })}
              className={`form-select ${errores.includes(caracteristica) ? 'is-invalid' : ''}`}
            >
              <option value="">Seleccione tipo</option>
              <option value="0">Sólo Texto</option>
              <option value="1">Texto y Audio</option>
            </select>
          );

        // Campos de texto libre (proveedor y plan)
        case "proveedor":
        case "plan":
          return (
            <input
              type="text"
              className={`form-select ${errores.includes(caracteristica) ? 'is-invalid' : ''}`}
              placeholder={caracteristica.replace(/_/g, ' ')}
              value={valores[caracteristica] || ""}
              onChange={(e) => setValores({ ...valores, [caracteristica]: e.target.value })}
            />
          );

        // Por defecto, cualquier otra característica se trata como un número
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

    // Renderiza el campo completo con su etiqueta e input correspondiente
    return (
      <div key={caracteristica} className={`col-md-4 ${transparente ? 'opacity-50' : ''} mb-3`}>
        <label className="form-label text-capitalize">{label}</label>
        {renderInput()}
      </div>
    );
  };
  return (
    <div className="container py-4 animar-entrada">
      
      {/* Encabezado con el título y botón para volver a la pantalla anterior */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="h4 mb-0">Edición de Proveedores</h2>
        <button className="btn btn-outline-secondary me-2" onClick={() => navigate('/proveedores')}>
          ← Volver
        </button>
      </div>

      {/* Alerta si existe un mensaje que mostrar */}
      {alerta && (
        <div className={`alert alert-${alerta.tipo} mt-3`}>
          {alerta.mensaje}
        </div>
      )}

      {/* Selector para elegir un proveedor existente y cargar sus datos */}
      <div className="mb-3">
        <label className="form-label">Seleccionar proveedor</label>
        <select
          className="form-select"
          value={seleccionado}
          onChange={(e) => {
            setSeleccionado(e.target.value);
            setModoEdicion(true); // Cambia a modo edición
          }}
        >
          <option value="">Seleccione un proveedor...</option>
          {listaProveedores.map(p => (
            <option key={p.id} value={p.id}>{p.nombre}</option>
          ))}
        </select>
      </div>

      {/* Muestra si estamos en modo edición o creación */}
      <div className="d-flex justify-content-center">
        {modoEdicion ? (
          <span className="badge bg-warning text-dark mb-3">Modo edición de proveedor</span>
        ) : (
          <span className="badge bg-success mb-3">Modo creación de nuevo proveedor</span>
        )}
      </div>

      {/* Botón para crear un nuevo proveedor (resetea el formulario) */}
      <button
        className="btn btn-outline-primary me-2"
        onClick={() => {
          setValores({});
          setErrores([]);
          setSeleccionado("");
          setModoEdicion(false);
        }}
      >
        Nuevo Proveedor
      </button>

      {/* Espacio para botones adicionales si fueran necesarios */}
      <div className="mb-4 d-flex gap-2 "></div>

      {/* Sección de formulario dinámico con todas las características configurables */}
      <div className="bg-white p-3 border rounded mb-4">
        <h5 className="mb-3">Características seleccionadas</h5>
        <div className="row g-3">
          {seleccionadas.map((c) => renderCampo(c, false, true))}
        </div>
      </div>

      {/* Botones de acción: guardar o eliminar proveedor */}
      <div className="d-flex mb-4 gap-2 justify-content-center">
        <button onClick={handleGuardar} className="btn btn-primary">GUARDAR</button>
        {seleccionado && (
          <button className="btn btn-danger" onClick={handleEliminar}>
            Eliminar proveedor
          </button>
        )}
      </div>

    </div>
  );
};

export default NuevoProveedor;