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
    const stored = localStorage.getItem('entrenadores');
    return stored ? JSON.parse(stored) : initialEntrenadores;
  });

  // Save to localStorage whenever entrenadores changes
  useEffect(() => {
    localStorage.setItem('entrenadores', JSON.stringify(entrenadores));
  }, [entrenadores]);

  const addEntrenador = (entrenador) => {
    console.log('Adding new trainer:', entrenador);
    const newEntrenador = {
      ...entrenador,
      id: Date.now(),
      estado: entrenador.estado || 'Activo'
    };
    console.log('New trainer with ID:', newEntrenador);
    setEntrenadores(prev => {
      const updated = [...prev, newEntrenador];
      console.log('Updated trainers list:', updated);
      return updated;
    });
    return newEntrenador;
  };

  const updateEntrenador = (id, data) => {
    setEntrenadores(prev => prev.map(e => e.id === id ? { ...data, id } : e));
  };

  const deleteEntrenador = (id) => {
    setEntrenadores(prev => prev.filter(e => e.id !== id));
  };

  return (
    <EntrenadoresContext.Provider value={{ entrenadores, addEntrenador, updateEntrenador, deleteEntrenador }}>
      {children}
    </EntrenadoresContext.Provider>
  );
} 