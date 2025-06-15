import { useState, useEffect } from 'react';
import { CreditCard, Plus, Edit2, Trash2, X, CheckCircle, AlertTriangle, Search } from 'lucide-react';
import { membershipService } from '../services/api';

function Toast({ message, type, onClose }) {
  return (
    <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded shadow-lg flex items-center gap-2 ${type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
      {type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 text-lg font-bold">×</button>
    </div>
  );
}

export default function Membresias() {
  const [membresias, setMembresias] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingMembresia, setEditingMembresia] = useState(null);
  const [form, setForm] = useState({ nombre: '', precio: '', duracion: '', descripcion: '' });
  const [formError, setFormError] = useState('');
  const [showDelete, setShowDelete] = useState(false);
  const [membresiaToDelete, setMembresiaToDelete] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Cargar membresías al iniciar
  useEffect(() => {
    loadMembresias();
  }, []);

  const loadMembresias = async () => {
    try {
      setLoading(true);
      const membresiasData = await membershipService.getAll();
      setMembresias(membresiasData);
    } catch (error) {
      showToast('Error al cargar los planes', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleOpenForm = (membresia = null) => {
    setEditingMembresia(membresia);
    setForm(membresia ? { ...membresia } : { nombre: '', precio: '', duracion: '', descripcion: '' });
    setFormError('');
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingMembresia(null);
    setFormError('');
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!form.nombre) return 'El nombre es obligatorio';
    if (!form.precio || isNaN(form.precio) || Number(form.precio) <= 0) return 'Precio inválido';
    if (!form.duracion || isNaN(form.duracion) || Number(form.duracion) <= 0) return 'Duración inválida';
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
      if (editingMembresia) {
        await membershipService.update(editingMembresia.id, form);
        showToast('Plan actualizado correctamente', 'success');
      } else {
        await membershipService.create(form);
        showToast('Plan agregado correctamente', 'success');
      }
      await loadMembresias();
      setShowForm(false);
      setEditingMembresia(null);
    } catch (error) {
      showToast(error.message || 'Error al guardar el plan', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (membresia) => {
    setMembresiaToDelete(membresia);
    setShowDelete(true);
  };

  const confirmDelete = async () => {
    try {
      setLoading(true);
      await membershipService.delete(membresiaToDelete.id);
      await loadMembresias();
      showToast('Plan eliminado', 'success');
      setShowDelete(false);
      setMembresiaToDelete(null);
    } catch (error) {
      showToast(error.message || 'Error al eliminar el plan', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredMembresias = membresias.filter(m =>
    m.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tipos de Planes</h1>
          <p className="mt-1 text-sm text-gray-500">
            Administra los diferentes tipos de planes disponibles
          </p>
        </div>
        <button
          onClick={() => handleOpenForm()}
          className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center transition-colors duration-200 shadow-sm"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nuevo Plan
        </button>
      </div>

      <div className="bg-white rounded-xl overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar planes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                <th className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duración</th>
                <th className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                <th className="px-6 py-3.5 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-3 text-gray-600">Cargando planes...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredMembresias.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-400">No hay planes registrados.</td>
                </tr>
              ) : filteredMembresias.map(m => (
                <tr key={m.id} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-medium">
                            {m.nombre.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{m.nombre}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{Number(m.precio).toLocaleString()} Gs</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{m.duracion} días</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{m.descripcion}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => handleOpenForm(m)}
                      className="text-blue-600 hover:text-blue-900 mr-3 flex items-center transition-colors duration-200"
                      title="Editar plan"
                    >
                      <Edit2 className="h-4 w-4 mr-1" />
                      Editar
                    </button>
                    <button 
                      onClick={() => handleDelete(m)}
                      className="text-red-600 hover:text-red-900 flex items-center transition-colors duration-200"
                      title="Eliminar plan"
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
      </div>

      {/* Modal Formulario de Membresía */}
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
                {editingMembresia ? (
                  <>
                    <Edit2 className="h-6 w-6 text-blue-600" />
                    Editar Plan
                  </>
                ) : (
                  <>
                    <Plus className="h-6 w-6 text-blue-600" />
                    Nuevo Plan
                  </>
                )}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {editingMembresia 
                  ? 'Actualiza la información del plan seleccionado.'
                  : 'Complete el formulario para agregar un nuevo plan.'}
              </p>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre
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
                        placeholder="Nombre del plan"
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
                      Precio (Gs)
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="relative">
                      <input
                        name="precio"
                        value={form.precio}
                        onChange={handleFormChange}
                        className={`w-full px-4 py-2.5 rounded-lg border ${
                          formError.includes('precio') 
                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        } focus:outline-none focus:ring-2 transition-colors duration-200`}
                        type="number"
                        min="1"
                        placeholder="0"
                      />
                      {formError.includes('precio') && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                        </div>
                      )}
                    </div>
                    {formError.includes('precio') && (
                      <p className="mt-1 text-sm text-red-600">Precio inválido</p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duración (días)
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="relative">
                      <select
                        name="duracion"
                        value={form.duracion}
                        onChange={handleFormChange}
                        className={`w-full px-4 py-2.5 rounded-lg border ${
                          formError.includes('duracion') 
                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        } focus:outline-none focus:ring-2 transition-colors duration-200`}
                      >
                        <option value="">Seleccionar duración</option>
                        <option value="1">1 día</option>
                        <option value="7">7 días</option>
                        <option value="15">15 días</option>
                        <option value="30">30 días</option>
                      </select>
                      {formError.includes('duracion') && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                        </div>
                      )}
                    </div>
                    {formError.includes('duracion') && (
                      <p className="mt-1 text-sm text-red-600">Duración inválida</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descripción
                    </label>
                    <textarea
                      name="descripcion"
                      value={form.descripcion}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-colors duration-200"
                      rows={3}
                      placeholder="Descripción del plan"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="px-4 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium flex items-center transition-colors duration-200"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {editingMembresia ? 'Guardar Cambios' : 'Agregar Plan'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Eliminación */}
      {showDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md relative animate-fade-in">
            <button onClick={() => setShowDelete(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors duration-200">
              <X className="h-6 w-6" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Confirmar Eliminación</h3>
            </div>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que deseas eliminar el plan <span className="font-semibold">{membresiaToDelete?.nombre}</span>? 
              Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDelete(false)}
                className="px-4 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium flex items-center transition-colors duration-200"
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                disabled={loading}
                className="px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium flex items-center transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Eliminando...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </>
                )}
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