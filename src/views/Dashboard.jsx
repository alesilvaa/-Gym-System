import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, CreditCard, Calendar, Clock, TrendingUp, TrendingDown, AlertTriangle, DollarSign, Edit2 } from 'lucide-react';
import { dashboardService, settingsService } from '../services/api';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

function getMonthName(monthIndex) {
  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  return months[monthIndex];
}

function getDayShortName(dayIndex) {
  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  return days[dayIndex];
}

function getDayName(dayIndex) {
  const days = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
  return days[dayIndex];
}

export default function Dashboard() {
  const { payments, students, classes, attendance, loading: contextLoading, error: contextError } = useApp();
  const [currentDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    alumnosActivos: 0,
    ingresosMensuales: 0,
    clasesHoy: 0,
    pagosPendientes: 0,
    montoPendiente: 0
  });
  const [ingresosData, setIngresosData] = useState([]);
  const [error, setError] = useState(null);
  const [metaDiaria, setMetaDiaria] = useState(8);
  const [metas, setMetas] = useState({
    alumnos: 300,
    ingresos: 6000000,
    pagosPendientes: 10
  });
  const [isEditingMeta, setIsEditingMeta] = useState(false);
  const [editingMetaType, setEditingMetaType] = useState(null);
  const [nuevaMeta, setNuevaMeta] = useState(0);
  const { currentUser } = useAuth();

  // Saludo dinámico según la hora
  const getSaludo = () => {
    const hora = new Date().getHours();
    if (hora >= 6 && hora < 12) return 'Buenos días!';
    if (hora >= 12 && hora < 19) return 'Buenas tardes!';
    return 'Buenas noches!';
  };

  // Cargar configuración inicial
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await settingsService.getSettings();
        setMetaDiaria(settings.metaDiariaClases);
        setMetas(settings.metas);
      } catch (error) {
        console.error('Error al cargar configuración:', error);
      }
    };
    loadSettings();
  }, []);

  // Función para actualizar la meta
  const handleUpdateMeta = async () => {
    try {
      if (editingMetaType === 'clases') {
        await settingsService.updateSettings({ metaDiariaClases: nuevaMeta });
        setMetaDiaria(nuevaMeta);
      } else {
        const updatedMetas = { ...metas, [editingMetaType]: nuevaMeta };
        await settingsService.updateSettings({ metas: updatedMetas });
        setMetas(updatedMetas);
      }
      setIsEditingMeta(false);
      setEditingMetaType(null);
    } catch (error) {
      console.error('Error al actualizar meta:', error);
    }
  };

  // Función para abrir el modal de edición
  const handleEditMeta = (type, currentValue) => {
    setEditingMetaType(type);
    setNuevaMeta(currentValue);
    setIsEditingMeta(true);
  };

  // Justo antes de calcular ingresos mensuales:
  // console.log('Pagos actuales para el gráfico:', payments);
  const now = new Date();
  const ingresosMeses = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    ingresosMeses.push({
      mes: getMonthName(d.getMonth()),
      year: d.getFullYear(),
      ingresos: 0
    });
  }
  if (payments && payments.length > 0) {
    (payments || []).forEach(p => {
      const pagoDate = new Date(p.fecha);
      const isCompletado = p.estado === 'Completado' || p.estado === 'completado' || p.estado === 'pagado';
      const alumno = students.find(s => s.id === p.alumnoId);
      if (!alumno || !isCompletado) return;
      const idx = ingresosMeses.findIndex(m => m.year === pagoDate.getFullYear() && m.mes === getMonthName(pagoDate.getMonth()));
      if (idx !== -1) {
        ingresosMeses[idx].ingresos += Number(p.monto) || 0;
      }
    });
  }

  // Calcular datos para el gráfico de asistencia semanal (semana actual)
  const today = new Date();
  const dayOfWeek = today.getDay();
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - dayOfWeek);
  const asistenciaDias = [0, 0, 0, 0, 0, 0, 0];
  (attendance || []).forEach(a => {
    const date = new Date(a.fecha);
    if (date >= sunday && date <= today) {
      const day = date.getDay();
      if (a.estado === 'Presente') asistenciaDias[day] += 1;
    }
  });
  const asistenciaData = Array.from({ length: 7 }, (_, idx) => ({
    name: getDayShortName(idx),
    asistencias: asistenciaDias[idx]
  }));

  // Calcular estadísticas cuando cambian los datos
  useEffect(() => {
    const calculateStats = async () => {
      try {
        setIsLoading(true);
        // Eliminar la llamada a dashboardService.getIncomeData y usar ingresosMeses calculado
        const [statsData, attendanceData] = await Promise.all([
          dashboardService.getStats(),
          dashboardService.getAttendanceData()
        ]);

        // Calcular alumnos activos (los que tienen estado 'Activo' o no tienen estado definido)
        const alumnosActivos = students.filter(s => 
          s.estado === 'Activo' || !s.estado
        ).length;

        // Calcular ingresos mensuales (solo pagos completados del mes actual)
        const ingresosMensuales = payments
          .filter(p => {
            const pagoDate = new Date(p.fecha);
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();
            const alumno = students.find(s => s.id === p.alumnoId);
            
            // Solo incluir pagos de alumnos existentes y que estén completados
            const isCompletado = p.estado === 'Completado' || p.estado === 'completado' || p.estado === 'pagado';
            const isCurrentMonth = pagoDate.getMonth() === currentMonth && pagoDate.getFullYear() === currentYear;
            
            if (alumno && isCompletado && isCurrentMonth) {
              console.log(`Incluyendo pago de ${alumno.nombre}: ${p.monto} Gs (${p.concepto})`);
              return true;
            }
            return false;
          })
          .reduce((sum, p) => {
            const monto = Number(p.monto) || 0;
            return sum + monto;
          }, 0);
        
        // Calcular clases de hoy
        const today = new Date();
        const dayName = getDayName(today.getDay());
        const clasesHoy = classes.filter(c => {
          // Verificar que la clase esté activa
          if (c.estado !== 'Activa') return false;
          
          // Verificar que el día actual esté en los días de la clase
          if (!Array.isArray(c.dias)) return false;
          
          return c.dias.includes(dayName);
        }).length;

        // Calcular pagos pendientes usando la misma lógica que la tabla
        const pagosPendientes = payments.filter(p => {
          const isPendiente = p.estado === 'Pendiente' || p.estado === 'pendiente';
          const alumno = students.find(s => s.id === p.alumnoId);
          if (!alumno) return false;

          // Verificar si el alumno es recién inscrito (menos de 2 días)
          const fechaInicio = new Date(alumno.fechaInicio);
          const diasDesdeInicio = Math.ceil((today - fechaInicio) / (1000 * 60 * 60 * 24));
          if (diasDesdeInicio <= 1) return false;

          // Verificar si el pago está vencido o próximo a vencer
          if (alumno.fechaVencimiento) {
            const fechaVencimiento = new Date(alumno.fechaVencimiento);
            const diasRestantes = Math.ceil((fechaVencimiento - today) / (1000 * 60 * 60 * 24));
            return isPendiente || diasRestantes <= 0;
          }

          return false;
        });

        // Calcular el monto total de pagos pendientes
        const montoPendiente = pagosPendientes.reduce((sum, p) => {
          const alumno = students.find(s => s.id === p.alumnoId);
          if (!alumno) return sum;
          
          // Si el pago está pendiente, usar su monto
          if (p.estado === 'Pendiente' || p.estado === 'pendiente') {
            return sum + (Number(p.monto) || 0);
          }
          
          // Si el plan está vencido, usar el monto del plan
          return sum + (Number(alumno.montoPlan) || 0);
        }, 0);

        setStats({
          alumnosActivos,
          ingresosMensuales,
          clasesHoy,
          pagosPendientes: pagosPendientes.length,
          montoPendiente
        });
        setIngresosData(ingresosMeses.map(m => ({ name: m.mes, ingresos: m.ingresos })));
        setError(null);
      } catch (err) {
        console.error('Error calculating dashboard stats:', err);
        setError('Error al calcular las estadísticas del dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    calculateStats();
  }, [students, payments, classes, currentDate, metas]);

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  // Pagos pendientes en tiempo real desde el contexto global
  const pagosPendientes = (payments || []).filter(p => {
    // Verificar que el pago esté pendiente
    const isPendiente = p.estado === 'Pendiente' || p.estado === 'pendiente';
    
    // Encontrar el alumno correspondiente
    const alumno = students.find(s => s.id === p.alumnoId);
    if (!alumno) return false; // No mostrar pagos de alumnos eliminados

    // Verificar si el alumno es recién inscrito (menos de 2 días)
    const fechaInicio = new Date(alumno.fechaInicio);
    const hoy = new Date();
    const diasDesdeInicio = Math.ceil((hoy - fechaInicio) / (1000 * 60 * 60 * 24));
    if (diasDesdeInicio <= 1) return false; // No mostrar pagos de alumnos recién inscritos

    // Verificar si el pago está vencido o próximo a vencer
    if (alumno.fechaVencimiento) {
      const fechaVencimiento = new Date(alumno.fechaVencimiento);
      const diasRestantes = Math.ceil((fechaVencimiento - hoy) / (1000 * 60 * 60 * 24));
      
      // Mostrar pagos pendientes si están vencidos o próximos a vencer (7 días o menos)
      return isPendiente || diasRestantes <= 0;
    }

    return false;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600 flex items-center">
          <AlertTriangle className="h-6 w-6 mr-2" />
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      {/* Header personalizado de saludo */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-800">{getSaludo()}{currentUser?.nombre ? `, ${currentUser.nombre}` : ''}</h2>
      </div>
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Panel de Control</h1>
          <p className="text-gray-600 mt-1">{formatDate(currentDate)}</p>
        </div>
        {pagosPendientes.length > 0 && (
          <div className="flex space-x-3">
            <button className="px-4 py-2 bg-red-100 text-red-700 rounded-lg flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2" />
              {pagosPendientes.length} Pagos Pendientes
            </button>
          </div>
        )}
      </div>

      {/* KPIs Principales */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow-lg rounded-xl hover:shadow-xl transition-all duration-300 border border-gray-100">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-3">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5">
                  <dt className="text-sm font-medium text-gray-500">Alumnos Activos</dt>
                  <dd className="text-3xl font-bold text-gray-900">{stats.alumnosActivos}</dd>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow-lg rounded-xl hover:shadow-xl transition-all duration-300 border border-gray-100">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-3">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5">
                  <dt className="text-sm font-medium text-gray-500">Ingresos Mensuales</dt>
                  <dd className="text-3xl font-bold text-gray-900">{stats.ingresosMensuales.toLocaleString()} Gs</dd>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow-lg rounded-xl hover:shadow-xl transition-all duration-300 border border-gray-100">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-3">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5">
                <dt className="text-sm font-medium text-gray-500">Clases Hoy</dt>
                <dd className="text-3xl font-bold text-gray-900">{stats.clasesHoy}</dd>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow-lg rounded-xl hover:shadow-xl transition-all duration-300 border border-gray-100">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-3">
                  <CreditCard className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5">
                  <dt className="text-sm font-medium text-gray-500">Pagos Pendientes</dt>
                  <dd className="text-3xl font-bold text-gray-900">{stats.pagosPendientes}</dd>
                </div>
              </div>
              <div className="flex items-center text-red-500">
                <span className="text-sm font-medium">{stats.montoPendiente.toLocaleString()} Gs</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pagos Pendientes */}
      <div className="bg-white shadow-lg rounded-xl p-6 hover:shadow-xl transition-all duration-300 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Pagos Pendientes</h2>
            <p className="text-sm text-gray-500">Requieren atención inmediata</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Alumno
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monto
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vencimiento
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {pagosPendientes.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center text-gray-500 py-4">
                    No hay pagos pendientes.
                  </td>
                </tr>
              ) : (
                pagosPendientes.map((pago, idx) => {
                  const alumno = students.find(s => s.id === pago.alumnoId);
                  if (!alumno) return null;

                  const hoy = new Date();
                  const fechaVencimiento = new Date(alumno.fechaVencimiento);
                  const diasRestantes = Math.ceil((fechaVencimiento - hoy) / (1000 * 60 * 60 * 24));

                  return (
                    <tr key={pago.id || idx} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{alumno.nombre}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{pago.monto ? pago.monto.toLocaleString() : 0} Gs</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {diasRestantes < 0 
                            ? `Vencido hace ${Math.abs(diasRestantes)} días`
                            : `Vence en ${diasRestantes} días`}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          diasRestantes < 0 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {diasRestantes < 0 ? 'Vencido' : 'Próximo a vencer'}
                        </span>
                      </td>
                    </tr>
                  );
                }).filter(Boolean)
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Gráficos Principales */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white shadow-lg rounded-xl p-6 hover:shadow-xl transition-all duration-300 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Ingresos Mensuales</h2>
              <p className="text-sm text-gray-500">Tendencia de los últimos 6 meses</p>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ingresosData}>
                <defs>
                  <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar 
                  dataKey="ingresos" 
                  fill="url(#colorIngresos)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white shadow-lg rounded-xl p-6 hover:shadow-xl transition-all duration-300 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Asistencia Semanal</h2>
              <p className="text-sm text-gray-500">Comparativa con la meta semanal</p>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={asistenciaData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar dataKey="asistencias" fill="url(#colorIngresos)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="esperado" fill="#e5e7eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
  