import { useState, useEffect } from 'react';
import { Users, Plus, Search, Filter, Download, Upload, X, CheckCircle, AlertTriangle, Trash2, Edit2, Clock, CreditCard } from 'lucide-react';
import { studentsService, paymentsService, membershipService } from '../services/api';
import { useApp } from '../context/AppContext';

// Función para formatear moneda
const formatCurrency = (amount) => {
  if (!amount) return '₲ 0';
  return new Intl.NumberFormat('es-PY', {
    style: 'currency',
    currency: 'PYG',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// Función para formatear fecha
const formatDate = (dateString) => {
  if (!dateString) return 'Sin fecha';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Fecha inválida';
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    return 'Fecha inválida';
  }
};

function Toast({ message, type, onClose }) {
  return (
    <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded shadow-lg flex items-center gap-2 ${type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
      {type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 text-lg font-bold">×</button>
    </div>
  );
}

export default function Alumnos() {
  const { 
    students, 
    payments, 
    createStudent, 
    createPayment,
    getPendingPayments,
    loading,
    error,
    updateStudents,
    updatePayments
  } = useApp();
  const [alumnos, setAlumnos] = useState([]);
  const [membresias, setMembresias] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [alumnoToDelete, setAlumnoToDelete] = useState(null);
  const [editingAlumno, setEditingAlumno] = useState(null);
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    telefono: '',
    plan: '',
    montoPlan: '',
    fechaInicio: new Date().toISOString().split('T')[0],
    estado: 'Activo'
  });
  const [formError, setFormError] = useState('');
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState('');

  // Cargar membresías al iniciar
  useEffect(() => {
    const loadMembresias = async () => {
      try {
        const membresiasData = await membershipService.getAll();
        setMembresias(membresiasData);
      } catch (error) {
        showToast('Error al cargar las membresías', 'error');
      }
    };
    loadMembresias();
  }, []);

  // Sincronizar alumnos locales con los del contexto global
  useEffect(() => {
    setAlumnos(students);
  }, [students]);

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const calcularDiasVencimiento = (fechaVencimiento) => {
    const hoy = new Date();
    const vencimiento = new Date(fechaVencimiento);
    const diffTime = vencimiento - hoy;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getEstadoPago = (alumno) => {
    if (!alumno || !alumno.fechaVencimiento) {
      return {
        estado: 'Sin fecha',
        color: 'gray',
        dias: 0
      };
    }

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); // Normalizar la fecha actual a inicio del día
    const fechaVencimiento = new Date(alumno.fechaVencimiento);
    fechaVencimiento.setHours(0, 0, 0, 0); // Normalizar la fecha de vencimiento a inicio del día
    
    const diasRestantes = Math.ceil((fechaVencimiento - hoy) / (1000 * 60 * 60 * 24));
    const pagosPendientes = getPendingPayments(alumno.id);

    // Si el alumno tiene pagos pendientes
    if (pagosPendientes.length > 0) {
      return {
        estado: 'Pago Pendiente',
        color: 'red',
        dias: diasRestantes,
        pagosPendientes: pagosPendientes.length
      };
    }

    // Si la membresía está vencida
    if (diasRestantes < 0) {
      return {
        estado: 'Vencido',
        color: 'red',
        dias: Math.abs(diasRestantes)
      };
    }
    
    // Si la membresía está por vencer (7 días o menos)
    if (diasRestantes <= 7) {
      return {
        estado: 'Próximo a vencer',
        color: 'yellow',
        dias: diasRestantes
      };
    }
    
    // Si la membresía está al día
    return {
      estado: 'Al día',
      color: 'green',
      dias: diasRestantes
    };
  };

  const handleOpenForm = (alumno = null) => {
    setEditingAlumno(alumno);
    setForm(alumno ? {
      nombre: alumno.nombre || '',
      email: alumno.email || '',
      telefono: alumno.telefono || '',
      plan: alumno.plan || '',
      montoPlan: alumno.montoPlan || '',
      fechaInicio: alumno.fechaInicio || new Date().toISOString().split('T')[0],
      estado: alumno.estado || 'Activo'
    } : {
      nombre: '',
      email: '',
      telefono: '',
      plan: '',
      montoPlan: '',
      fechaInicio: new Date().toISOString().split('T')[0],
      estado: 'Activo'
    });
    setFormError('');
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingAlumno(null);
    setFormError('');
  };

  const handleEditAlumno = (alumno) => {
    // Encontrar el plan correspondiente al nombre del plan del alumno
    const planSeleccionado = membresias.find(p => p.nombre === alumno.plan);
    
    setEditingAlumno(alumno);
    setForm({
      nombre: alumno.nombre || '',
      email: alumno.email || '',
      telefono: alumno.telefono || '',
      plan: planSeleccionado ? planSeleccionado.id.toString() : '',
      montoPlan: alumno.montoPlan || '',
      fechaInicio: alumno.fechaInicio || new Date().toISOString().split('T')[0],
      estado: alumno.estado || 'Activo'
    });
    setShowForm(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'plan') {
      // Cuando se selecciona un plan, actualizar automáticamente el monto
      const planSeleccionado = membresias.find(p => p.id === parseInt(value));
      setForm(prev => ({
        ...prev,
        [name]: value,
        montoPlan: planSeleccionado ? planSeleccionado.precio.toString() : ''
      }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = () => {
    if (!form.nombre) return 'El nombre es obligatorio';
    if (!form.email || !form.email.includes('@')) return 'Email inválido';
    if (!form.telefono) return 'El teléfono es obligatorio';
    if (!form.plan) return 'Debe seleccionar un plan';
    return '';
  };

  const calcularFechaVencimiento = (fechaInicio, planId) => {
    const plan = membresias.find(p => p.id === parseInt(planId));
    if (!plan) return fechaInicio;
    
    const fecha = new Date(fechaInicio);
    fecha.setDate(fecha.getDate() + plan.duracion); // Sumamos exactamente los días del plan
    return fecha.toISOString().split('T')[0];
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const error = validateForm();
    if (error) {
      setFormError(error);
      return;
    }

    try {
      // Calcular la fecha de vencimiento basada en el plan seleccionado
      const planSeleccionado = membresias.find(p => p.id === parseInt(form.plan));
      const fechaInicio = new Date(form.fechaInicio);
      const fechaVencimiento = new Date(fechaInicio);
      fechaVencimiento.setDate(fechaInicio.getDate() + parseInt(planSeleccionado.duracion)); // Usar la duración del plan

      const alumnoData = {
        ...form,
        fechaVencimiento: fechaVencimiento.toISOString().split('T')[0],
        plan: planSeleccionado.nombre,
        estado: form.estado,
        ultimoPago: new Date().toISOString().split('T')[0],
        montoUltimoPago: Number(form.montoPlan)
      };

      if (editingAlumno) {
        // Actualizar alumno existente
        await studentsService.update(editingAlumno.id, alumnoData);
        showToast('Alumno actualizado correctamente', 'success');
      } else {
        // Crear nuevo alumno
        const nuevoAlumno = await studentsService.create(alumnoData);
        
        // Crear el pago inicial como completado
        const pagoInicial = {
          alumnoId: nuevoAlumno.id,
          alumno: nuevoAlumno.nombre,
          monto: Number(form.montoPlan),
          fecha: new Date().toISOString().split('T')[0],
          metodo: 'Efectivo',
          estado: 'Completado',
          concepto: `Pago inicial - ${planSeleccionado.nombre}`,
          observaciones: 'Pago inicial del alumno'
        };

        await paymentsService.create(pagoInicial);
        showToast('Alumno registrado correctamente', 'success');
      }

      // Actualizar la lista de alumnos y pagos
      await updateStudents();
      await updatePayments();
      
      setShowForm(false);
      setForm({
        nombre: '',
        email: '',
        telefono: '',
        plan: '',
        montoPlan: '',
        fechaInicio: new Date().toISOString().split('T')[0],
        estado: 'Activo'
      });
    } catch (err) {
      setFormError('Error al procesar la solicitud.');
      showToast(err.message || 'Error al procesar la solicitud', 'error');
    }
  };

  // Función para crear pagos iniciales para alumnos existentes
  const crearPagosIniciales = async () => {
    try {
      for (const alumno of students) {
        // Verificar si el alumno ya tiene pagos
        const pagosAlumno = payments.filter(p => p.alumnoId === alumno.id);
        if (pagosAlumno.length === 0 && alumno.montoPlan) {
          // Crear pago inicial para alumnos sin pagos
          const pagoInicial = {
            alumnoId: alumno.id,
            alumno: alumno.nombre,
            monto: Number(alumno.montoPlan),
            fecha: alumno.fechaInicio || new Date().toISOString().split('T')[0],
            metodo: 'Efectivo',
            estado: 'Completado',
            concepto: `Pago inicial - ${alumno.plan}`,
            observaciones: 'Pago inicial del alumno'
          };
          await paymentsService.create(pagoInicial);
        }
      }
      await updatePayments();
      showToast('Pagos iniciales creados correctamente', 'success');
    } catch (err) {
      showToast('Error al crear pagos iniciales', 'error');
    }
  };

  // Llamar a crearPagosIniciales cuando se carga el componente
  useEffect(() => {
    if (students.length > 0 && payments.length > 0) {
      crearPagosIniciales();
    }
  }, [students, payments]);

  const handleDelete = async (alumno) => {
    try {
      // Primero eliminar los pagos asociados al alumno
      const pagosAlumno = payments.filter(p => p.alumnoId === alumno.id);
      for (const pago of pagosAlumno) {
        await paymentsService.delete(pago.id);
      }
      
      // Luego eliminar el alumno
      await studentsService.delete(alumno.id);
      
      // Actualizar las listas
      await updateStudents();
      await updatePayments();
      
      showToast('Alumno eliminado exitosamente', 'success');
      setShowDeleteConfirm(false);
      setAlumnoToDelete(null);
    } catch (error) {
      showToast(error.message || 'Error al eliminar el alumno', 'error');
    }
  };

  const filteredAlumnos = alumnos.filter(alumno =>
    alumno.nombre.toLowerCase().includes(search.toLowerCase()) ||
    alumno.email.toLowerCase().includes(search.toLowerCase())
  );

  if (error) {
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
                <p>{error}</p>
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
          <h1 className="text-2xl font-bold text-gray-900">Alumnos</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gestiona los alumnos del gimnasio y sus membresías
          </p>
        </div>
        <button 
          onClick={() => handleOpenForm()}
          className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center transition-colors duration-200 shadow-sm"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nuevo Alumno
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Cargando alumnos...</span>
        </div>
      ) : alumnos.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No hay alumnos registrados</h3>
          <p className="mt-1 text-sm text-gray-500">
            Comienza agregando un nuevo alumno al sistema
          </p>
        </div>
      ) : (
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
                    placeholder="Buscar por nombre, email o plan..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center transition-colors duration-200">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros
                </button>
                <button className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center transition-colors duration-200">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </button>
                <button className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center transition-colors duration-200">
                  <Upload className="h-4 w-4 mr-2" />
                  Importar
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Alumno
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plan y Monto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Próximo Pago
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAlumnos.map((alumno) => {
                  const estadoPago = getEstadoPago(alumno);
                  return (
                    <tr key={alumno.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{alumno.nombre}</div>
                        <div className="text-sm text-gray-500">{alumno.email}</div>
                        <div className="text-sm text-gray-500">{alumno.telefono}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{alumno.plan}</div>
                        <div className="text-sm text-gray-500">{formatCurrency(alumno.montoPlan)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            estadoPago.color === 'green' ? 'bg-green-100 text-green-800' :
                            estadoPago.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                            estadoPago.color === 'gray' ? 'bg-gray-100 text-gray-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {estadoPago.estado}
                          </span>
                          {estadoPago.pagosPendientes > 0 && estadoPago.estado !== 'Al día' && (
                            <div className="text-xs text-red-600">
                              {estadoPago.pagosPendientes} pago(s) pendiente(s)
                            </div>
                          )}
                          {estadoPago.dias !== undefined && estadoPago.estado !== 'Sin fecha' && (
                            <div className={`text-xs ${
                              estadoPago.color === 'red' ? 'text-red-600' : 'text-gray-600'
                            }`}>
                              {estadoPago.estado === 'Vencido' 
                                ? `Vencido hace ${estadoPago.dias} días`
                                : `Vence en ${estadoPago.dias} días`}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(alumno.fechaVencimiento)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEditAlumno(alumno)}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <Edit2 className="h-4 w-4 mr-1.5" />
                          Editar
                        </button>
                        <button
                          onClick={() => {
                            setAlumnoToDelete(alumno);
                            setShowDeleteConfirm(true);
                          }}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <Trash2 className="h-4 w-4 mr-1.5" />
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
                {editingAlumno ? (
                  <>
                    <Edit2 className="h-6 w-6 text-blue-600" />
                    Editar Alumno
                  </>
                ) : (
                  <>
                    <Plus className="h-6 w-6 text-blue-600" />
                    Nuevo Alumno
                  </>
                )}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {editingAlumno 
                  ? 'Actualiza la información del alumno seleccionado.'
                  : 'Complete el formulario para agregar un nuevo alumno al sistema.'}
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
                      <p className="mt-1 text-sm text-red-600">El teléfono es obligatorio</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Plan
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="relative">
                      <select
                        name="plan"
                        value={form.plan}
                        onChange={handleFormChange}
                        className={`w-full px-4 py-2.5 rounded-lg border ${
                          formError.includes('plan') 
                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        } focus:outline-none focus:ring-2 transition-colors duration-200`}
                        required
                      >
                        <option value="">Seleccionar plan</option>
                        {membresias.map(plan => (
                          <option key={plan.id} value={plan.id}>
                            {plan.nombre} - {formatCurrency(plan.precio)}
                          </option>
                        ))}
                      </select>
                      {formError.includes('plan') && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                        </div>
                      )}
                    </div>
                    {formError.includes('plan') && (
                      <p className="mt-1 text-sm text-red-600">Debe seleccionar un plan</p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Inscripción
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  name="fechaInicio"
                  value={form.fechaInicio}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-colors duration-200"
                  type="date"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monto del Plan
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">₲</span>
                  </div>
                  <input
                    name="montoPlan"
                    type="text"
                    value={form.montoPlan ? formatCurrency(Number(form.montoPlan)) : ''}
                    className="w-full pl-8 px-4 py-2.5 rounded-lg border border-gray-300 bg-gray-50 cursor-not-allowed"
                    disabled
                    readOnly
                  />
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
                  {editingAlumno ? 'Guardar Cambios' : 'Agregar Alumno'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Eliminación */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md relative animate-fade-in">
            <button onClick={() => setShowDeleteConfirm(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors duration-200">
              <X className="h-6 w-6" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Confirmar Eliminación</h3>
            </div>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que deseas eliminar al alumno <span className="font-semibold">{alumnoToDelete?.nombre}</span>? 
              Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium flex items-center transition-colors duration-200"
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(alumnoToDelete)}
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