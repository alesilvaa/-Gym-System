import { useState, useEffect } from 'react';
import { Calendar, Plus, Clock, Users, Search, Filter, Download, Upload, MapPin, ChevronLeft, ChevronRight, X, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { classesService } from '../services/api';

// Datos de ejemplo
const misClases = [
  {
    id: 1,
    nombre: 'Yoga',
    horario: '08:00 - 09:00',
    dias: ['Lunes', 'Miércoles', 'Viernes'],
    entrenador: 'María Pérez',
    ubicacion: 'Sala 1',
    inscritos: 12,
    capacidad: 20,
    estado: 'Activa',
    fechaInicio: '2024-04-01',
    fechaFin: '2024-04-30'
  },
  {
    id: 2,
    nombre: 'Spinning',
    horario: '10:00 - 11:00',
    dias: ['Martes', 'Jueves'],
    entrenador: 'José Gómez',
    ubicacion: 'Sala 2',
    inscritos: 15,
    capacidad: 15,
    estado: 'Activa',
    fechaInicio: '2024-04-01',
    fechaFin: '2024-04-30'
  },
  {
    id: 3,
    nombre: 'CrossFit',
    horario: '18:00 - 19:00',
    dias: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
    entrenador: 'Laura Benítez',
    ubicacion: 'Sala 3',
    inscritos: 8,
    capacidad: 12,
    estado: 'Activa',
    fechaInicio: '2024-04-01',
    fechaFin: '2024-04-30'
  }
];

const clasesDisponibles = [
  {
    id: 4,
    nombre: 'Pilates',
    horario: '17:00 - 18:00',
    dias: ['Lunes', 'Miércoles', 'Viernes'],
    entrenador: 'Laura Martínez',
    cupos: 5,
    estado: 'Disponible',
    fechaInicio: '2024-04-01',
    fechaFin: '2024-04-30',
    descripcion: 'Clase de Pilates para mejorar la postura y flexibilidad',
    requisitos: 'Mat de yoga, ropa cómoda',
    nivel: 'Intermedio'
  }
];

export default function MisClases() {
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('grid'); // 'grid', 'list', or 'calendar'
  const [selectedClase, setSelectedClase] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showInscripcionModal, setShowInscripcionModal] = useState(false);
  const [selectedClaseForAction, setSelectedClaseForAction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState([]);
  const [error, setError] = useState(null);

  // Función para obtener las clases
  const getClases = async () => {
    setLoading(true);
    setError(null);
    try {
      const clasesData = await classesService.getAll();
      // Filtrar solo las clases activas y con cupos disponibles
      const clasesFiltradas = clasesData.filter(clase => 
        clase.estado === 'Activa' && 
        clase.inscritos < clase.capacidad
      );
      setClasses(clasesFiltradas);
    } catch (error) {
      console.error('Error al obtener clases:', error);
      setError('Error al cargar las clases. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Cargar clases al montar el componente
  useEffect(() => {
    getClases();
  }, []);

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
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

  const getClasesForDate = (date) => {
    const dayName = new Intl.DateTimeFormat('es-ES', { weekday: 'long' }).format(date);
    return classes.filter(clase => clase.dias.includes(dayName));
  };

  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const filteredClases = classes.filter(clase =>
    clase.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    clase.entrenador.toLowerCase().includes(searchTerm.toLowerCase()) ||
    clase.ubicacion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCancelarInscripcion = async (clase) => {
    setSelectedClaseForAction(clase);
    setShowCancelModal(true);
  };

  const handleInscribirse = async (clase) => {
    if (clase.inscritos >= clase.capacidad) {
      setError('Lo sentimos, esta clase ya no tiene cupos disponibles.');
      return;
    }
    setSelectedClaseForAction(clase);
    setShowInscripcionModal(true);
  };

  const confirmarCancelacion = async () => {
    if (!selectedClaseForAction) return;
    
    setLoading(true);
    try {
      await classesService.cancelarInscripcion(selectedClaseForAction.id, currentUser.id);
      setShowCancelModal(false);
      setSelectedClaseForAction(null);
      await getClases();
    } catch (error) {
      console.error('Error al cancelar inscripción:', error);
      setError('Error al cancelar la inscripción. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const confirmarInscripcion = async () => {
    if (!selectedClaseForAction) return;
    
    setLoading(true);
    try {
      await classesService.inscribirse(selectedClaseForAction.id, currentUser.id);
      setShowInscripcionModal(false);
      setSelectedClaseForAction(null);
      await getClases();
    } catch (error) {
      console.error('Error al inscribirse:', error);
      setError('Error al inscribirse a la clase. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const renderCalendarView = () => {
    const clasesDelDia = getClasesForDate(currentDate);
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
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

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
          </div>
        ) : clasesDelDia.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No hay clases programadas</h3>
            <p className="mt-1 text-sm text-gray-500">
              No hay clases programadas para el día {formatDate(currentDate)}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {clasesDelDia.map((clase) => (
              <div key={clase.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 font-medium">
                        {clase.nombre.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{clase.nombre}</h3>
                      <div className="mt-1 flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        {clase.horario} • {clase.entrenador}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      clase.inscritos < clase.capacidad ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {clase.inscritos}/{clase.capacidad}
                    </span>
                    {clase.inscritos < clase.capacidad ? (
                      <button
                        onClick={() => handleInscribirse(clase)}
                        className="px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-700"
                      >
                        Inscribirse
                      </button>
                    ) : (
                      <span className="text-sm text-gray-500">Sin cupos</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-4 md:p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis Clases</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gestiona tus clases y horarios
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="flex gap-2">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'bg-white text-gray-600'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'bg-white text-gray-600'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <button 
              onClick={() => setViewMode('calendar')}
              className={`p-2 rounded-lg ${viewMode === 'calendar' ? 'bg-blue-100 text-blue-600' : 'bg-white text-gray-600'}`}
            >
              <Calendar className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar clase por nombre, entrenador o ubicación..."
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

      {/* Main Content */}
      {viewMode === 'calendar' ? (
        renderCalendarView()
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            </div>
          ) : filteredClases.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No se encontraron clases</h3>
              <p className="mt-1 text-sm text-gray-500">
                No hay clases que coincidan con tu búsqueda
              </p>
            </div>
          ) : (
            filteredClases.map((clase) => (
              <div key={clase.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{clase.nombre}</h3>
                      <p className="text-sm text-gray-500">{clase.entrenador}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                        clase.inscritos < clase.capacidad ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {clase.inscritos}/{clase.capacidad}
                      </span>
                      <span className="text-xs text-gray-500 mt-1">
                        {clase.inscritos < clase.capacidad ? 'Cupos disponibles' : 'Sin cupos'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>{clase.horario}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{clase.dias.join(', ')}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{clase.ubicacion}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-2" />
                      <span>{clase.inscritos} inscritos</span>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    {clase.inscritos < clase.capacidad ? (
                      <button
                        onClick={() => handleInscribirse(clase)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Inscribirse
                      </button>
                    ) : (
                      <span className="text-sm text-gray-500 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Sin cupos disponibles
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal de Cancelación */}
      {showCancelModal && selectedClaseForAction && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-40">
          <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md relative animate-fade-in">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                Cancelar Inscripción
              </h3>
              <button 
                onClick={() => setShowCancelModal(false)}
                className="text-gray-400 hover:text-gray-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-gray-600 mb-6">
              ¿Estás seguro que deseas cancelar tu inscripción a la clase de {selectedClaseForAction.nombre}?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                No, mantener inscripción
              </button>
              <button
                onClick={confirmarCancelacion}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Cancelando...
                  </>
                ) : (
                  'Sí, cancelar inscripción'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Inscripción */}
      {showInscripcionModal && selectedClaseForAction && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-40">
          <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md relative animate-fade-in">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                Inscribirse a Clase
              </h3>
              <button 
                onClick={() => setShowInscripcionModal(false)}
                className="text-gray-400 hover:text-gray-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-medium text-gray-900">{selectedClaseForAction.nombre}</h4>
                <p className="text-sm text-gray-500">{selectedClaseForAction.entrenador}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>{selectedClaseForAction.horario}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{selectedClaseForAction.dias.join(', ')}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{selectedClaseForAction.ubicacion}</span>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-blue-800">
                    Cupos disponibles
                  </p>
                  <span className="text-sm font-medium text-blue-800">
                    {selectedClaseForAction.capacidad - selectedClaseForAction.inscritos} de {selectedClaseForAction.capacidad}
                  </span>
                </div>
                <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(selectedClaseForAction.inscritos / selectedClaseForAction.capacidad) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowInscripcionModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarInscripcion}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Inscribiendo...
                  </>
                ) : (
                  'Confirmar Inscripción'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 