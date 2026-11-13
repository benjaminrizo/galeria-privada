import { Navigate, Route, Routes } from 'react-router-dom';
import { sesion } from './api.js';
import Acceso from './paginas/Acceso.jsx';
import Galeria from './paginas/Galeria.jsx';
import GaleriaDelCliente from './paginas/GaleriaDelCliente.jsx';
import Panel from './paginas/Panel.jsx';
import SeleccionRecibida from './paginas/SeleccionRecibida.jsx';

/** Rutas que exigen sesión del fotógrafo (RNF-05). */
function Privada({ children }) {
  return sesion.token() ? children : <Navigate to="/acceso" replace />;
}

export default function App() {
  return (
    <Routes>
      {/* Flujo del cliente: entra por enlace, sin cuenta (ADR 0001) */}
      <Route path="/c/:codigo" element={<GaleriaDelCliente />} />

      <Route path="/acceso" element={<Acceso />} />
      <Route path="/" element={<Privada><Panel /></Privada>} />
      <Route path="/galerias/:id" element={<Privada><Galeria /></Privada>} />
      <Route path="/galerias/:id/seleccion" element={<Privada><SeleccionRecibida /></Privada>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
