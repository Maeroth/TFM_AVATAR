import { Navigate, Outlet } from "react-router-dom";

const Security = () => {
  const token = localStorage.getItem("token");

  // Si hay token, renderiza las rutas hijas usando Outlet; si no, redirige
  return token ? <Outlet /> : <Navigate to="/" />;
};

export default Security;
