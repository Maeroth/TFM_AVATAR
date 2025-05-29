import React from "react";
import { useNavigate } from "react-router-dom";

const AdminHome = () => {
  const navigate = useNavigate();

 return (
    <div className="container d-flex flex-column align-items-center justify-content-center py-5" style={{ minHeight: "80vh" }}>
        <h1 className="mb-5 fw-bold text-center">Panel de Administración</h1>

        <div className="d-flex flex-column gap-4 w-100" style={{ maxWidth: "400px" }}>

        <button
            onClick={() => navigate("/admin/videos")}
            className="btn btn-success btn-lg shadow"
        >
            Creación de Vídeos
        </button>

        <button
            onClick={() => navigate("/admin/gestionVideos")}
            className="btn btn-danger btn-lg shadow"
        >
            Gestión de Vídeos
        </button>

        <button
            onClick={() => navigate("/admin/avatar")}
            className="btn btn-warning btn-lg shadow"
        >
            Gestión de Avatar
        </button>

         <button
            onClick={() => navigate("/admin/voz")}
            className="btn btn-primary btn-lg shadow"
        >
            Gestión de avatar en tiempo real
        </button>
        </div>
    </div>
    );
};
export default AdminHome;