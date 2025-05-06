import { useState, useEffect } from 'react';
import { Settings, Users, CreditCard, Calendar, Bell, Lock, Save, Plus, Edit2, Trash2, X, CheckCircle, AlertTriangle, Search } from 'lucide-react';

const initialMembresias = [
  { id: 1, nombre: 'Básica', precio: 90000, duracion: 30, descripcion: 'Acceso a sala de musculación y cardio.' },
  { id: 2, nombre: 'Premium', precio: 120000, duracion: 30, descripcion: 'Acceso total + clases grupales.' },
];

const initialUsuarios = [
  { id: 1, nombre: 'Joseli', email: 'admin@gym.com', rol: 'admin', vistas: ['dashboard', 'alumnos', 'entrenadores', 'clases', 'pagos', 'asistencia', 'configuracion'] },
  { id: 2, nombre: 'María Pérez', email: 'maria.entrenadora@email.com', rol: 'entrenador', vistas: ['mis-clases-entrenador'] },
];

const allTabs = [
  { id: 'dashboard', name: 'Dashboard' },
  { id: 'alumnos', name: 'Alumnos' },
  { id: 'entrenadores', name: 'Entrenadores' },
  { id: 'clases', name: 'Clases' },
  { id: 'pagos', name: 'Pagos' },
  { id: 'asistencia', name: 'Asistencia' },
  { id: 'configuracion', name: 'Configuración' },
  { id: 'mis-clases', name: 'Mis Clases (Alumno)' },
  { id: 'mis-pagos', name: 'Mis Pagos (Alumno)' },
  { id: 'mis-clases-entrenador', name: 'Mis Clases (Entrenador)' }
];

const roles = [
  { id: 'admin', name: 'Administrador' },
  { id: 'entrenador', name: 'Entrenador' },
  { id: 'recepcionista', name: 'Recepcionista' },
  { id: 'alumno', name: 'Alumno' }
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

export default function Configuracion() {
  const [activeTab, setActiveTab] = useState('general');

  // CRUD de membresías
  const [membresias, setMembresias] = useState(() => {
    const stored = localStorage.getItem('membresias');
    return stored ? JSON.parse(stored) : initialMembresias;
  });
  const [showForm, setShowForm] = useState(false);
  const [editingMembresia, setEditingMembresia] = useState(null);
  const [form, setForm] = useState({ nombre: '', precio: '', duracion: '', descripcion: '' });
  const [formError, setFormError] = useState('');
  const [showDelete, setShowDelete] = useState(false);
  const [membresiaToDelete, setMembresiaToDelete] = useState(null);
  const [toast, setToast] = useState(null);

  // CRUD de usuarios
  const [usuarios, setUsuarios] = useState(() => {
    const stored = localStorage.getItem('usuarios');
    return stored ? JSON.parse(stored) : initialUsuarios;
  });
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState(null);
  const [userForm, setUserForm] = useState({ nombre: '', email: '', rol: '', vistas: [] });
  const [userFormError, setUserFormError] = useState('');
  const [showUserDelete, setShowUserDelete] = useState(false);
  const [usuarioToDelete, setUsuarioToDelete] = useState(null);

  useEffect(() => {
    localStorage.setItem('membresias', JSON.stringify(membresias));
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
  }, [membresias, usuarios]);

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

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const error = validateForm();
    if (error) {
      setFormError(error);
      return;
    }
    if (editingMembresia) {
      setMembresias(membresias.map(m => m.id === editingMembresia.id ? { ...form, id: editingMembresia.id } : m));
      setToast({ message: 'Membresía actualizada correctamente', type: 'success' });
    } else {
      setMembresias([...membresias, { ...form, id: Date.now() }]);
      setToast({ message: 'Membresía agregada correctamente', type: 'success' });
    }
    setShowForm(false);
    setEditingMembresia(null);
  };

  const handleDelete = (membresia) => {
    setMembresiaToDelete(membresia);
    setShowDelete(true);
  };

  const confirmDelete = () => {
    setMembresias(membresias.filter(m => m.id !== membresiaToDelete.id));
    setToast({ message: 'Membresía eliminada', type: 'success' });
    setShowDelete(false);
    setMembresiaToDelete(null);
  };

  const handleOpenUserForm = (usuario = null) => {
    setEditingUsuario(usuario);
    setUserForm(usuario ? { ...usuario } : { nombre: '', email: '', rol: '', vistas: [] });
    setUserFormError('');
    setShowUserForm(true);
  };

  const handleCloseUserForm = () => {
    setShowUserForm(false);
    setEditingUsuario(null);
    setUserFormError('');
  };

  const handleUserFormChange = (e) => {
    const { name, value } = e.target;
    setUserForm(prev => {
      const newForm = { ...prev, [name]: value };
      
      // Automatically assign views based on role
      if (name === 'rol') {
        switch (value) {
          case 'admin':
            newForm.vistas = ['dashboard', 'alumnos', 'entrenadores', 'clases', 'pagos', 'cobros', 'asistencia', 'configuracion'];
            break;
          case 'entrenador':
            newForm.vistas = ['mis-clases-entrenador'];
            break;
          case 'recepcionista':
            newForm.vistas = ['dashboard', 'alumnos', 'pagos', 'cobros', 'asistencia'];
            break;
          case 'alumno':
            newForm.vistas = ['mis-clases', 'mis-pagos'];
            break;
          default:
            newForm.vistas = [];
        }
      }
      
      return newForm;
    });
  };

  const handleUserVistasChange = (tabId) => {
    setUserForm((prev) => ({
      ...prev,
      vistas: prev.vistas.includes(tabId)
        ? prev.vistas.filter((v) => v !== tabId)
        : [...prev.vistas, tabId]
    }));
  };

  const validateUserForm = () => {
    if (!userForm.nombre) return 'El nombre es obligatorio';
    if (!userForm.email || !userForm.email.includes('@')) return 'Email inválido';
    if (!userForm.rol) return 'El rol es obligatorio';
    if (!userForm.vistas || userForm.vistas.length === 0) return 'Debe asignar al menos una vista';
    return '';
  };

  const handleUserFormSubmit = (e) => {
    e.preventDefault();
    const error = validateUserForm();
    if (error) {
      setUserFormError(error);
      return;
    }
    if (editingUsuario) {
      setUsuarios(usuarios.map(u => u.id === editingUsuario.id ? { ...userForm, id: editingUsuario.id } : u));
      setToast({ message: 'Usuario actualizado correctamente', type: 'success' });
    } else {
      setUsuarios([...usuarios, { ...userForm, id: Date.now() }]);
      setToast({ message: 'Usuario agregado correctamente', type: 'success' });
    }
    setShowUserForm(false);
    setEditingUsuario(null);
  };

  const handleUserDelete = (usuario) => {
    setUsuarioToDelete(usuario);
    setShowUserDelete(true);
  };

  const confirmUserDelete = () => {
    setUsuarios(usuarios.filter(u => u.id !== usuarioToDelete.id));
    setToast({ message: 'Usuario eliminado', type: 'success' });
    setShowUserDelete(false);
    setUsuarioToDelete(null);
  };

  const tabs = [
    { id: 'general', name: 'General', icon: Settings },
    { id: 'usuarios', name: 'Usuarios', icon: Users },
    { id: 'membresias', name: 'Membresías', icon: CreditCard },
    { id: 'horarios', name: 'Horarios', icon: Calendar },
    { id: 'notificaciones', name: 'Notificaciones', icon: Bell },
    { id: 'seguridad', name: 'Seguridad', icon: Lock }
  ];

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
          <p className="mt-1 text-sm text-gray-500">
            Administra la configuración general del gimnasio
          </p>
        </div>
        <button className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center transition-colors duration-200 shadow-sm">
          <Save className="h-5 w-5 mr-2" />
          Guardar Cambios
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <nav className="space-y-1 bg-white rounded-xl shadow-sm p-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white shadow-sm rounded-xl overflow-hidden">
            {activeTab === 'general' && (
              <div className="p-6 space-y-6">
                <h2 className="text-xl font-bold text-gray-900">Configuración General</h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="nombre-gimnasio" className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre del Gimnasio
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      id="nombre-gimnasio"
                      className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      placeholder="Nombre del gimnasio"
                    />
                  </div>
                  <div>
                    <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 mb-1">
                      Dirección
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      id="direccion"
                      className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      placeholder="Dirección del gimnasio"
                    />
                  </div>
                  <div>
                    <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="tel"
                      id="telefono"
                      className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      placeholder="Teléfono de contacto"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      placeholder="Email de contacto"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'usuarios' && (
              <div className="p-6 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Gestión de Usuarios</h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Administra los usuarios y sus permisos
                    </p>
                  </div>
                  <button
                    onClick={() => handleOpenUserForm()}
                    className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center transition-colors duration-200 shadow-sm"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Nuevo Usuario
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
                        placeholder="Buscar usuarios..."
                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      />
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                          <th className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                          <th className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                          <th className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vistas Permitidas</th>
                          <th className="px-6 py-3.5 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {usuarios.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="text-center py-8 text-gray-400">No hay usuarios registrados.</td>
                          </tr>
                        ) : usuarios.map(u => (
                          <tr key={u.id} className="hover:bg-gray-50 transition-colors duration-200">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-10 w-10 flex-shrink-0">
                                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <span className="text-blue-600 font-medium">
                                      {u.nombre.charAt(0)}
                                    </span>
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{u.nombre}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{u.email}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                u.rol === 'admin' ? 'bg-purple-100 text-purple-800' :
                                u.rol === 'entrenador' ? 'bg-blue-100 text-blue-800' :
                                u.rol === 'recepcionista' ? 'bg-green-100 text-green-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {roles.find(r => r.id === u.rol)?.name || u.rol}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {u.vistas.map(tabId => allTabs.find(t => t.id === tabId)?.name).filter(Boolean).join(', ')}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button 
                                onClick={() => handleOpenUserForm(u)}
                                className="text-blue-600 hover:text-blue-900 mr-3 flex items-center transition-colors duration-200"
                                title="Editar usuario"
                              >
                                <Edit2 className="h-4 w-4 mr-1" />
                                Editar
                              </button>
                              <button 
                                onClick={() => handleUserDelete(u)}
                                className="text-red-600 hover:text-red-900 flex items-center transition-colors duration-200"
                                title="Eliminar usuario"
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
              </div>
            )}

            {activeTab === 'membresias' && (
              <div className="p-6 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Tipos de Membresías</h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Administra los diferentes tipos de membresías disponibles
                    </p>
                  </div>
                  <button
                    onClick={() => handleOpenForm()}
                    className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center transition-colors duration-200 shadow-sm"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Nueva Membresía
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
                        placeholder="Buscar membresías..."
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
                        {membresias.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="text-center py-8 text-gray-400">No hay membresías registradas.</td>
                          </tr>
                        ) : membresias.map(m => (
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
                                title="Editar membresía"
                              >
                                <Edit2 className="h-4 w-4 mr-1" />
                                Editar
                              </button>
                              <button 
                                onClick={() => handleDelete(m)}
                                className="text-red-600 hover:text-red-900 flex items-center transition-colors duration-200"
                                title="Eliminar membresía"
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
              </div>
            )}

            {activeTab === 'horarios' && (
              <div className="p-6 space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Horarios de Apertura</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Configura los horarios de apertura y cierre del gimnasio
                  </p>
                </div>
                <div className="space-y-4">
                  {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((dia) => (
                    <div key={dia} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                      <span className="text-sm font-medium text-gray-700">{dia}</span>
                      <div className="flex items-center space-x-4">
                        <input
                          type="time"
                          className="block w-32 px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                        />
                        <span className="text-gray-500">a</span>
                        <input
                          type="time"
                          className="block w-32 px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'notificaciones' && (
              <div className="p-6 space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Configuración de Notificaciones</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Personaliza las notificaciones del sistema
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Notificaciones por Email</h3>
                      <p className="text-sm text-gray-500">Recibir notificaciones importantes por correo electrónico</p>
                    </div>
                    <input
                      type="checkbox"
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors duration-200"
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Recordatorios de Pago</h3>
                      <p className="text-sm text-gray-500">Enviar recordatorios de pago a alumnos</p>
                    </div>
                    <input
                      type="checkbox"
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors duration-200"
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Notificaciones de Clases</h3>
                      <p className="text-sm text-gray-500">Notificar cambios en horarios de clases</p>
                    </div>
                    <input
                      type="checkbox"
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors duration-200"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'seguridad' && (
              <div className="p-6 space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Configuración de Seguridad</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Gestiona la seguridad de tu cuenta y del sistema
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-white rounded-lg border border-gray-200">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      Cambiar Contraseña
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="password"
                      id="password"
                      className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      placeholder="Nueva contraseña"
                    />
                  </div>
                  <div className="p-4 bg-white rounded-lg border border-gray-200">
                    <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirmar Contraseña
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="password"
                      id="confirm-password"
                      className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      placeholder="Confirmar nueva contraseña"
                    />
                  </div>
                  <div className="p-4 bg-white rounded-lg border border-gray-200">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="two-factor"
                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors duration-200"
                      />
                      <label htmlFor="two-factor" className="ml-2 block text-sm text-gray-900">
                        Habilitar autenticación de dos factores
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
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
                    Editar Membresía
                  </>
                ) : (
                  <>
                    <Plus className="h-6 w-6 text-blue-600" />
                    Nueva Membresía
                  </>
                )}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {editingMembresia 
                  ? 'Actualiza la información de la membresía seleccionada.'
                  : 'Complete el formulario para agregar una nueva membresía.'}
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
                        placeholder="Nombre de la membresía"
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
                      <input
                        name="duracion"
                        value={form.duracion}
                        onChange={handleFormChange}
                        className={`w-full px-4 py-2.5 rounded-lg border ${
                          formError.includes('duracion') 
                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        } focus:outline-none focus:ring-2 transition-colors duration-200`}
                        type="number"
                        min="1"
                        placeholder="30"
                      />
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
                      placeholder="Descripción de la membresía"
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
                  className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center transition-colors duration-200"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {editingMembresia ? 'Guardar Cambios' : 'Agregar Membresía'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Formulario de Usuario */}
      {showUserForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-2xl relative animate-fade-in">
            <div className="absolute top-4 right-4">
              <button 
                onClick={handleCloseUserForm} 
                className="text-gray-400 hover:text-gray-700 transition-colors duration-200"
                title="Cerrar formulario"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                {editingUsuario ? (
                  <>
                    <Edit2 className="h-6 w-6 text-blue-600" />
                    Editar Usuario
                  </>
                ) : (
                  <>
                    <Plus className="h-6 w-6 text-blue-600" />
                    Nuevo Usuario
                  </>
                )}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {editingUsuario 
                  ? 'Actualiza la información del usuario seleccionado.'
                  : 'Complete el formulario para agregar un nuevo usuario.'}
              </p>
            </div>

            <form onSubmit={handleUserFormSubmit} className="space-y-6">
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
                        value={userForm.nombre}
                        onChange={handleUserFormChange}
                        className={`w-full px-4 py-2.5 rounded-lg border ${
                          userFormError.includes('nombre') 
                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        } focus:outline-none focus:ring-2 transition-colors duration-200`}
                        placeholder="Nombre del usuario"
                        autoFocus
                      />
                      {userFormError.includes('nombre') && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                        </div>
                      )}
                    </div>
                    {userFormError.includes('nombre') && (
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
                        value={userForm.email}
                        onChange={handleUserFormChange}
                        className={`w-full px-4 py-2.5 rounded-lg border ${
                          userFormError.includes('email') 
                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        } focus:outline-none focus:ring-2 transition-colors duration-200`}
                        type="email"
                        placeholder="usuario@email.com"
                      />
                      {userFormError.includes('email') && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                        </div>
                      )}
                    </div>
                    {userFormError.includes('email') && (
                      <p className="mt-1 text-sm text-red-600">Email inválido</p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rol
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="relative">
                      <select
                        name="rol"
                        value={userForm.rol}
                        onChange={handleUserFormChange}
                        className={`w-full px-4 py-2.5 rounded-lg border ${
                          userFormError.includes('rol') 
                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        } focus:outline-none focus:ring-2 transition-colors duration-200`}
                      >
                        <option value="">Seleccionar rol</option>
                        {roles.map((role) => (
                          <option key={role.id} value={role.id}>{role.name}</option>
                        ))}
                      </select>
                      {userFormError.includes('rol') && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                        </div>
                      )}
                    </div>
                    {userFormError.includes('rol') && (
                      <p className="mt-1 text-sm text-red-600">El rol es obligatorio</p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vistas Permitidas
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {allTabs.map((tab) => (
                    <label key={tab.id} className="flex items-center space-x-2 p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200">
                      <input
                        type="checkbox"
                        checked={userForm.vistas.includes(tab.id)}
                        onChange={() => handleUserVistasChange(tab.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{tab.name}</span>
                    </label>
                  ))}
                </div>
                {userFormError.includes('vistas') && (
                  <p className="mt-1 text-sm text-red-600">Debe asignar al menos una vista</p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseUserForm}
                  className="px-4 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium flex items-center transition-colors duration-200"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center transition-colors duration-200"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {editingUsuario ? 'Guardar Cambios' : 'Agregar Usuario'}
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
              ¿Estás seguro de que deseas eliminar la membresía <span className="font-semibold">{membresiaToDelete?.nombre}</span>? 
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
                className="px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium flex items-center transition-colors duration-200"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Eliminación de Usuario */}
      {showUserDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md relative animate-fade-in">
            <button onClick={() => setShowUserDelete(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors duration-200">
              <X className="h-6 w-6" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Confirmar Eliminación</h3>
            </div>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que deseas eliminar el usuario <span className="font-semibold">{usuarioToDelete?.nombre}</span>? 
              Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowUserDelete(false)}
                className="px-4 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium flex items-center transition-colors duration-200"
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </button>
              <button
                onClick={confirmUserDelete}
                className="px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium flex items-center transition-colors duration-200"
              >
                <Trash2 className="h-4 w-4 mr-2" />
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
  