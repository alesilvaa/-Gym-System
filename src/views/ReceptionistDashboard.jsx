import { useState, useEffect } from 'react';
import { 
  Users, Calendar, Clock, CheckSquare, 
  AlertTriangle, ChevronLeft, ChevronRight 
} from 'lucide-react';

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

const asistenciasHoy = [
  { id: 1, alumno: 'Carlos Ramírez', clase: 'Yoga', hora: '08:00', estado: 'Presente' },
  { id: 2, alumno: 'Ana Silva', clase: 'Spinning', hora: '10:00', estado: 'Presente' },
  { id: 3, alumno: 'Juan Martínez', clase: 'CrossFit', hora: '18:00', estado: 'Ausente' },
];

export default function ReceptionistDashboard() {
  const [currentDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Panel de Recepción</h1>
          <p className="text-gray-600 mt-1">{formatDate(currentDate)}</p>
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-red-100 text-red-700 rounded-lg flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2" />
            {pagosPendientes.length} Pagos Pendientes
          </button>
        </div>
      </div>

      {/* KPIs Principales */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow-sm rounded-lg hover:shadow-md transition-shadow">
          <div className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-indigo-500 rounded-lg p-3">
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
        
        <div className="bg-white overflow-hidden shadow-sm rounded-lg hover:shadow-md transition-shadow">
          <div className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-yellow-500 rounded-lg p-3">
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
        
        <div className="bg-white overflow-hidden shadow-sm rounded-lg hover:shadow-md transition-shadow">
          <div className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-red-500 rounded-lg p-3">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5">
                  <dt className="text-sm font-medium text-gray-500">Pagos Pendientes</dt>
                  <dd className="text-3xl font-bold text-gray-900">3</dd>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-lg hover:shadow-md transition-shadow">
          <div className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-500 rounded-lg p-3">
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
      <div className="bg-white shadow-sm rounded-lg p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Clases del Día</h2>
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

      {/* Asistencias del Día */}
      <div className="bg-white shadow-sm rounded-lg p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Asistencias del Día</h2>
            <p className="text-sm text-gray-500">Registro de asistencias para hoy</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Alumno
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Clase
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hora
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {asistenciasHoy.map((asistencia) => (
                <tr key={asistencia.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{asistencia.alumno}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{asistencia.clase}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{asistencia.hora}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      asistencia.estado === 'Presente' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {asistencia.estado}
                    </span>
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