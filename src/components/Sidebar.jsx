import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  CreditCard, 
  Calendar, 
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Home,
  UserCircle,
  DollarSign
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const tabNames = {
  'dashboard': { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  'alumnos': { name: 'Alumnos', icon: Users, path: '/alumnos' },
  'entrenadores': { name: 'Entrenadores', icon: Users, path: '/entrenadores' },
  'clases': { name: 'Clases', icon: BookOpen, path: '/clases' },
  'pagos': { name: 'Pagos', icon: CreditCard, path: '/pagos' },
  'cobros': { name: 'Cobros', icon: DollarSign, path: '/cobros' },
  'asistencia': { name: 'Asistencia', icon: Calendar, path: '/asistencia' },
  'configuracion': { name: 'Configuración', icon: Settings, path: '/configuracion' },
  'mis-clases': { name: 'Mis Clases', icon: BookOpen, path: '/mis-clases' },
  'mis-pagos': { name: 'Mis Pagos', icon: CreditCard, path: '/mis-pagos' },
  'mis-clases-entrenador': { name: 'Mis Clases', icon: BookOpen, path: '/mis-clases-entrenador' },
  'membresias': { name: 'Membresías', icon: CreditCard, path: '/membresias' },
  'usuarios': { name: 'Usuarios', icon: Users, path: '/usuarios' }
};

export default function Sidebar({ tabsDisponibles, currentUser, onLogout, collapsed, setCollapsed }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div 
      className={`bg-white shadow-lg transition-all duration-300 ease-in-out ${
        collapsed ? 'w-20' : 'w-64'
      } fixed h-screen z-30 border-r border-gray-100`}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-gray-100">
          {!collapsed ? (
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Home className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-800">GymCore</h1>
            </div>
          ) : (
            <div className="bg-blue-600 p-2 rounded-lg mx-auto">
              <Home className="h-6 w-6 text-white" />
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            title={collapsed ? "Expandir menú" : "Colapsar menú"}
          >
            {collapsed ? <ChevronRight className="h-5 w-5 text-gray-600" /> : <ChevronLeft className="h-5 w-5 text-gray-600" />}
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="px-3 space-y-1">
            {tabsDisponibles.map((tab) => {
              const Icon = tabNames[tab]?.icon;
              const isActive = location.pathname === tabNames[tab]?.path;
              return (
                <button
                  key={tab}
                  onClick={() => navigate(tabNames[tab]?.path)}
                  className={`group flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  title={collapsed ? tabNames[tab]?.name : undefined}
                >
                  <div className={`p-2 rounded-lg ${
                    isActive ? 'bg-blue-100' : 'bg-gray-100 group-hover:bg-gray-200'
                  } transition-colors duration-200`}>
                    <Icon className={`h-5 w-5 ${
                      isActive ? 'text-blue-600' : 'text-gray-600 group-hover:text-gray-900'
                    }`} />
                  </div>
                  {!collapsed && (
                    <div className="ml-3 flex-1 flex items-center justify-between">
                      <span>{tabNames[tab]?.name}</span>
                      {isActive && (
                        <div className="h-2 w-2 rounded-full bg-blue-600" />
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            {!collapsed ? (
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <UserCircle className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{currentUser?.nombre}</p>
                  <p className="text-xs text-gray-500 capitalize">{currentUser?.rol}</p>
                </div>
              </div>
            ) : (
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mx-auto">
                <UserCircle className="h-6 w-6 text-blue-600" />
              </div>
            )}
            <button
              onClick={onLogout}
              className={`p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 ${
                collapsed ? 'mx-auto' : ''
              }`}
              title="Cerrar sesión"
            >
              <LogOut className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
