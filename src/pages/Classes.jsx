import { useEffect, useState } from 'react';
import { classesService } from '../services/api';

export default function Classes() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      setLoading(true);
      const data = await classesService.getAll();
      setClasses(data);
      setError(null);
    } catch (error) {
      console.error('Error al cargar clases:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-500">Error al cargar las clases</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Clases</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entrenador</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Horario</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacidad</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {classes.map((clase) => (
              <tr key={clase.id}>
                <td className="px-6 py-4 whitespace-nowrap">{clase.nombre}</td>
                <td className="px-6 py-4 whitespace-nowrap">{clase.entrenador}</td>
                <td className="px-6 py-4 whitespace-nowrap">{clase.horario}</td>
                <td className="px-6 py-4 whitespace-nowrap">{clase.capacidad}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 