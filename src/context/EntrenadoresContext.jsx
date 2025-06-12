import React, { createContext, useContext, useState, useEffect } from 'react';

const initialEntrenadores = [
  { id: 1, nombre: 'María Pérez', email: 'maria.entrenadora@email.com', especialidad: 'Yoga', telefono: '0981 123 456', estado: 'Activo' },
  { id: 2, nombre: 'Juan Gómez', email: 'juan.gomez@email.com', especialidad: 'Spinning', telefono: '0982 654 321', estado: 'Activo' },
];

const EntrenadoresContext = createContext();

export function useEntrenadores() {
  const context = useContext(EntrenadoresContext);
  if (!context) {
    throw new Error('useEntrenadores debe ser usado dentro de un EntrenadoresProvider');
  }
  return context;
}

export function EntrenadoresProvider({ children }) {
  const [entrenadores, setEntrenadores] = useState(() => {
    try {
      const stored = localStorage.getItem('entrenadores');
      return stored ? JSON.parse(stored) : initialEntrenadores;
    } catch (error) {
      console.error('Error al cargar entrenadores del localStorage:', error);
      return initialEntrenadores;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('entrenadores', JSON.stringify(entrenadores));
    } catch (error) {
      console.error('Error al guardar entrenadores en localStorage:', error);
    }
  }, [entrenadores]);

  const addEntrenador = (entrenador) => {
    try {
      const newEntrenador = {
        ...entrenador,
        id: Date.now(),
        estado: entrenador.estado || 'Activo'
      };
      setEntrenadores(prev => [...prev, newEntrenador]);
      return newEntrenador;
    } catch (error) {
      console.error('Error al agregar entrenador:', error);
      throw error;
    }
  };

  const updateEntrenador = (id, data) => {
    try {
      const updatedEntrenador = { ...data, id };
      setEntrenadores(prev => prev.map(e => e.id === id ? updatedEntrenador : e));
      return updatedEntrenador;
    } catch (error) {
      console.error('Error al actualizar entrenador:', error);
      throw error;
    }
  };

  const deleteEntrenador = (id) => {
    try {
      setEntrenadores(prev => prev.filter(e => e.id !== id));
    } catch (error) {
      console.error('Error al eliminar entrenador:', error);
      throw error;
    }
  };

  return (
    <EntrenadoresContext.Provider value={{ entrenadores, addEntrenador, updateEntrenador, deleteEntrenador }}>
      {children}
    </EntrenadoresContext.Provider>
  );
} 