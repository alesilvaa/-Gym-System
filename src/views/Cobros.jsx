import { useState, useEffect } from 'react';
import { CreditCard, Plus, Search, Filter, Download, Upload, CheckCircle, AlertTriangle, Clock, Calendar, DollarSign, Info } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { paymentsService, studentsService } from '../services/api';

// Estado global para los pagos
let globalPagos = [];

// Definir los planes disponibles (ajusta según tus planes reales)
const planes = [
  { nombre: 'Básico', duracion: 30 },
  { nombre: 'Trimestral', duracion: 90 },
  { nombre: 'Anual', duracion: 365 }
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

export default function Cobros() {
  const { 
    students, 
    payments, 
    updatePayments, 
    createPayment, 
    updatePaymentStatus,
    getPendingPayments 
  } = useApp();
  const [alumnos, setAlumnos] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedAlumno, setSelectedAlumno] = useState(null);
  const [form, setForm] = useState({
    monto: '',
    fecha: new Date().toISOString().split('T')[0],
    metodo: '',
    concepto: '',
    observaciones: '',
    tipoPago: 'normal',
    estado: 'Pendiente'
  });
  const [formError, setFormError] = useState('');
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState('');
  const [showHistorial, setShowHistorial] = useState(false);

  // Sincronizar alumnos locales con los del contexto global
  useEffect(() => {
    setAlumnos(students);
  }, [students]);

  const getEstadoPago = (alumno) => {
    if (!alumno || !alumno.fechaVencimiento) {
      return {
        estado: 'Sin fecha',
        color: 'gray',
        dias: 0
      };
    }

    const hoy = new Date();
    const fechaVencimiento = new Date(alumno.fechaVencimiento);
    const diasRestantes = Math.ceil((fechaVencimiento - hoy) / (1000 * 60 * 60 * 24));
    const pagosPendientes = getPendingPayments(alumno.id);

    if (pagosPendientes.length > 0) {
      return {
        estado: 'Pendiente',
        color: 'red',
        dias: diasRestantes,
        pagosPendientes: pagosPendientes.length
      };
    }

    if (diasRestantes < 0) {
      return {
        estado: 'Vencido',
        color: 'red',
        dias: Math.abs(diasRestantes)
      };
    } else if (diasRestantes <= 7) {
      return {
        estado: 'Próximo a vencer',
        color: 'yellow',
        dias: diasRestantes
      };
    } else {
      return {
        estado: 'Al día',
        color: 'green',
        dias: diasRestantes
      };
    }
  };

  const handleOpenForm = (alumno) => {
    if (!alumno) {
      setFormError('No se encontró el alumno.');
      return;
    }
    setSelectedAlumno(alumno);
    
    // Verificar si hay pagos pendientes
    const pagosPendientes = getPendingPayments(alumno.id);
    const tienePagosPendientes = pagosPendientes.length > 0;
    
    setForm({
      monto: (alumno.montoPlan !== undefined && alumno.montoPlan !== null && !isNaN(alumno.montoPlan)) ? alumno.montoPlan.toString() : '',
      fecha: new Date().toISOString().split('T')[0],
      metodo: '',
      concepto: `Mensualidad ${new Date().toLocaleString('es-ES', { month: 'long' })}`,
      observaciones: tienePagosPendientes ? 'Tiene pagos pendientes anteriores' : '',
      tipoPago: 'normal',
      estado: 'Pendiente'
    });
    setFormError('');
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedAlumno(null);
    setFormError('');
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!form.monto || isNaN(form.monto) || Number(form.monto) <= 0) return 'Monto inválido';
    if (!form.fecha) return 'La fecha es obligatoria';
    if (!form.metodo) return 'El método de pago es obligatorio';
    if (!form.concepto) return 'El concepto es obligatorio';
    return '';
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const error = validateForm();
    if (error) {
      setFormError(error);
      return;
    }

    if (!selectedAlumno || !selectedAlumno.nombre || !selectedAlumno.id) {
      setFormError('Selecciona un alumno válido.');
      return;
    }

    try {
      const nuevoPago = {
        alumno: selectedAlumno.nombre,
        alumnoId: Number(selectedAlumno.id),
        monto: Number(form.monto),
        fecha: form.fecha,
        metodo: form.metodo,
        estado: form.estado,
        concepto: form.concepto,
        observaciones: form.observaciones || '',
        tipoPago: form.tipoPago || ''
      };

      await createPayment(nuevoPago);

      // Si el pago es completado, actualizar la fecha de vencimiento del alumno
      if (form.estado === 'Completado') {
        const planSeleccionado = planes.find(p => p.nombre === selectedAlumno.plan);
        if (planSeleccionado) {
          const fechaVencimiento = new Date(selectedAlumno.fechaVencimiento);
          fechaVencimiento.setDate(fechaVencimiento.getDate() + planSeleccionado.duracion);

          await studentsService.update(selectedAlumno.id, {
            ...selectedAlumno,
            fechaVencimiento: fechaVencimiento.toISOString().split('T')[0],
            ultimoPago: form.fecha
          });
        } else {
          setToast({ message: 'No se encontró el plan del alumno para actualizar la fecha de vencimiento.', type: 'error' });
        }
      }

      setToast({ message: 'Pago registrado correctamente', type: 'success' });
      setShowForm(false);
      setSelectedAlumno(null);
    } catch (err) {
      setFormError(err.message || 'Error al registrar el pago.');
      setToast({ message: err.message || 'Error al registrar el pago', type: 'error' });
    }
  };

  // Función para marcar un pago como completado
  const handleCompletePayment = async (pago) => {
    try {
      await updatePaymentStatus(pago.id, 'Completado');
      setToast({ message: 'Pago marcado como completado', type: 'success' });
    } catch (err) {
      setToast({ message: 'Error al actualizar el pago', type: 'error' });
    }
  };

  const filteredAlumnos = alumnos.filter(a =>
    !search || a.nombre.toLowerCase().includes(search.toLowerCase())
  );

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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'PYG',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Recomendaciones dinámicas según tipo de pago
  const getRecomendacion = () => {
    if (!selectedAlumno) return null;
    if (form.tipoPago === 'adelantado') {
      return `Recomendación: Si el alumno paga por adelantado, asegúrate de registrar correctamente el periodo cubierto y ajustar el próximo vencimiento.`;
    }
    if (form.tipoPago === 'parcial') {
      return `Recomendación: Si el pago es parcial, registra el monto recibido y deja constancia en observaciones. El sistema marcará el saldo pendiente.`;
    }
    // Normal
    return `Recomendación: El pago normal cubre el periodo actual del plan (${selectedAlumno.plan || 'Plan'}).`;
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Cobros</h1>
          <p className="mt-1 text-sm text-gray-500">
            Administra los cobros y pagos de los alumnos
          </p>
        </div>
        <div className="flex gap-2">
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
                  placeholder="Buscar alumno..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
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
                  Alumno
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plan y Monto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado de Pago
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
                        {estadoPago.pagosPendientes > 0 && (
                          <div className="text-xs text-red-600">
                            {estadoPago.pagosPendientes} pago(s) pendiente(s)
                          </div>
                        )}
                        {estadoPago.dias !== undefined && estadoPago.estado !== 'Sin fecha' && (
                          <div className={`text-xs ${
                            estadoPago.color === 'red' ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {estadoPago.dias < 0 
                              ? `Vencido hace ${Math.abs(estadoPago.dias)} días`
                              : `Vence en ${estadoPago.dias} días`}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {alumno.fechaVencimiento ? formatDate(alumno.fechaVencimiento) : 'Sin fecha de vencimiento'}
                      </div>
                      {alumno.fechaInicio && (
                        <div className="text-xs text-gray-500">
                          Inscrito: {formatDate(alumno.fechaInicio)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => setShowHistorial(alumno)}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        title="Ver historial de pagos"
                      >
                        <Clock className="h-4 w-4 mr-1.5" />
                        Historial
                      </button>
                      <button
                        onClick={() => handleOpenForm(alumno)}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        title="Registrar nuevo pago"
                      >
                        <DollarSign className="h-4 w-4 mr-1.5" />
                        Cobrar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Cobro */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Registrar Cobro
                  </h3>
                  <p className="text-sm text-gray-500">
                    {selectedAlumno?.nombre}
                  </p>
                </div>
                <button
                  onClick={handleCloseForm}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Cerrar</span>
                  ×
                </button>
              </div>
            </div>

            <form onSubmit={handleFormSubmit} className="px-4 py-3 space-y-3">
              {formError && (
                <div className="bg-red-50 text-red-800 p-2 rounded-md text-sm flex items-start">
                  <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              {getRecomendacion() && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded mb-2 text-yellow-800 text-sm flex items-start">
                  <Info className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
                  <span>{getRecomendacion()}</span>
                </div>
              )}

              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-start">
                  <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="ml-2">
                    <h4 className="text-sm font-medium text-blue-800">Información del Plan</h4>
                    <dl className="mt-1 space-y-1">
                      <div className="flex justify-between">
                        <dt className="text-sm text-blue-700">Plan:</dt>
                        <dd className="text-sm font-medium text-blue-900">{selectedAlumno?.plan || 'Sin plan'}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-blue-700">Monto sugerido:</dt>
                        <dd className="text-sm font-medium text-blue-900">{selectedAlumno?.montoPlan ? formatCurrency(selectedAlumno.montoPlan) : 'Sin monto'}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-blue-700">Próximo pago:</dt>
                        <dd className="text-sm font-medium text-blue-900">{selectedAlumno?.fechaVencimiento ? formatDate(selectedAlumno.fechaVencimiento) : 'Sin fecha'}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Tipo de Pago
                  </label>
                  <select
                    name="tipoPago"
                    value={form.tipoPago}
                    onChange={handleFormChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="normal">Pago Normal</option>
                    <option value="adelantado">Pago Adelantado</option>
                    <option value="parcial">Pago Parcial</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Método de Pago
                  </label>
                  <select
                    name="metodo"
                    value={form.metodo}
                    onChange={handleFormChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Seleccione un método</option>
                    <option value="Efectivo">Efectivo</option>
                    <option value="Tarjeta">Tarjeta</option>
                    <option value="Transferencia">Transferencia</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Monto
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">Gs</span>
                  </div>
                  <input
                    type="number"
                    name="monto"
                    value={form.monto}
                    onChange={handleFormChange}
                    className="block w-full pl-12 pr-3 border border-gray-300 rounded-md shadow-sm py-1.5 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Fecha
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    name="fecha"
                    value={form.fecha}
                    onChange={handleFormChange}
                    className="block w-full pl-10 border border-gray-300 rounded-md shadow-sm py-1.5 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Concepto
                </label>
                <input
                  type="text"
                  name="concepto"
                  value={form.concepto}
                  onChange={handleFormChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: Mensualidad Abril"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Observaciones
                </label>
                <textarea
                  name="observaciones"
                  value={form.observaciones}
                  onChange={handleFormChange}
                  rows="2"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Observaciones adicionales..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Estado del Pago
                </label>
                <select
                  name="estado"
                  value={form.estado}
                  onChange={handleFormChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Pendiente">Pendiente</option>
                  <option value="Completado">Completado</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Confirmar Cobro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Historial */}
      {showHistorial && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Historial de Pagos - {showHistorial.nombre}
                </h3>
                <button
                  onClick={() => setShowHistorial(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Cerrar</span>
                  ×
                </button>
              </div>
            </div>

            <div className="px-6 py-4">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Concepto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Monto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {(() => {
                      const pagosAlumno = payments.filter(p => p.alumnoId === showHistorial.id);
                      if (!pagosAlumno || pagosAlumno.length === 0) {
                        return (
                          <tr>
                            <td colSpan={5} className="text-center text-gray-500 py-4">
                              No hay pagos registrados para este alumno.
                            </td>
                          </tr>
                        );
                      }
                      return pagosAlumno.map((pago) => (
                        <tr key={pago.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(pago.fecha)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {pago.concepto}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(pago.monto)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              pago.estado === 'Completado' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {pago.estado}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {pago.estado === 'Pendiente' && (
                              <button
                                onClick={() => handleCompletePayment(pago)}
                                className="text-green-600 hover:text-green-900"
                              >
                                Marcar como Completado
                              </button>
                            )}
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200">
              <button
                onClick={() => setShowHistorial(false)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

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