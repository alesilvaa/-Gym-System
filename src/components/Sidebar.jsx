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
      className={`bg-[#23272f] transition-all duration-300 ease-in-out ${
        collapsed ? 'w-20' : 'w-64'
      } fixed h-screen z-30 border-r border-[#23272f] shadow-lg`}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-[#23272f]">
          {!collapsed ? (
            <div className="flex items-center space-x-3">
              <div className="bg-[#23272f] p-2.5 rounded-xl flex items-center justify-center border border-[#31343c]">
                <Home className="h-5 w-5 text-[#42a5f5]" fill="#42a5f5" />
              </div>
              <h1 className="text-xl font-semibold text-white tracking-wide">GymCore</h1>
            </div>
          ) : (
            <div className="bg-[#23272f] p-2.5 rounded-xl mx-auto flex items-center justify-center border border-[#31343c]">
              <Home className="h-5 w-5 text-[#42a5f5]" fill="#42a5f5" />
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-[#31343c] transition-all duration-200"
            title={collapsed ? "Expandir menú" : "Colapsar menú"}
          >
            {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4 px-2">
          <nav className="space-y-1">
            {tabsDisponibles.map((tab) => {
              const Icon = tabNames[tab]?.icon;
              const isActive = location.pathname === tabNames[tab]?.path;
              return (
                <button
                  key={tab}
                  onClick={() => navigate(tabNames[tab]?.path)}
                  className={`group flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 relative overflow-hidden ${
                    isActive
                      ? 'bg-[#282c34] text-white font-semibold shadow border-l-4 border-[#42a5f5]'
                      : 'text-white/70 hover:bg-[#23272f] hover:text-white'
                  }`}
                  title={collapsed ? tabNames[tab]?.name : undefined}
                  style={{ minHeight: '44px' }}
                >
                  {/* Barra de acento para el activo */}
                  {isActive && (
                    <span className="absolute left-0 top-0 h-full w-1 bg-[#42a5f5] rounded-r" />
                  )}
                  <span className={`p-2 rounded-lg flex items-center justify-center transition-all duration-200 ${
                    isActive
                      ? 'bg-[#42a5f5] text-white shadow'
                      : 'bg-[#23272f] text-white/70 group-hover:bg-[#31343c] group-hover:text-white'
                  }`}>
                    <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 1.5} fill={isActive ? '#42a5f5' : 'none'} />
                  </span>
                  {!collapsed && (
                    <div className="ml-3 flex-1 flex items-center justify-between">
                      <span className="font-medium truncate">{tabNames[tab]?.name}</span>
                    </div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Separador */}
        <div className="my-2 border-t border-[#31343c] mx-4" />

        {/* User Profile */}
        <div className="p-4">
          <div className="flex items-center justify-between bg-[#282c34] rounded-xl shadow-md p-3">
            {!collapsed ? (
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-xl bg-[#23272f] flex items-center justify-center border border-[#31343c]">
                  <UserCircle className="h-6 w-6 text-[#42a5f5]" fill="#42a5f5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white truncate">{currentUser?.nombre}</p>
                  <p className="text-xs text-white/50 capitalize truncate">{currentUser?.rol}</p>
                </div>
              </div>
            ) : (
              <div className="h-10 w-10 rounded-xl bg-[#23272f] flex items-center justify-center mx-auto border border-[#31343c]">
                <UserCircle className="h-6 w-6 text-[#42a5f5]" fill="#42a5f5" />
              </div>
            )}
            <button
              onClick={onLogout}
              className={`p-2 rounded-lg text-white/60 hover:text-white hover:bg-[#31343c] transition-all duration-200 ${
                collapsed ? 'mx-auto' : ''
              }`}
              title="Cerrar sesión"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
