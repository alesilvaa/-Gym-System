import { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Plus, Search, Filter, Download, Upload, X, CheckCircle, AlertTriangle, Edit2, Trash2, CreditCard } from 'lucide-react';
import { classesService } from '../services/api';
import { useApp } from '../context/AppContext';
import { useEntrenadores } from '../context/EntrenadoresContext';

// Días de la semana
const diasSemana = [
  { id: 'lunes', label: 'Lunes' },
  { id: 'martes', label: 'Martes' },
  { id: 'miercoles', label: 'Miércoles' },
  { id: 'jueves', label: 'Jueves' },
  { id: 'viernes', label: 'Viernes' },
  { id: 'sabado', label: 'Sábado' },
  { id: 'domingo', label: 'Domingo' }
];

function Toast({ message, type, onClose }) {
  return (
    <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded shadow-lg flex items-center gap-2 ${type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
      {type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 text-lg font-bold">×</button>
    </div>
  );
}

export default function Clases() {
  const { classes, loading: contextLoading, error: contextError, updateClasses } = useApp();
  const { entrenadores } = useEntrenadores();
  const [showForm, setShowForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [claseToDelete, setClaseToDelete] = useState(null);
  const [editingClase, setEditingClase] = useState(null);
  const [form, setForm] = useState({
    nombre: '',
    instructor: '',
    horaInicio: '',
    horaFin: '',
    capacidad: '',
    nivel: 'Principiante',
    estado: 'Activa',
    dias: [],
    membresiasPermitidas: []
  });
  const [formError, setFormError] = useState('');
  const [toast, setToast] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [membresias, setMembresias] = useState([]);

  // Cargar datos iniciales
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const clasesData = await classesService.getAll();
      const storedMembresias = localStorage.getItem('membresias');
      const membresiasData = storedMembresias ? JSON.parse(storedMembresias) : [];
      
      // Asegurarnos de que los entrenadores estén cargados
      const storedEntrenadores = localStorage.getItem('entrenadores');
      if (storedEntrenadores) {
        const entrenadoresData = JSON.parse(storedEntrenadores);
        if (entrenadoresData.length === 0) {
          // Si no hay entrenadores, agregar los iniciales
          const initialEntrenadores = [
            { id: 1, nombre: 'María Pérez', email: 'maria.entrenadora@email.com', especialidad: 'Yoga', telefono: '0981 123 456', estado: 'Activo' },
            { id: 2, nombre: 'Juan Gómez', email: 'juan.gomez@email.com', especialidad: 'Spinning', telefono: '0982 654 321', estado: 'Activo' },
          ];
          localStorage.setItem('entrenadores', JSON.stringify(initialEntrenadores));
        }
      }
      
      updateClasses(clasesData);
      setMembresias(membresiasData);
    } catch (error) {
      showToast('Error al cargar los datos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleOpenForm = (clase = null) => {
    setEditingClase(clase);
    setForm(clase ? {
      ...clase,
      instructor: entrenadores.find(t => t.nombre === clase.instructor)?.id || '',
      dias: Array.isArray(clase.dias) ? clase.dias : [],
      estado: clase.estado || 'Activa',
      membresiasPermitidas: clase.membresiasPermitidas || []
    } : {
      nombre: '',
      instructor: '',
      horaInicio: '',
      horaFin: '',
      capacidad: '',
      nivel: 'Principiante',
      estado: 'Activa',
      dias: [],
      membresiasPermitidas: []
    });
    setFormError('');
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingClase(null);
    setFormError('');
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleDiasChange = (diaId) => {
    setForm(prev => {
      const currentDias = prev.dias || [];
      const dias = currentDias.includes(diaId)
        ? currentDias.filter(d => d !== diaId)
        : [...currentDias, diaId];
      return { ...prev, dias };
    });
  };

  const handleMembresiasChange = (membresiaId) => {
    setForm(prev => {
      const currentMembresias = prev.membresiasPermitidas || [];
      const membresias = currentMembresias.includes(membresiaId)
        ? currentMembresias.filter(m => m !== membresiaId)
        : [...currentMembresias, membresiaId];
      return { ...prev, membresiasPermitidas: membresias };
    });
  };

  const validateForm = () => {
    if (!form.nombre) return 'El nombre es obligatorio';
    if (!form.horaInicio) return 'Debe seleccionar una hora de inicio';
    if (!form.horaFin) return 'Debe seleccionar una hora de fin';
    if (!form.capacidad) return 'La capacidad es obligatoria';
    if (!form.dias.length) return 'Debe seleccionar al menos un día';
    if (!form.membresiasPermitidas.length) return 'Debe seleccionar al menos una membresía';
    return '';
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
      const selectedTrainer = form.instructor ? entrenadores.find(t => t.id === parseInt(form.instructor)) : null;
      const claseData = {
        ...form,
        instructor: selectedTrainer?.nombre || 'Sin asignar',
        capacidad: parseInt(form.capacidad),
        dias: Array.isArray(form.dias) ? form.dias : [],
        estado: form.estado,
        membresiasPermitidas: Array.isArray(form.membresiasPermitidas) ? form.membresiasPermitidas : []
      };

      if (editingClase) {
        await classesService.update(editingClase.id, claseData);
        showToast('Clase actualizada exitosamente', 'success');
      } else {
        await classesService.create(claseData);
        showToast('Clase creada exitosamente', 'success');
      }

      await loadData();
      handleCloseForm();
    } catch (error) {
      showToast(error.message || 'Error al guardar la clase', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (clase) => {
    try {
      setLoading(true);
      await classesService.delete(clase.id);
      showToast('Clase eliminada exitosamente', 'success');
      await updateClasses();
      setShowDeleteConfirm(false);
      setClaseToDelete(null);
    } catch (error) {
      showToast(error.message || 'Error al eliminar la clase', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredClases = classes.filter(clase =>
    clase.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    clase.instructor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDias = (dias) => {
    if (!dias) return '';
    if (typeof dias === 'string') {
      return dias;
    }
    if (!Array.isArray(dias)) {
      return '';
    }
    return dias
      .map(dia => diasSemana.find(d => d.id === dia)?.label)
      .filter(Boolean)
      .join(', ');
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clases</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gestiona las clases y horarios del gimnasio
          </p>
        </div>
        <button 
          onClick={() => handleOpenForm()}
          className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center transition-colors duration-200 shadow-sm"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nueva Clase
        </button>
      </div>

      <div className="bg-white shadow-sm rounded-xl overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar por nombre de clase o instructor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center transition-colors duration-200">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Clase
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Instructor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Horario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Días
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Membresías
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredClases.map((clase) => (
                <tr key={clase.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {clase.nombre}
                        </div>
                        <div className="text-sm text-gray-500">
                          {clase.nivel} · {clase.capacidad} personas
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{clase.instructor}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {clase.horaInicio} - {clase.horaFin}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {formatDias(clase.dias)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {clase.membresiasPermitidas?.map(membresiaId => {
                        const membresia = membresias.find(m => m.id === membresiaId);
                        return membresia ? (
                          <span
                            key={membresiaId}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            <CreditCard className="w-3 h-3 mr-1" />
                            {membresia.nombre}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        clase.estado === 'Activa'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {clase.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleOpenForm(clase)}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Edit2 className="h-4 w-4 mr-1.5" />
                      Editar
                    </button>
                    <button
                      onClick={() => {
                        setClaseToDelete(clase);
                        setShowDeleteConfirm(true);
                      }}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <Trash2 className="h-4 w-4 mr-1.5" />
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Formulario */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8 border-b pb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingClase ? 'Editar Clase' : 'Nueva Clase'}
                  </h2>
                  <p className="mt-2 text-sm text-gray-500">
                    {editingClase ? 'Modifica los detalles de la clase existente' : 'Completa los detalles para crear una nueva clase'}
                  </p>
                </div>
                <button 
                  onClick={handleCloseForm} 
                  className="text-gray-400 hover:text-gray-500 transition-colors duration-200"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-8">
                {/* Información Básica */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                    Información Básica
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre de la Clase
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        type="text"
                        id="nombre"
                        name="nombre"
                        value={form.nombre}
                        onChange={handleFormChange}
                        placeholder="Ej: Yoga Flow, Spinning, etc."
                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
                      />
                    </div>

                    <div>
                      <label htmlFor="instructor" className="block text-sm font-medium text-gray-700 mb-1">
                        Instructor
                      </label>
                      <select
                        id="instructor"
                        name="instructor"
                        value={form.instructor}
                        onChange={handleFormChange}
                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
                      >
                        <option value="">Sin asignar</option>
                        {entrenadores.map(trainer => (
                          <option key={trainer.id} value={trainer.id}>
                            {trainer.nombre}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="nivel" className="block text-sm font-medium text-gray-700 mb-1">
                        Nivel
                      </label>
                      <select
                        id="nivel"
                        name="nivel"
                        value={form.nivel}
                        onChange={handleFormChange}
                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
                      >
                        <option value="Principiante">Principiante</option>
                        <option value="Intermedio">Intermedio</option>
                        <option value="Avanzado">Avanzado</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="capacidad" className="block text-sm font-medium text-gray-700 mb-1">
                        Capacidad
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        type="number"
                        id="capacidad"
                        name="capacidad"
                        value={form.capacidad}
                        onChange={handleFormChange}
                        min="1"
                        placeholder="Número máximo de participantes"
                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
                      />
                    </div>
                  </div>
                </div>

                {/* Horario y Días */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-blue-600" />
                    Horario y Días
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="horaInicio" className="block text-sm font-medium text-gray-700 mb-1">
                        Hora de inicio
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        type="time"
                        id="horaInicio"
                        name="horaInicio"
                        value={form.horaInicio}
                        onChange={handleFormChange}
                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
                      />
                    </div>
                    <div>
                      <label htmlFor="horaFin" className="block text-sm font-medium text-gray-700 mb-1">
                        Hora de fin
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        type="time"
                        id="horaFin"
                        name="horaFin"
                        value={form.horaFin}
                        onChange={handleFormChange}
                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Días de clase
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {diasSemana.map(dia => (
                        <label 
                          key={dia.id} 
                          className={`inline-flex items-center p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                            form.dias.includes(dia.id)
                              ? 'border-blue-500 bg-blue-50 shadow-sm'
                              : 'border-gray-200 hover:border-blue-200 hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={form.dias.includes(dia.id)}
                            onChange={() => handleDiasChange(dia.id)}
                            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm font-medium text-gray-700">{dia.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Estado */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-6">
                    <AlertTriangle className="h-5 w-5 mr-2 text-blue-600" />
                    Estado
                  </h3>
                  <div>
                    <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-1">
                      Estado de la Clase
                    </label>
                    <select
                      id="estado"
                      name="estado"
                      value={form.estado}
                      onChange={handleFormChange}
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
                    >
                      <option value="Activa">Activa</option>
                      <option value="Inactiva">Inactiva</option>
                    </select>
                  </div>
                </div>

                {/* Planes */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-6">
                    <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
                    Planes Permitidos
                  </h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Selecciona los planes que pueden acceder a esta clase
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-2">
                      {membresias.map(membresia => (
                        <label 
                          key={membresia.id} 
                          className={`inline-flex items-center p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                            form.membresiasPermitidas.includes(membresia.id)
                              ? 'border-blue-500 bg-blue-50 shadow-sm'
                              : 'border-gray-200 hover:border-blue-200 hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={form.membresiasPermitidas.includes(membresia.id)}
                            onChange={() => handleMembresiasChange(membresia.id)}
                            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                          <div className="ml-3">
                            <span className="text-sm font-medium text-gray-900">
                              {membresia.nombre}
                            </span>
                            <span className="text-xs text-gray-500 block mt-0.5">
                              {membresia.descripcion}
                            </span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {formError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
                    <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5 mr-2" />
                    <span className="text-sm text-red-600">{formError}</span>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-6 border-t">
                  <button
                    type="button"
                    onClick={handleCloseForm}
                    className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200 font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center font-medium"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {editingClase ? 'Guardar cambios' : 'Crear clase'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">
                  Confirmar eliminación
                </h3>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                ¿Estás seguro de que deseas eliminar la clase "{claseToDelete?.nombre}"? Esta acción no se puede deshacer.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setClaseToDelete(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(claseToDelete)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  disabled={loading}
                >
                  {loading ? 'Eliminando...' : 'Eliminar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast de notificación */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
  