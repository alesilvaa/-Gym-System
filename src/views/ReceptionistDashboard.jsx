import { useState, useEffect } from 'react';
import { 
  Users, Calendar, Clock, CheckSquare, 
  AlertTriangle, ChevronLeft, ChevronRight,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Datos de ejemplo
const clasesHoy = [
  { id: 1, nombre: 'Yoga', instructor: 'María Pérez', hora: '08:00', alumnos: 15, capacidad: 20 },
  { id: 2, nombre: 'Spinning', instructor: 'Juan Gómez', hora: '10:00', alumnos: 12, capacidad: 15 },
  { id: 3, nombre: 'CrossFit', instructor: 'Pedro López', hora: '18:00', alumnos: 10, capacidad: 12 },
];

const pagosPendientes = [
  { id: 1, alumno: 'Carlos Ramírez', vencimiento: '28/04/2025', diasVencido: 2 },
  { id: 2, alumno: 'Ana Silva', vencimiento: '27/04/2025', diasVencido: 3 },
  { id: 3, alumno: 'Juan Martínez', vencimiento: '26/04/2025', diasVencido: 4 },
];

export default function ReceptionistDashboard() {
  const [currentDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  // Saludo dinámico según la hora
  const getSaludo = () => {
    const hora = new Date().getHours();
    if (hora >= 6 && hora < 12) return 'Buenos Días';
    if (hora >= 12 && hora < 19) return 'Buenas Tardes';
    return 'Buenas Noches';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      {/* Header personalizado de saludo */}
      <div className="mb-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 shadow-md">
        <div className="flex flex-col space-y-1">
          <h2 className="text-3xl font-bold text-white">
            {getSaludo()}{currentUser?.nombre ? ` ${currentUser.nombre}!` : ''}
          </h2>
          <p className="text-blue-100 text-base">
            {formatDate(currentDate)}
          </p>
        </div>
      </div>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Panel de Recepción</h1>
        </div>
        {pagosPendientes.length > 0 && (
          <div className="flex space-x-3">
            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-3 group">
              <div className="bg-white/20 p-2 rounded-full">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium opacity-90">Pagos Pendientes</span>
                <span className="text-xl font-bold">{pagosPendientes.length}</span>
              </div>
              <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-sm">→</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* KPIs Principales */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white overflow-hidden shadow-xl rounded-xl hover:shadow-2xl transition-all duration-300 border border-gray-100">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-3">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5">
                  <dt className="text-sm font-medium text-gray-500">Alumnos Activos</dt>
                  <dd className="text-3xl font-bold text-gray-900">248</dd>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow-xl rounded-xl hover:shadow-2xl transition-all duration-300 border border-gray-100">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-3">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5">
                  <dt className="text-sm font-medium text-gray-500">Clases Hoy</dt>
                  <dd className="text-3xl font-bold text-gray-900">8</dd>
                </div>
              </div>
              <div className="flex items-center text-gray-500">
                <span className="text-sm">4 completadas</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-xl rounded-xl hover:shadow-2xl transition-all duration-300 border border-gray-100">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-3">
                  <CheckSquare className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5">
                  <dt className="text-sm font-medium text-gray-500">Asistencias Hoy</dt>
                  <dd className="text-3xl font-bold text-gray-900">42</dd>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Clases del Día */}
      <div className="bg-white shadow-xl rounded-xl p-6 hover:shadow-2xl transition-all duration-300 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Clases del Día</h2>
            <p className="text-sm text-gray-500">Programación de clases para hoy</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Clase
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Instructor
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hora
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Asistencia
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {clasesHoy.map((clase) => (
                <tr key={clase.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{clase.nombre}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{clase.instructor}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{clase.hora}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {clase.alumnos}/{clase.capacidad}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 