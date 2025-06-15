import { useState, useEffect } from 'react';
import { 
  CheckSquare, Clock, Plus, Search, Filter, Download, Upload, 
  Users, Calendar, ChevronLeft, ChevronRight, X, CheckCircle, 
  AlertTriangle, Loader2, BarChart2, TrendingUp, UserCheck, Edit2, Trash2 
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { attendanceService, classesService, studentsService } from '../services/api';
import { useApp } from '../context/AppContext';

// Datos de ejemplo
const asistenciaData = [
  { name: 'Lun', asistencias: 45, esperado: 50 },
  { name: 'Mar', asistencias: 38, esperado: 50 },
  { name: 'Mié', asistencias: 42, esperado: 50 },
  { name: 'Jue', asistencias: 50, esperado: 50 },
  { name: 'Vie', asistencias: 55, esperado: 50 },
  { name: 'Sáb', asistencias: 35, esperado: 40 },
  { name: 'Dom', asistencias: 20, esperado: 30 },
];

const clases = [
  { id: 1, nombre: 'Yoga', instructor: 'María Pérez', capacidad: 20, hora: '08:00' },
  { id: 2, nombre: 'Spinning', instructor: 'Juan Gómez', capacidad: 15, hora: '10:00' },
  { id: 3, nombre: 'CrossFit', instructor: 'Pedro López', capacidad: 12, hora: '18:00' },
];

export default function Asistencia() {
  const { 
    attendance = [], 
    students = [], 
    classes = [], 
    loading: contextLoading, 
    error: contextError, 
    updateAttendance 
  } = useApp();
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState(null);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [attendanceData, setAttendanceData] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    presentes: 0,
    ausentes: 0
  });

  // Cargar clases del día seleccionado
  useEffect(() => {
    const loadClassesForDate = async () => {
      setLoading(true);
      try {
        const dayName = new Date(selectedDate).toLocaleDateString('es-ES', { weekday: 'long' }).toLowerCase();
        const classesForDay = classes.filter(clase => 
          clase.dias.includes(dayName) && clase.estado === 'Activa'
        );
        setAttendanceData(classesForDay);
      } catch (error) {
        console.error('Error al cargar clases:', error);
      } finally {
        setLoading(false);
      }
    };

    loadClassesForDate();
  }, [selectedDate, classes]);

  const handleDateChange = (days) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate.toISOString().split('T')[0]);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const handleTakeAttendance = async (clase) => {
    setSelectedClass(clase);
    setShowAttendanceModal(true);
  };

  const handleSaveAttendance = async (attendanceRecords) => {
    if (!selectedClass) return;

    try {
      setLoading(true);
      // Guardar asistencia para cada alumno
      for (const record of attendanceRecords) {
        await attendanceService.create({
          claseId: selectedClass.id,
          alumnoId: record.alumnoId,
          fecha: selectedDate,
          estado: record.estado,
          hora: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
        });
      }
      
      await updateAttendance();
      setShowAttendanceModal(false);
      setSelectedClass(null);
    } catch (error) {
      console.error('Error al guardar asistencia:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredClasses = attendanceData.filter(clase =>
    clase.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    clase.instructor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (contextError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error al cargar los datos
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{contextError}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Control de Asistencia</h1>
          <p className="text-sm text-gray-500 mt-1">Gestiona la asistencia de tus clases</p>
        </div>
      </div>

      {/* Selector de fecha */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => handleDateChange(-1)}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <span className="text-lg font-medium">
              {formatDate(new Date(selectedDate))}
              {isToday(new Date(selectedDate)) && (
                <span className="ml-2 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                  Hoy
                </span>
              )}
            </span>
          </div>
          <button 
            onClick={() => handleDateChange(1)}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Lista de clases */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-gray-900">
            Clases del {formatDate(new Date(selectedDate))}
          </h2>
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar clase..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
          </div>
        ) : filteredClasses.length === 0 ? (
          <div className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No hay clases programadas</h3>
            <p className="mt-1 text-sm text-gray-500">
              No hay clases programadas para el día {formatDate(new Date(selectedDate))}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClasses.map((clase) => (
              <div key={clase.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{clase.nombre}</h3>
                    <p className="text-sm text-gray-500">{clase.instructor}</p>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                    {clase.inscritos}/{clase.capacidad} alumnos
                  </span>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    {clase.horaInicio} - {clase.horaFin}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-2" />
                    {clase.nivel}
                  </div>
                </div>
                <button
                  onClick={() => handleTakeAttendance(clase)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center"
                >
                  <CheckSquare className="h-4 w-4 mr-2" />
                  Tomar Asistencia
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Asistencia */}
      {showAttendanceModal && selectedClass && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-40">
          <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
              <h3 className="text-xl font-bold flex items-center gap-2 text-gray-900">
                <CheckSquare className="h-5 w-5 text-blue-600" />
                Tomar Asistencia - {selectedClass.nombre}
              </h3>
              <button 
                onClick={() => setShowAttendanceModal(false)}
                className="text-gray-400 hover:text-gray-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {selectedClass.alumnos?.map((alumno) => (
                <div key={alumno.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      {alumno.foto ? (
                        <img
                          className="h-10 w-10 rounded-full"
                          src={alumno.foto}
                          alt={alumno.nombre}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500 font-medium">
                            {alumno.nombre.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {alumno.nombre}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveAttendance([{ alumnoId: alumno.id, estado: 'Presente' }])}
                      className="px-3 py-1 text-sm font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200"
                    >
                      Presente
                    </button>
                    <button
                      onClick={() => handleSaveAttendance([{ alumnoId: alumno.id, estado: 'Ausente' }])}
                      className="px-3 py-1 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200"
                    >
                      Ausente
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowAttendanceModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleSaveAttendance(selectedClass.alumnos.map(alumno => ({
                  alumnoId: alumno.id,
                  estado: alumno.asistencia ? 'Presente' : 'Ausente'
                })))}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  'Guardar Asistencia'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
  