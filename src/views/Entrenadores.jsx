import { useState, useEffect } from 'react';
import { Users, Plus, Edit2, Trash2, X, CheckCircle, AlertTriangle, Search, Filter, ChevronUp, ChevronDown, Loader2 } from 'lucide-react';

const initialEntrenadores = [
  { id: 1, nombre: 'María Pérez', email: 'maria.entrenadora@email.com', especialidad: 'Yoga', telefono: '0981 123 456', estado: 'Activo' },
  { id: 2, nombre: 'Juan Gómez', email: 'juan.gomez@email.com', especialidad: 'Spinning', telefono: '0982 654 321', estado: 'Activo' },
];

const ITEMS_PER_PAGE = 10;

function Toast({ message, type, onClose }) {
  return (
    <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded shadow-lg flex items-center gap-2 ${type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
      {type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 text-lg font-bold">×</button>
    </div>
  );
}

export default function Entrenadores() {
  const [entrenadores, setEntrenadores] = useState(() => {
    const stored = localStorage.getItem('entrenadores');
    return stored ? JSON.parse(stored) : initialEntrenadores;
  });
  const [showForm, setShowForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [entrenadorToDelete, setEntrenadorToDelete] = useState(null);
  const [editingEntrenador, setEditingEntrenador] = useState(null);
  const [form, setForm] = useState({ nombre: '', email: '', especialidad: '', telefono: '', estado: 'Activo' });
  const [formError, setFormError] = useState('');
  const [toast, setToast] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    estado: 'todos',
    especialidad: 'todos'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Sincroniza entrenadores con localStorage
  useEffect(() => {
    localStorage.setItem('entrenadores', JSON.stringify(entrenadores));
  }, [entrenadores]);

  const handleOpenForm = (entrenador = null) => {
    setEditingEntrenador(entrenador);
    setForm(entrenador ? { ...entrenador } : { nombre: '', email: '', especialidad: '', telefono: '', estado: 'Activo' });
    setFormError('');
    setShowForm(true);
    setHasUnsavedChanges(false);
  };

  const handleCloseForm = () => {
    if (hasUnsavedChanges) {
      if (window.confirm('¿Estás seguro de que deseas cerrar? Los cambios no guardados se perderán.')) {
        setShowForm(false);
        setEditingEntrenador(null);
        setFormError('');
        setHasUnsavedChanges(false);
      }
    } else {
      setShowForm(false);
      setEditingEntrenador(null);
      setFormError('');
    }
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setHasUnsavedChanges(true);
  };

  const validateForm = () => {
    const errors = [];
    if (!form.nombre.trim()) errors.push('El nombre es obligatorio');
    if (!form.email.trim()) errors.push('El email es obligatorio');
    if (!form.email.includes('@')) errors.push('Email inválido');
    if (!form.especialidad.trim()) errors.push('La especialidad es obligatoria');
    if (!form.telefono.trim()) errors.push('El teléfono es obligatorio');
    if (!/^\d{4}\s\d{3}\s\d{3}$/.test(form.telefono)) errors.push('Formato de teléfono inválido (ejemplo: 0981 123 456)');
    return errors;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const errors = validateForm();
    
    if (errors.length > 0) {
      setFormError(errors.join(', '));
      setLoading(false);
      return;
    }

    try {
      // Simulamos una operación asíncrona
      await new Promise(resolve => setTimeout(resolve, 500));

      const formData = {
        ...form,
        estado: form.estado || 'Activo' // Ensure estado is always set
      };

      if (editingEntrenador) {
        setEntrenadores(entrenadores.map(e => e.id === editingEntrenador.id ? { ...formData, id: editingEntrenador.id } : e));
        setToast({ message: 'Entrenador actualizado correctamente', type: 'success' });
      } else {
        setEntrenadores([...entrenadores, { ...formData, id: Date.now() }]);
        setToast({ message: 'Entrenador agregado correctamente', type: 'success' });
      }
      setShowForm(false);
      setEditingEntrenador(null);
      setHasUnsavedChanges(false);
    } catch (error) {
      setToast({ message: 'Error al guardar el entrenador', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (entrenador) => {
    setEntrenadorToDelete(entrenador);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    setLoading(true);
    try {
      // Simulamos una operación asíncrona
      await new Promise(resolve => setTimeout(resolve, 500));
      setEntrenadores(entrenadores.filter(e => e.id !== entrenadorToDelete.id));
      setToast({ message: 'Entrenador eliminado correctamente', type: 'success' });
    } catch (error) {
      setToast({ message: 'Error al eliminar el entrenador', type: 'error' });
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
      setEntrenadorToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setEntrenadorToDelete(null);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedData = (data) => {
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  const getFilteredData = (data) => {
    return data.filter(entrenador => {
      const matchesSearch = 
        entrenador.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entrenador.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entrenador.especialidad.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesEstado = filters.estado === 'todos' || entrenador.estado === filters.estado;
      const matchesEspecialidad = filters.especialidad === 'todos' || entrenador.especialidad === filters.especialidad;

      return matchesSearch && matchesEstado && matchesEspecialidad;
    });
  };

  const filteredEntrenadores = getFilteredData(entrenadores);
  const sortedEntrenadores = getSortedData(filteredEntrenadores);
  const totalPages = Math.ceil(sortedEntrenadores.length / ITEMS_PER_PAGE);
  const paginatedEntrenadores = sortedEntrenadores.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const especialidades = [...new Set(entrenadores.map(e => e.especialidad))];

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Entrenadores</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gestiona los entrenadores del gimnasio y sus especialidades
          </p>
        </div>
        <button 
          onClick={() => handleOpenForm()}
          className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center transition-colors duration-200 shadow-sm"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nuevo Entrenador
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
                  placeholder="Buscar por nombre, email o especialidad..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2.5 border rounded-lg text-sm font-medium flex items-center transition-colors duration-200 ${
                  showFilters 
                    ? 'bg-blue-50 border-blue-200 text-blue-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtros
                {Object.values(filters).some(f => f !== 'todos') && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
                    {Object.values(filters).filter(f => f !== 'todos').length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select
                  value={filters.estado}
                  onChange={(e) => setFilters({ ...filters, estado: e.target.value })}
                  className="block w-full pl-3 pr-10 py-2.5 text-base border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                >
                  <option value="todos">Todos los estados</option>
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Especialidad</label>
                <select
                  value={filters.especialidad}
                  onChange={(e) => setFilters({ ...filters, especialidad: e.target.value })}
                  className="block w-full pl-3 pr-10 py-2.5 text-base border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                >
                  <option value="todos">Todas las especialidades</option>
                  {especialidades.map(esp => (
                    <option key={esp} value={esp}>{esp}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  scope="col" 
                  className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                  onClick={() => handleSort('nombre')}
                >
                  <div className="flex items-center">
                    Nombre
                    {sortConfig.key === 'nombre' && (
                      sortConfig.direction === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                  onClick={() => handleSort('email')}
                >
                  <div className="flex items-center">
                    Email
                    {sortConfig.key === 'email' && (
                      sortConfig.direction === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                  onClick={() => handleSort('telefono')}
                >
                  <div className="flex items-center">
                    Teléfono
                    {sortConfig.key === 'telefono' && (
                      sortConfig.direction === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                  onClick={() => handleSort('especialidad')}
                >
                  <div className="flex items-center">
                    Especialidad
                    {sortConfig.key === 'especialidad' && (
                      sortConfig.direction === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                  onClick={() => handleSort('estado')}
                >
                  <div className="flex items-center">
                    Estado
                    {sortConfig.key === 'estado' && (
                      sortConfig.direction === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                    )}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3.5 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedEntrenadores.map((entrenador) => (
                <tr key={entrenador.id} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-medium">
                            {entrenador.nombre.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{entrenador.nombre}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{entrenador.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{entrenador.telefono}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {entrenador.especialidad}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      entrenador.estado === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {entrenador.estado || 'Activo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => handleOpenForm(entrenador)}
                      className="text-blue-600 hover:text-blue-900 mr-3 flex items-center transition-colors duration-200"
                      title="Editar entrenador"
                    >
                      <Edit2 className="h-4 w-4 mr-1" />
                      Editar
                    </button>
                    <button 
                      onClick={() => handleDelete(entrenador)}
                      className="text-red-600 hover:text-red-900 flex items-center transition-colors duration-200"
                      title="Eliminar entrenador"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
              >
                Anterior
              </button>
              <button
                onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
              >
                Siguiente
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Mostrando <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> a{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * ITEMS_PER_PAGE, sortedEntrenadores.length)}
                  </span>{' '}
                  de <span className="font-medium">{sortedEntrenadores.length}</span> resultados
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-3 py-2 rounded-l-lg border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors duration-200"
                  >
                    Anterior
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors duration-200 ${
                        currentPage === i + 1
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-3 py-2 rounded-r-lg border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors duration-200"
                  >
                    Siguiente
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Formulario */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-2xl relative animate-fade-in">
            <div className="absolute top-4 right-4">
              <button 
                onClick={handleCloseForm} 
                className="text-gray-400 hover:text-gray-700 transition-colors duration-200"
                title="Cerrar formulario"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                {editingEntrenador ? (
                  <>
                    <Edit2 className="h-6 w-6 text-blue-600" />
                    Editar Entrenador
                  </>
                ) : (
                  <>
                    <Plus className="h-6 w-6 text-blue-600" />
                    Nuevo Entrenador
                  </>
                )}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {editingEntrenador 
                  ? 'Actualiza la información del entrenador seleccionado.'
                  : 'Complete el formulario para agregar un nuevo entrenador al sistema.'}
              </p>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre completo
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="relative">
                      <input
                        name="nombre"
                        value={form.nombre}
                        onChange={handleFormChange}
                        className={`w-full px-4 py-2.5 rounded-lg border ${
                          formError.includes('nombre') 
                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        } focus:outline-none focus:ring-2 transition-colors duration-200`}
                        placeholder="Ej: Juan Pérez"
                        autoFocus
                      />
                      {formError.includes('nombre') && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                        </div>
                      )}
                    </div>
                    {formError.includes('nombre') && (
                      <p className="mt-1 text-sm text-red-600">El nombre es obligatorio</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="relative">
                      <input
                        name="email"
                        value={form.email}
                        onChange={handleFormChange}
                        className={`w-full px-4 py-2.5 rounded-lg border ${
                          formError.includes('email') 
                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        } focus:outline-none focus:ring-2 transition-colors duration-200`}
                        type="email"
                        placeholder="ejemplo@email.com"
                      />
                      {formError.includes('email') && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                        </div>
                      )}
                    </div>
                    {formError.includes('email') && (
                      <p className="mt-1 text-sm text-red-600">
                        {formError.includes('Email inválido') ? 'Ingrese un email válido' : 'El email es obligatorio'}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Especialidad
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="relative">
                      <input
                        name="especialidad"
                        value={form.especialidad}
                        onChange={handleFormChange}
                        className={`w-full px-4 py-2.5 rounded-lg border ${
                          formError.includes('especialidad') 
                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        } focus:outline-none focus:ring-2 transition-colors duration-200`}
                        placeholder="Ej: Yoga, Spinning, etc."
                      />
                      {formError.includes('especialidad') && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                        </div>
                      )}
                    </div>
                    {formError.includes('especialidad') && (
                      <p className="mt-1 text-sm text-red-600">La especialidad es obligatoria</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="relative">
                      <input
                        name="telefono"
                        value={form.telefono}
                        onChange={handleFormChange}
                        className={`w-full px-4 py-2.5 rounded-lg border ${
                          formError.includes('telefono') 
                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        } focus:outline-none focus:ring-2 transition-colors duration-200`}
                        placeholder="0981 123 456"
                      />
                      {formError.includes('telefono') && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                        </div>
                      )}
                    </div>
                    {formError.includes('telefono') && (
                      <p className="mt-1 text-sm text-red-600">
                        {formError.includes('Formato de teléfono inválido') 
                          ? 'Formato inválido. Use: 0981 123 456' 
                          : 'El teléfono es obligatorio'}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <select
                  name="estado"
                  value={form.estado || 'Activo'}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-colors duration-200"
                >
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="px-4 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium flex items-center transition-colors duration-200"
                  disabled={loading}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center transition-colors duration-200"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  {editingEntrenador ? 'Guardar Cambios' : 'Agregar Entrenador'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Eliminación */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-40">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative animate-fade-in">
            <button onClick={cancelDelete} className="absolute top-3 right-3 text-gray-400 hover:text-gray-700">
              <X />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Confirmar Eliminación</h3>
            </div>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que deseas eliminar al entrenador <span className="font-semibold">{entrenadorToDelete?.nombre}</span>? 
              Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 flex items-center"
                disabled={loading}
              >
                <X className="h-4 w-4 mr-1" />
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 flex items-center"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-1" />
                )}
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast de feedback */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
} 