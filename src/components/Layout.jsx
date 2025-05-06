import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import { tabsPorRol } from '../constants/roles';

export default function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useAuth();

  // Usar las pestañas definidas en el archivo de constantes
  const tabsDisponibles = tabsPorRol[currentUser?.rol] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Redirigir si no hay usuario o si es entrenador/alumno
  useEffect(() => {
    if (!currentUser && location.pathname !== '/login') {
      navigate('/login', { replace: true });
    } else if (currentUser?.rol === 'entrenador' && location.pathname === '/dashboard') {
      navigate('/mis-clases-entrenador', { replace: true });
    } else if (currentUser?.rol === 'alumno' && location.pathname === '/dashboard') {
      navigate('/mis-clases', { replace: true });
    }
  }, [currentUser, location.pathname, navigate]);

  if (location.pathname === '/login') {
    return children;
  }

  if (!currentUser) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        tabsDisponibles={tabsDisponibles}
        currentUser={currentUser}
        onLogout={handleLogout}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />
      <main className={`flex-1 transition-all duration-300 ${collapsed ? 'ml-20' : 'ml-64'}`}>
        {children}
      </main>
    </div>
  );
} 