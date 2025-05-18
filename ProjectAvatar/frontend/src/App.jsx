import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Parametros from './pages/Parametros.jsx';
import Proveedores from './pages/Proveedores.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/parametros" element={<Parametros />} />
      <Route path="/proveedores" element={<Proveedores />} />
    </Routes>
  );
}

export default App;
