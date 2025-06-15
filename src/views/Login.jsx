import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Datos de ejemplo de usuarios (en un sistema real esto vendría de una base de datos)
const usuarios = [
  {
    email: 'admin@gym.com',
    password: 'admin123',
    nombre: 'Veronica',
    rol: 'admin'
  },
  {
    email: 'entrenador@gym.com',
    password: 'entrenador123',
    nombre: 'Carlos',
    rol: 'entrenador'
  },
  {
    email: 'recepcionista@gym.com',
    password: 'recepcionista123',
    nombre: 'Facundo',
    rol: 'recepcionista'
  },
  {
    email: 'alumno@gym.com',
    password: 'alumno123',
    nombre: 'María',
    rol: 'alumno'
  }
];

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    if (!email) {
      setError('Por favor ingrese su email');
      return false;
    }
    if (!password) {
      setError('Por favor ingrese su contraseña');
      return false;
    }
    if (!email.includes('@')) {
      setError('Por favor ingrese un email válido');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);

    // Simular un delay para mostrar el estado de carga
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Buscar en usuarios fijos
    let usuario = usuarios.find(u => u.email === email && u.password === password);

    // Si no está, buscar en entrenadores de localStorage
    if (!usuario) {
      const entrenadores = JSON.parse(localStorage.getItem('entrenadores') || '[]');
      const entrenador = entrenadores.find(e => e.email === email);
      if (entrenador && password === 'entrenador123') {
        usuario = {
          nombre: entrenador.nombre,
          rol: 'entrenador',
          email: entrenador.email
        };
      }
    }

    if (usuario) {
      try {
        login({
          nombre: usuario.nombre,
          rol: usuario.rol,
          email: usuario.email
        });
        navigate('/');
      } catch (err) {
        setError('Error al iniciar sesión. Por favor, intente nuevamente.');
        setLoading(false);
      }
    } else {
      setError('Email o contraseña incorrectos');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-blue-400 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="mt-6 text-4xl font-extrabold text-white tracking-tight">
            Bienvenido a GymCore
          </h2>
          <p className="mt-2 text-lg text-blue-100">
            Sistema de gestión para gimnasios
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/90 backdrop-blur-lg py-8 px-4 shadow-2xl rounded-2xl sm:px-10 transform transition-all duration-300 hover:scale-[1.02]">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1 relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-blue-500" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-base border-2 border-gray-200 rounded-full transition-all duration-200 py-3 font-medium"
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <div className="mt-1 relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-blue-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-10 sm:text-base border-2 border-gray-200 rounded-full transition-all duration-200 py-3 font-medium"
                  placeholder="••••••••"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-blue-500 hover:text-blue-700 transition-colors duration-200"
                  >
                    {showPassword ? "Ocultar" : "Mostrar"}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 p-4 border border-red-200 animate-fade-in">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      {error}
                    </h3>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-3 px-4 border-2 border-transparent rounded-full shadow-sm text-base font-semibold text-white transition-all duration-200 ${
                  loading 
                    ? 'bg-blue-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-0.5'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                    Ingresando...
                  </>
                ) : (
                  'Ingresar'
                )}
              </button>
            </div>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">
                  Datos de prueba
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4">
              <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-blue-200 transition-colors duration-200">
                <p className="font-semibold text-blue-600">Admin:</p>
                <p className="mt-1">Email: admin@gym.com</p>
                <p>Contraseña: admin123</p>
              </div>
              <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-blue-200 transition-colors duration-200">
                <p className="font-semibold text-blue-600">Entrenador:</p>
                <p className="mt-1">Email: entrenador@gym.com</p>
                <p>Contraseña: entrenador123</p>
              </div>
              <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-blue-200 transition-colors duration-200">
                <p className="font-semibold text-blue-600">Recepcionista:</p>
                <p className="mt-1">Email: recepcionista@gym.com</p>
                <p>Contraseña: recepcionista123</p>
              </div>
              <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-blue-200 transition-colors duration-200">
                <p className="font-semibold text-blue-600">Alumno:</p>
                <p className="mt-1">Email: alumno@gym.com</p>
                <p>Contraseña: alumno123</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 