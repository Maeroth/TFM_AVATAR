import { Routes, Route } from 'react-router-dom';
import Login from './pages/experto/Login.jsx';
import Parametros from './pages/experto/Parametros.jsx';
import Proveedores from './pages/experto/Proveedores.jsx';
import NuevoProveedor from "./pages/experto/NuevoProveedor";
import EditarPesos from "./pages/experto/EditarPesos";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/parametros" element={<Parametros />} />
      <Route path="/proveedores" element={<Proveedores />} />
      <Route path="/proveedores/nuevo" element={<NuevoProveedor />} />
      <Route path="/proveedores/pesos" element={<EditarPesos />} />
    </Routes>
  );
}

export default App;
