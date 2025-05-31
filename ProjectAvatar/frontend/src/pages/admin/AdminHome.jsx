import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tooltip } from "bootstrap";

const AdminHome = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Inicializa los tooltips de Bootstrap sobre cualquier elemento que tenga el atributo data-bs-toggle="tooltip"
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');

    // Se crean los tooltips permitiendo HTML, alineación rápida, y ocultándose al perder el foco
    const tooltips = [...tooltipTriggerList].map((el) =>
      new Tooltip(el, {
        trigger: 'hover focus',  // evita que el tooltip se quede abierto tras clic
        delay: { show: 0, hide: 100 }, // muestra inmediato, oculta suavemente
        html: true // permite incluir <strong>, <br>, etc. dentro del tooltip
      })
    );

    // Limpieza de los tooltips al desmontar el componente (buena práctica para evitar fugas de memoria)
    return () => {
      tooltips.forEach(t => t.dispose());
    };
  }, []);

  return (
    <div
      className="container animar-entrada d-flex flex-column align-items-center justify-content-center py-5"
      style={{ minHeight: "80vh" }}
    >
      <div className="text-center border-bottom border-3 border-primary pb-3 mb-5">
  <h2 className="fw-bold d-inline-flex align-items-center gap-2 text-primary">
    <i className="bi bi-gear-fill"></i> {/* O cualquier icono de Bootstrap Icons */}
    Panel de Administración
  </h2>
</div>


      {/* Contenedor de botones administrativos con espacio vertical uniforme y ancho limitado */}
      <div className="d-flex flex-column gap-4 w-100" style={{ maxWidth: "400px" }}>

        {/* Cada botón está envuelto en un div con tooltip contextual que explica su función */}
        
        {/* Botón: Crear vídeos con avatares virtuales a partir de texto o audio */}
        <div
          className="w-100"
          data-bs-toggle="tooltip"
          data-bs-placement="right"
          data-bs-html="true"
          data-bs-title={`<div class='text-start'>
              En este menú se crean los vídeos con avatares virtuales informando un <strong>texto</strong> o un <strong>audio (mp3)</strong>.
              <br>También, se pueden elegir <strong>fondos</strong> de colores o imágenes.
          </div>`}
        >
          <button
            onClick={() => navigate("/admin/videos")}
            className="btn btn-success btn-lg shadow w-100"
          >
            Creación de Vídeos
          </button>
        </div>

        {/* Botón: Gestión de los vídeos generados */}
        <div
          className="w-100"
          data-bs-toggle="tooltip"
          data-bs-placement="right"
          data-bs-html="true"
          data-bs-title={`<div class='text-start'>
              Aquí se gestionan los vídeos que se han creado en el menú de <strong>Creación de Vídeos</strong>.
          </div>`}
        >
          <button
            onClick={() => navigate("/admin/gestionVideos")}
            className="btn btn-danger btn-lg shadow w-100"
          >
            Gestión de Vídeos
          </button>
        </div>

        {/* Botón: Configuración de avatares en streaming para asesoramiento en tiempo real */}
        <div
          className="w-100"
          data-bs-toggle="tooltip"
          data-bs-placement="right"
          data-bs-html="true"
          data-bs-title={`<div class='text-start'>
              Aquí se configura el comportamineto del Avatar Streaming, es decir, el avatar que aparece en el <strong>asesoramiento</strong>.
          </div>`}
        >
          <button
            onClick={() => navigate("/admin/gestionParametrosAvatarStream")}
            className="btn btn-primary btn-lg shadow w-100"
          >
            Gestión de avatar en tiempo real
          </button>
        </div>

        {/* Botón deshabilitado: Gestión de Avatar individual (actualmente no funcional) */}
        <div
          className="w-100"
          data-bs-toggle="tooltip"
          data-bs-placement="right"
          data-bs-html="true"
          data-bs-title={`<div class='text-start'>
              La API oficial de D-ID actualmente <strong>no puede generar Avatares HD</strong>,<br/>
              sólo Express, pese a lo que dice la documentación. Esto impide que se puedan generar vídeos con avatares personales desde la API.<br/>
              <br><em>Se espera que se corrija en las próximas versiones.</em>
          </div>`}
        >
          <button
            className="btn btn-warning btn-lg shadow d-flex justify-content-between align-items-center opacity-50 w-100"
            disabled // Deshabilitado porque la funcionalidad aún no está disponible
            style={{ pointerEvents: 'none' }} // Asegura que el tooltip se active desde el contenedor
          >
            <span>Gestión de Avatar</span>
            <span className="ms-2 d-flex align-items-center">
              🚧 <small className="ms-1">En construcción</small>
            </span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default AdminHome;
