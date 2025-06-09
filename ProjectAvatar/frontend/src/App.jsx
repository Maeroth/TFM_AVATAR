import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Login from './pages/Login.jsx';
import Proveedores from './pages/experto/Proveedores.jsx';
import NuevoProveedor from "./pages/experto/NuevoProveedor";
import EditarPesos from "./pages/experto/EditarPesos";
import AdminHome from "./pages/admin/AdminHome";
import GenerarVideo from "./pages/admin/GenerarVideo";
import SeleccionarAvatar from "./pages/admin/SeleccionarAvatar.jsx";
import GestionVideos from "./pages/admin/GestionVideos.jsx";
import GestionParametrosAvatarStream from "./pages/admin/GestionParametrosAvatarStream.jsx";
import CrearAvatar from "./pages/admin/CrearAvatar.jsx";
import ConexionAvatarStream from "./pages/externo/ConexionAvatarStream.jsx";
import Security from './pages/security/Security.jsx';

function App() {
  return (
    <Routes>
      {/* Todo el contenido está dentro del Layout */}
      <Route element={<Layout />}>
        
        {/* Rutas públicas */}
        <Route path="/" element={<Login />} />
        <Route path="/conexionStream" element={<ConexionAvatarStream />} />

        {/* Rutas protegidas */}
        <Route element={<Security />}>
          <Route path="/proveedores" element={<Proveedores />} />
          <Route path="/proveedores/nuevo" element={<NuevoProveedor />} />
          <Route path="/proveedores/pesos" element={<EditarPesos />} />
          <Route path="/admin" element={<AdminHome />} />
          <Route path="/admin/videos" element={<GenerarVideo />} />
          <Route path="/admin/avatar" element={<SeleccionarAvatar />} />
          <Route path="/admin/gestionVideos" element={<GestionVideos />} />
          <Route path="/admin/gestionParametrosAvatarStream" element={<GestionParametrosAvatarStream />} />
          <Route path="/admin/crearAvatar" element={<CrearAvatar />} />
        </Route>

      </Route>
    </Routes>
  );
}

export default App;