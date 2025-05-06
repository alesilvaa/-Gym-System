import Dashboard from "../views/Dashboard.jsx";
import ReceptionistDashboard from "../views/ReceptionistDashboard.jsx";
import Alumnos from "../views/Alumnos.jsx";
import Clases from "../views/Clases.jsx";
import Pagos from "../views/Pagos.jsx";
import Cobros from "../views/Cobros.jsx";
import Asistencia from "../views/Asistencia.jsx";
import Configuracion from "../views/Configuracion.jsx";
import MisClases from "../views/MisClases.jsx";
import MisPagos from "../views/MisPagos.jsx";
import MisClasesEntrenador from "../views/MisClasesEntrenador.jsx";
import Entrenadores from '../views/Entrenadores.jsx';

export default function TabWrapper({ activeTab, currentUser }) {
  // Si el usuario es entrenador, solo puede ver MisClasesEntrenador
  if (currentUser?.rol === 'entrenador') {
    return <MisClasesEntrenador />;
  }

  // Si el usuario es recepcionista y está en el dashboard, mostrar el ReceptionistDashboard
  if (currentUser?.rol === 'recepcionista' && activeTab === 'dashboard') {
    return <ReceptionistDashboard />;
  }

  switch (activeTab) {
    case 'dashboard':
      return <Dashboard />;
    case 'alumnos':
      return <Alumnos />;
    case 'clases':
      return <Clases />;
    case 'pagos':
      return <Pagos />;
    case 'cobros':
      return <Cobros />;
    case 'asistencia':
      return <Asistencia />;
    case 'configuracion':
      return <Configuracion />;
    case 'mis-clases':
      return <MisClases />;
    case 'mis-pagos':
      return <MisPagos />;
    case 'entrenadores':
      return <Entrenadores />;
    default:
      return <div className="p-6">Vista no disponible</div>;
  }
}
