import { createContext, useContext, useState, useEffect } from 'react';
import { studentsService, classesService, paymentsService, attendanceService } from '../services/api';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [payments, setPayments] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [studentsData, classesData, paymentsData] = await Promise.all([
        studentsService.getAll(),
        classesService.getAll(),
        paymentsService.getAll()
      ]);

      setStudents(studentsData);
      setClasses(classesData);
      setPayments(paymentsData);
      setError(null);
    } catch (error) {
      console.error('Error al cargar datos iniciales:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Funciones para actualizar el estado
  const updateStudents = async () => {
    try {
      const data = await studentsService.getAll();
      setStudents(data);
    } catch (error) {
      console.error('Error al actualizar estudiantes:', error);
      setError(error.message);
    }
  };

  const updateClasses = async () => {
    try {
      const data = await classesService.getAll();
      setClasses(data);
    } catch (error) {
      console.error('Error al actualizar clases:', error);
      setError(error.message);
    }
  };

  const updatePayments = async () => {
    try {
      const data = await paymentsService.getAll();
      setPayments(data);
    } catch (error) {
      console.error('Error al actualizar pagos:', error);
      setError(error.message);
    }
  };

  const updateAttendance = async () => {
    try {
      const data = await attendanceService.getAll();
      setAttendance(data);
    } catch (error) {
      console.error('Error al actualizar asistencias:', error);
      setError(error.message);
    }
  };

  // Función para crear un nuevo pago y actualizar el estado
  const createPayment = async (paymentData) => {
    try {
      const newPayment = await paymentsService.create(paymentData);
      await updatePayments(); // Actualizar la lista de pagos
      return newPayment;
    } catch (error) {
      console.error('Error al crear pago:', error);
      setError(error.message);
      throw error;
    }
  };

  // Función para actualizar el estado de un pago
  const updatePaymentStatus = async (paymentId, newStatus) => {
    try {
      const updatedPayment = await paymentsService.update(paymentId, { estado: newStatus });
      await updatePayments();
      return updatedPayment;
    } catch (error) {
      console.error('Error al actualizar estado del pago:', error);
      setError(error.message);
      throw error;
    }
  };

  // Función para obtener pagos pendientes de un alumno
  const getPendingPayments = (alumnoId) => {
    return payments.filter(p => 
      p.alumnoId === alumnoId && 
      (p.estado === 'Pendiente' || p.estado === 'pendiente')
    );
  };

  // Función para obtener el total de pagos pendientes
  const getTotalPendingPayments = () => {
    return payments.filter(p => 
      p.estado === 'Pendiente' || p.estado === 'pendiente'
    );
  };

  // Función para obtener el monto total de pagos pendientes
  const getTotalPendingAmount = () => {
    return getTotalPendingPayments().reduce((sum, p) => sum + (Number(p.monto) || 0), 0);
  };

  const value = {
    students,
    classes,
    payments,
    attendance,
    loading,
    error,
    updateStudents,
    updateClasses,
    updatePayments,
    updateAttendance,
    createPayment,
    updatePaymentStatus,
    getPendingPayments,
    getTotalPendingPayments,
    getTotalPendingAmount,
    refreshAll: loadInitialData
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

// Exportamos el hook como una constante nombrada
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp debe ser usado dentro de un AppProvider');
  }
  return context;
}; 