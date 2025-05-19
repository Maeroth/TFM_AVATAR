import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Parametros from './pages/Parametros.jsx';
import Proveedores from './pages/Proveedores.jsx';
import NuevoProveedor from "./pages/NuevoProveedor";
import EditarProveedor from "./pages/EditarProveedor";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/parametros" element={<Parametros />} />
      <Route path="/proveedores" element={<Proveedores />} />
      <Route path="/proveedores/nuevo" element={<NuevoProveedor />} />
      <Route path="/proveedores/editar" element={<EditarProveedor />} />
    </Routes>
  );
}

export default App;
