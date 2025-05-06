import { useState, useEffect } from 'react';
import { Calendar, Clock, Users, MapPin, CheckCircle, X, ChevronLeft, ChevronRight, Search, Download, Loader2, CheckSquare } from 'lucide-react';

export default function MisClasesEntrenador() {
  const [selectedClass, setSelectedClass] = useState(null);
  const [showAttendance, setShowAttendance] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [attendanceStats, setAttendanceStats] = useState({ present: 0, absent: 0, total: 0 });
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState([]);

  // Función para obtener las clases del día
  const getClasesDelDia = async (fecha) => {
    setLoading(true);
    try {
      // Aquí iría la llamada a la API para obtener las clases
      // Por ahora usamos datos de ejemplo
      const clasesDelDia = [
        {
          id: 1,
          nombre: 'Yoga',
          horario: '08:00 - 09:00',
          dias: ['lunes', 'miercoles', 'viernes'],
          ubicacion: 'Sala 1',
          inscritos: 12,
          capacidad: 20,
          alumnos: [
            { id: 1, nombre: 'Juan Pérez', asistencia: null, foto: null },
            { id: 2, nombre: 'María García', asistencia: null, foto: null },
            { id: 3, nombre: 'Carlos López', asistencia: null, foto: null },
          ]
        },
        {
          id: 2,
          nombre: 'Spinning',
          horario: '10:00 - 11:00',
          dias: ['martes', 'jueves'],
          ubicacion: 'Sala 2',
          inscritos: 15,
          capacidad: 15,
          alumnos: [
            { id: 4, nombre: 'Ana Martínez', asistencia: null, foto: null },
            { id: 5, nombre: 'Pedro Sánchez', asistencia: null, foto: null },
            { id: 6, nombre: 'Laura Torres', asistencia: null, foto: null },
          ]
        }
      ];
      setClasses(clasesDelDia);
    } catch (error) {
      console.error('Error al obtener clases:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar clases cuando cambia la fecha
  useEffect(() => {
    getClasesDelDia(currentDate);
  }, [currentDate]);

  const handleAttendance = async (alumnoId, asistencia) => {
    if (!selectedClass) return;
    
    try {
      // Aquí iría la llamada a la API para actualizar la asistencia
      const updatedClass = {
        ...selectedClass,
        alumnos: selectedClass.alumnos.map(alumno => 
          alumno.id === alumnoId ? { ...alumno, asistencia } : alumno
        )
      };
      
      setSelectedClass(updatedClass);
      updateAttendanceStats(updatedClass.alumnos);
    } catch (error) {
      console.error('Error al actualizar asistencia:', error);
    }
  };

  const updateAttendanceStats = (alumnos) => {
    const stats = alumnos.reduce((acc, alumno) => {
      if (alumno.asistencia === true) acc.present++;
      if (alumno.asistencia === false) acc.absent++;
      return acc;
    }, { present: 0, absent: 0, total: alumnos.length });
    
    setAttendanceStats(stats);
  };

  const handleSaveAttendance = async () => {
    if (!selectedClass) return;
    
    setLoading(true);
    try {
      // Aquí iría la llamada a la API para guardar la asistencia
      await new Promise(resolve => setTimeout(resolve, 1000));
      setShowAttendance(false);
      setSelectedClass(null);
      setAttendanceStats({ present: 0, absent: 0, total: 0 });
      // Recargar clases después de guardar
      await getClasesDelDia(currentDate);
    } catch (error) {
      console.error('Error al guardar asistencia:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const getDayName = (date) => {
    return new Intl.DateTimeFormat('es-ES', { weekday: 'long' }).format(date).toLowerCase();
  };

  const handlePreviousDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const filteredClasses = classes.filter(clase => {
    const currentDay = getDayName(currentDate);
    const matchesDay = clase.dias.includes(currentDay);
    const matchesSearch = clase.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         clase.ubicacion.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesDay && matchesSearch;
  });

  useEffect(() => {
    if (selectedClass) {
      updateAttendanceStats(selectedClass.alumnos);
    }
  }, [selectedClass]);

  return (
    <div className="p-4 md:p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis Clases</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gestiona tus clases y toma asistencia
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handlePreviousDay}
            className="p-2 text-gray-600 hover:text-gray-900 bg-white rounded-lg shadow-sm hover:shadow transition-all"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="px-4 py-2 bg-white rounded-lg shadow-sm">
            <span className="text-sm font-medium text-gray-700">
              {formatDate(currentDate)}
              {isToday(currentDate) && (
                <span className="ml-2 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                  Hoy
                </span>
              )}
            </span>
          </div>
          <button 
            onClick={handleNextDay}
            className="p-2 text-gray-600 hover:text-gray-900 bg-white rounded-lg shadow-sm hover:shadow transition-all"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar clase por nombre o ubicación..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center transition-colors duration-200">
            <Download className="h-4 w-4 mr-2" />
            Exportar Horario
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
        </div>
      ) : filteredClasses.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No hay clases programadas</h3>
          <p className="mt-1 text-sm text-gray-500">
            No hay clases programadas para el día {formatDate(currentDate)}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredClasses.map((clase) => (
            <div key={clase.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all">
              <div className="p-4 md:p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{clase.nombre}</h3>
                    <p className="text-sm text-gray-500">Entrenador</p>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    {clase.inscritos}/{clase.capacidad}
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{clase.horario}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{clase.dias.join(', ')}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{clase.ubicacion}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{clase.inscritos} inscritos</span>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    onClick={() => {
                      setSelectedClass(clase);
                      setShowAttendance(true);
                    }}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    Tomar Asistencia
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Asistencia */}
      {showAttendance && selectedClass && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-40">
          <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-2xl relative animate-fade-in">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
              <h3 className="text-xl font-bold flex items-center gap-2 text-gray-900">
                <CheckSquare className="h-5 w-5 text-blue-600" />
                Asistencia - {selectedClass.nombre}
              </h3>
              <button 
                onClick={() => setShowAttendance(false)}
                className="text-gray-400 hover:text-gray-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-green-800">Presentes</p>
                  <p className="text-2xl font-bold text-green-600">{attendanceStats.present}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-red-800">Ausentes</p>
                  <p className="text-2xl font-bold text-red-600">{attendanceStats.absent}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-blue-800">Total</p>
                  <p className="text-2xl font-bold text-blue-600">{attendanceStats.total}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {selectedClass.alumnos.map((alumno) => (
                <div key={alumno.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500 font-medium">
                        {alumno.nombre.charAt(0)}
                      </span>
                    </div>
                    <span className="ml-4 font-medium text-gray-900">{alumno.nombre}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAttendance(alumno.id, true)}
                      className={`px-3 py-1 rounded-md text-sm font-medium ${
                        alumno.asistencia === true
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-600 hover:bg-green-50'
                      }`}
                    >
                      Presente
                    </button>
                    <button
                      onClick={() => handleAttendance(alumno.id, false)}
                      className={`px-3 py-1 rounded-md text-sm font-medium ${
                        alumno.asistencia === false
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-600 hover:bg-red-50'
                      }`}
                    >
                      Ausente
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowAttendance(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveAttendance}
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