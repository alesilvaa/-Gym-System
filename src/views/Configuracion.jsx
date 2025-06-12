import { useState } from 'react';
import { Settings, Calendar, Bell, Lock, Save } from 'lucide-react';

function Toast({ message, type, onClose }) {
  return (
    <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded shadow-lg flex items-center gap-2 ${type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 text-lg font-bold">×</button>
    </div>
  );
}

export default function Configuracion() {
  const [activeTab, setActiveTab] = useState('general');
  const [toast, setToast] = useState(null);

  const tabs = [
    { id: 'general', name: 'General', icon: Settings },
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

      {/* Toast de feedback */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
  