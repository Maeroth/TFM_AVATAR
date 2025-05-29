import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Proveedores from './pages/experto/Proveedores.jsx';
import NuevoProveedor from "./pages/experto/NuevoProveedor";
import EditarPesos from "./pages/experto/EditarPesos";
import AdminHome from "./pages/admin/AdminHome";
import GenerarVideo from "./pages/admin/GenerarVideo";
import SeleccionarAvatar from "./pages/admin/SeleccionarAvatar.jsx";
import GestionVideos from "./pages/admin/GestionVideos.jsx";


function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/proveedores" element={<Proveedores />} />
      <Route path="/proveedores/nuevo" element={<NuevoProveedor />} />
      <Route path="/proveedores/pesos" element={<EditarPesos />} />
      <Route path="/admin" element={<AdminHome />} />
      <Route path="/admin/videos" element={<GenerarVideo />} />
      <Route path="/admin/avatar" element={<SeleccionarAvatar />} />
      <Route path="/admin/gestionVideos" element={<GestionVideos />} />
    </Routes>
  );
}

export default App;
