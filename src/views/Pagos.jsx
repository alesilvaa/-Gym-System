import { useState, useEffect } from 'react';
import { CreditCard, Search, Filter, Download, Upload, AlertTriangle, Clock, User, Calendar, ChevronLeft, ChevronRight, DollarSign, X } from 'lucide-react';
import { paymentsService } from '../services/api';
import { useApp } from '../context/AppContext';

function Toast({ message, type, onClose }) {
  return (
    <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded shadow-lg flex items-center gap-2 ${type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
      {type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 text-lg font-bold">×</button>
    </div>
  );
}

function FilterModal({ isOpen, onClose, filters, setFilters, onApply }) {
  if (!isOpen) return null;

  const months = [
    { value: 0, label: 'Enero' },
    { value: 1, label: 'Febrero' },
    { value: 2, label: 'Marzo' },
    { value: 3, label: 'Abril' },
    { value: 4, label: 'Mayo' },
    { value: 5, label: 'Junio' },
    { value: 6, label: 'Julio' },
    { value: 7, label: 'Agosto' },
    { value: 8, label: 'Septiembre' },
    { value: 9, label: 'Octubre' },
    { value: 10, label: 'Noviembre' },
    { value: 11, label: 'Diciembre' }
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      month: '',
      year: '',
      estado: '',
      metodo: ''
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Filtrar Pagos</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mes
            </label>
            <select
              name="month"
              value={filters.month}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los meses</option>
              {months.map(month => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Año
            </label>
            <select
              name="year"
              value={filters.year}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los años</option>
              {years.map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              name="estado"
              value={filters.estado}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los estados</option>
              <option value="Completado">Completado</option>
              <option value="Pendiente">Pendiente</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Método de Pago
            </label>
            <select
              name="metodo"
              value={filters.metodo}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los métodos</option>
              <option value="Efectivo">Efectivo</option>
              <option value="Tarjeta">Tarjeta</option>
              <option value="Transferencia">Transferencia</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-lg"
          >
            Limpiar
          </button>
          <button
            onClick={onApply}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
          >
            Aplicar Filtros
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Pagos() {
  const { payments, loading: contextLoading, error: contextError } = useApp();
  const { students } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' or 'list'
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({
    month: '',
    year: '',
    estado: '',
    metodo: ''
  });

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'PYG'
    }).format(amount);
  };

  const getMonthName = (monthIndex) => {
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return months[monthIndex];
  };

  const handlePreviousMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
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

  const getPaymentsForDate = (date) => {
    return payments.filter(pago => {
      if (!pago || !pago.fecha) return false;
      const pagoDate = new Date(pago.fecha);
      return pagoDate.getDate() === date.getDate() &&
             pagoDate.getMonth() === date.getMonth() &&
             pagoDate.getFullYear() === date.getFullYear() &&
             (pago.estado === 'Completado' || pago.estado === 'completado' || pago.estado === 'pagado');
    });
  };

  const getPaymentsForMonth = () => {
    return payments.filter(pago => {
      if (!pago || !pago.fecha) return false;
      const pagoDate = new Date(pago.fecha);
      return pagoDate.getMonth() === selectedMonth &&
             pagoDate.getFullYear() === selectedYear &&
             (pago.estado === 'Completado' || pago.estado === 'completado' || pago.estado === 'pagado');
    });
  };

  const calculateDailyIncome = (date) => {
    const dailyPayments = getPaymentsForDate(date);
    return dailyPayments.reduce((total, pago) => total + (pago.monto || 0), 0);
  };

  const calculateMonthlyIncome = () => {
    const monthlyPayments = getPaymentsForMonth();
    return monthlyPayments.reduce((total, pago) => total + (pago.monto || 0), 0);
  };

  const filteredPagos = payments.filter(pago => {
    if (!pago) return false;
    
    const alumno = students.find(s => s.id === pago.alumnoId);
    if (!alumno) return false;
    
    const isCompletado = pago.estado === 'Completado' || pago.estado === 'completado' || pago.estado === 'pagado';
    if (!isCompletado) return false;
    
    const searchTermLower = searchTerm.toLowerCase();
    const alumnoMatch = alumno.nombre.toLowerCase().includes(searchTermLower);
    const conceptoMatch = pago.concepto?.toLowerCase().includes(searchTermLower) || false;
    
    // Apply additional filters
    const pagoDate = new Date(pago.fecha);
    const monthMatch = filters.month === '' || pagoDate.getMonth() === parseInt(filters.month);
    const yearMatch = filters.year === '' || pagoDate.getFullYear() === parseInt(filters.year);
    const estadoMatch = filters.estado === '' || pago.estado === filters.estado;
    const metodoMatch = filters.metodo === '' || pago.metodo === filters.metodo;
    
    return (alumnoMatch || conceptoMatch) && monthMatch && yearMatch && estadoMatch && metodoMatch;
  });

  const handleApplyFilters = () => {
    setShowFilterModal(false);
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
          <h1 className="text-2xl font-bold text-gray-900">Historial de Pagos</h1>
          <p className="mt-1 text-sm text-gray-500">
            Registro de todos los pagos realizados
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setViewMode(viewMode === 'calendar' ? 'list' : 'calendar')}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium flex items-center transition-all duration-200 ${
              viewMode === 'calendar' 
                ? 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100' 
                : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
            }`}
          >
            {viewMode === 'calendar' ? (
              <>
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                Vista Lista
              </>
            ) : (
              <>
                <Calendar className="h-4 w-4 mr-2" />
                Vista Calendario
              </>
            )}
          </button>
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <>
          {/* Monthly Income Card */}
          <div className="bg-white shadow-md rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <button 
                  onClick={handlePreviousMonth}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                >
                  <ChevronLeft className="h-5 w-5 text-gray-600" />
                </button>
                <h2 className="text-xl font-semibold text-gray-900">
                  {getMonthName(selectedMonth)} {selectedYear}
                </h2>
                <button 
                  onClick={handleNextMonth}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                >
                  <ChevronRight className="h-5 w-5 text-gray-600" />
                </button>
              </div>
              <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-lg">
                <span className="text-2xl font-bold text-green-700">
                  {formatCurrency(calculateMonthlyIncome())}
                </span>
              </div>
            </div>
          </div>

          {/* Daily Income Card */}
          <div className="bg-white shadow-md rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <button 
                  onClick={handlePreviousDay}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                >
                  <ChevronLeft className="h-5 w-5 text-gray-600" />
                </button>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <span className="text-lg font-medium">
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
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                >
                  <ChevronRight className="h-5 w-5 text-gray-600" />
                </button>
              </div>
              <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-lg">
                <span className="text-2xl font-bold text-green-700">
                  {formatCurrency(calculateDailyIncome(currentDate))}
                </span>
              </div>
            </div>

            {/* Daily Payments List */}
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-500 mb-3">Pagos del día</h3>
              <div className="space-y-3">
                {getPaymentsForDate(currentDate).map((pago) => (
                  <div key={pago.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600 font-medium">
                          {pago.alumno ? pago.alumno.charAt(0) : '?'}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{pago.alumno || 'Sin nombre'}</p>
                        <p className="text-xs text-gray-500">{pago.concepto || 'Sin concepto'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{formatCurrency(pago.monto || 0)}</p>
                      <p className="text-xs text-gray-500">{pago.metodo || 'No especificado'}</p>
                    </div>
                  </div>
                ))}
                {getPaymentsForDate(currentDate).length === 0 && (
                  <div className="text-center py-8 bg-gray-50 rounded-lg shadow-sm">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No hay pagos registrados para este día</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Buscar por nombre del alumno o concepto..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowFilterModal(true)}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center transition-colors duration-200"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros
                  {(filters.month !== '' || filters.year !== '' || filters.estado !== '' || filters.metodo !== '') && (
                    <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      Activos
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alumno</th>
                  <th className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                  <th className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Método</th>
                  <th className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Concepto</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPagos.map((pago) => (
                  <tr key={pago.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 font-medium">
                              {pago.alumno ? pago.alumno.charAt(0) : '?'}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {pago.alumno || 'Sin nombre'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(pago.monto || 0)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {pago.fecha ? formatDate(pago.fecha) : 'Sin fecha'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <CreditCard className="h-4 w-4 mr-1" />
                        {pago.metodo || 'No especificado'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        pago.estado === 'Completado' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {pago.estado || 'Pendiente'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {pago.concepto || 'Sin concepto'}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredPagos.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center">
                      <div className="flex flex-col items-center">
                        <Search className="h-12 w-12 text-gray-400 mb-3" />
                        <p className="text-gray-500">No se encontraron pagos que coincidan con los criterios de búsqueda</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <FilterModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        filters={filters}
        setFilters={setFilters}
        onApply={handleApplyFilters}
      />

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
  