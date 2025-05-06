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
  
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    clase: 'todos',
    estado: 'todos',
    instructor: 'todos'
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [asistenciaToDelete, setAsistenciaToDelete] = useState(null);
  const [editingAsistencia, setEditingAsistencia] = useState(null);
  const [form, setForm] = useState({
    claseId: '',
    alumnoId: '',
    fecha: new Date().toISOString().split('T')[0],
    estado: 'Presente',
    observaciones: '',
    hora: ''
  });
  const [formError, setFormError] = useState('');
  const [toast, setToast] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    presentes: 0,
    ausentes: 0,
    tardes: 0
  });

  // Actualizar estadísticas cuando cambian los datos
  useEffect(() => {
    const calculateStats = () => {
      const asistenciasDelDia = attendance.filter(a => a.fecha === selectedDate);
      const total = asistenciasDelDia.length;
      const presentes = asistenciasDelDia.filter(a => a.estado === 'Presente').length;
      const ausentes = asistenciasDelDia.filter(a => a.estado === 'Ausente').length;
      const tardes = asistenciasDelDia.filter(a => a.estado === 'Tarde').length;

      setStats({
        total,
        presentes,
        ausentes,
        tardes
      });
    };

    calculateStats();
  }, [attendance, selectedDate]);

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const error = validateForm();
    if (error) {
      setFormError(error);
      return;
    }

    try {
      setLoading(true);
      const asistenciaData = {
        ...form,
        fecha: selectedDate
      };

      if (editingAsistencia) {
        await attendanceService.update(editingAsistencia.id, asistenciaData);
        showToast('Asistencia actualizada exitosamente', 'success');
      } else {
        await attendanceService.create(asistenciaData);
        showToast('Asistencia registrada exitosamente', 'success');
      }

      await updateAttendance();
      handleCloseForm();
    } catch (error) {
      showToast(error.message || 'Error al guardar la asistencia', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!asistenciaToDelete) return;

    try {
      setLoading(true);
      await attendanceService.delete(asistenciaToDelete.id);
      showToast('Asistencia eliminada exitosamente', 'success');
      await updateAttendance();
      setShowDeleteConfirm(false);
      setAsistenciaToDelete(null);
    } catch (error) {
      showToast(error.message || 'Error al eliminar la asistencia', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

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

  const filteredAsistencias = (attendance || []).filter(asistencia => {
    const alumno = (students || []).find(a => a.id == asistencia.alumnoId);
    const clase = (classes || []).find(c => c.id == asistencia.claseId);
    
    return (
      (!searchTerm || alumno?.nombre.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filters.clase === 'todos' || asistencia.claseId == parseInt(filters.clase)) &&
      (filters.estado === 'todos' || asistencia.estado === filters.estado) &&
      (filters.instructor === 'todos' || clase?.instructorId == parseInt(filters.instructor))
    );
  });

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingAsistencia(null);
    setForm({
      claseId: '',
      alumnoId: '',
      fecha: new Date().toISOString().split('T')[0],
      estado: 'Presente',
      observaciones: '',
      hora: ''
    });
  };

  const validateForm = () => {
    // Implementa la lógica para validar el formulario
    return '';
  };

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
      {/* Header con acciones principales */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Control de Asistencia</h1>
          <p className="text-sm text-gray-500 mt-1">Gestiona y monitorea la asistencia de tus alumnos</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Registrar Asistencia
          </button>
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

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
              <CheckSquare className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Asistencia Hoy</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.presentes}</p>
              <p className="text-sm text-green-600">Presentes</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-red-100 rounded-md p-3">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Ausentes</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.ausentes}</p>
              <p className="text-sm text-red-600">Total ausentes</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
              <TrendingUp className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Tardes</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.tardes}</p>
              <p className="text-sm text-yellow-600">Total tardes</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
              <UserCheck className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Total de asistencias</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
              <p className="text-sm text-purple-600">Total de la semana</p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de asistencias */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-gray-900">
            Asistencias del {formatDate(new Date(selectedDate))}
          </h2>
          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar alumno..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
          </div>
        ) : attendance.length === 0 ? (
          <div className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No hay asistencias registradas</h3>
            <p className="mt-1 text-sm text-gray-500">
              No se han registrado asistencias para el día {formatDate(new Date(selectedDate))}
            </p>
          </div>
        ) : (
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
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAsistencias.map((asistencia) => {
                  const alumnoObj = (students || []).find(a => a.id == asistencia.alumnoId);
                  return (
                    <tr key={asistencia.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {alumnoObj && alumnoObj.foto ? (
                              <img
                                className="h-10 w-10 rounded-full"
                                src={alumnoObj.foto}
                                alt={alumnoObj.nombre}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <span className="text-gray-500 font-medium">
                                  {alumnoObj && alumnoObj.nombre ? alumnoObj.nombre.charAt(0) : '?'}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {alumnoObj && alumnoObj.nombre ? alumnoObj.nombre : 'Alumno no encontrado'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{asistencia.clase}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{asistencia.hora}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          asistencia.estado === 'Presente'
                            ? 'bg-green-100 text-green-800'
                            : asistencia.estado === 'Ausente'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {asistencia.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => {
                            setEditingAsistencia(asistencia);
                            setShowForm(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 mr-2"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setAsistenciaToDelete(asistencia);
                            setShowDeleteConfirm(true);
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Registro de Asistencia */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-40">
          <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md relative animate-fade-in">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
              <h3 className="text-xl font-bold flex items-center gap-2 text-gray-900">
                <CheckSquare className="h-5 w-5 text-blue-600" />
                {editingAsistencia ? 'Actualizar Asistencia' : 'Registrar Asistencia'}
              </h3>
              <button 
                onClick={handleCloseForm}
                className="text-gray-400 hover:text-gray-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Alumno</label>
                <select
                  name="alumnoId"
                  value={form.alumnoId}
                  onChange={handleFormChange}
                  className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                  required
                >
                  <option value="">Seleccionar alumno</option>
                  {students.map(alumno => (
                    <option key={alumno.id} value={alumno.id}>
                      {alumno.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Clase</label>
                <select
                  name="claseId"
                  value={form.claseId}
                  onChange={handleFormChange}
                  className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                  required
                >
                  <option value="">Seleccionar clase</option>
                  {classes.map(clase => (
                    <option key={clase.id} value={clase.id}>
                      {clase.nombre} ({clase.hora}) - {clase.instructor}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fecha</label>
                  <input
                    type="date"
                    name="fecha"
                    value={form.fecha}
                    onChange={handleFormChange}
                    className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hora</label>
                  <input
                    type="time"
                    name="hora"
                    value={form.hora}
                    onChange={handleFormChange}
                    className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                <select
                  name="estado"
                  value={form.estado}
                  onChange={handleFormChange}
                  className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                  required
                >
                  <option value="Presente">Presente</option>
                  <option value="Ausente">Ausente</option>
                  <option value="Tarde">Tarde</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Observaciones</label>
                <textarea
                  name="observaciones"
                  value={form.observaciones}
                  onChange={handleFormChange}
                  className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
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
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Eliminación */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-40">
          <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md relative animate-fade-in">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
              <h3 className="text-xl font-bold flex items-center gap-2 text-gray-900">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Confirmar Eliminación
              </h3>
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="text-gray-400 hover:text-gray-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-gray-700">
              ¿Estás seguro de que quieres eliminar esta asistencia?
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
  