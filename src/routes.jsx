import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './views/Dashboard';
import Alumnos from './views/Alumnos';
import Clases from './views/Clases';
import Pagos from './views/Pagos';
import Asistencia from './views/Asistencia';
import Configuracion from './views/Configuracion';
import Login from './views/Login';
import MisClases from './views/MisClases';
import MisPagos from './views/MisPagos';
import Cobros from './views/Cobros';
import Entrenadores from './views/Entrenadores';
import MisClasesEntrenador from './views/MisClasesEntrenador';
import ReceptionistDashboard from './views/ReceptionistDashboard';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/alumnos" element={<Alumnos />} />
      <Route path="/clases" element={<Clases />} />
      <Route path="/pagos" element={<Pagos />} />
      <Route path="/asistencia" element={<Asistencia />} />
      <Route path="/configuracion" element={<Configuracion />} />
      <Route path="/mis-clases" element={<MisClases />} />
      <Route path="/mis-pagos" element={<MisPagos />} />
      <Route path="/cobros" element={<Cobros />} />
      <Route path="/entrenadores" element={<Entrenadores />} />
      <Route path="/mis-clases-entrenador" element={<MisClasesEntrenador />} />
      <Route path="/dashboard-recepcionista" element={<ReceptionistDashboard />} />
    </Routes>
  );
} 