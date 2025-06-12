// Datos de ejemplo (mock)
const mockData = {
  students: [],
  classes: [
    { 
      id: 1, 
      nombre: 'Yoga', 
      instructor: 'Ana López',
      dias: ['lunes', 'miercoles', 'viernes'],
      horaInicio: '09:00',
      horaFin: '10:00',
      capacidad: 20,
      nivel: 'Principiante',
      estado: 'Activa',
      inscritos: 15,
      membresiasPermitidas: [1, 2] // IDs de las membresías que pueden acceder
    },
    { 
      id: 2, 
      nombre: 'Pilates', 
      instructor: 'Carlos Ruiz',
      dias: ['martes', 'jueves'],
      horaInicio: '11:00',
      horaFin: '12:00',
      capacidad: 15,
      nivel: 'Intermedio',
      estado: 'Activa',
      inscritos: 10,
      membresiasPermitidas: [2] // Solo membresía Premium
    }
  ],
  payments: [],
  attendance: [],
  dashboard: {
    alumnosActivos: 0,
    ingresosMensuales: 0,
    clasesHoy: 2,
    pagosPendientes: 0
  },
  trainers: [
    { id: 1, nombre: 'Ana López', especialidad: 'Yoga', email: 'ana@yoga.com' },
    { id: 2, nombre: 'Carlos Ruiz', especialidad: 'Pilates', email: 'carlos@pilates.com' }
  ],
  settings: {
    nombreGimnasio: 'GymCore',
    direccion: 'Calle Ficticia 123',
    telefono: '555-1234',
    metaDiariaClases: 8,
    metas: {
      alumnos: 300,
      ingresos: 6000000,
      pagosPendientes: 10
    }
  }
};

// Auth Service (mock)
export const authService = {
  login: async (credentials) => {
    // Usuarios de prueba
    const usuarios = [
      { email: 'admin@gym.com', password: 'admin123', nombre: 'Joseli', rol: 'admin' },
      { email: 'entrenador@gym.com', password: 'entrenador123', nombre: 'Carlos', rol: 'entrenador' },
      { email: 'recepcionista@gym.com', password: 'recepcionista123', nombre: 'Facundo', rol: 'recepcionista' },
      { email: 'alumno@gym.com', password: 'alumno123', nombre: 'María', rol: 'alumno' }
    ];
    const user = usuarios.find(u => u.email === credentials.email && u.password === credentials.password);
    if (!user) throw new Error('Credenciales inválidas');
    return { nombre: user.nombre, email: user.email, rol: user.rol };
  },
  logout: () => {},
  getCurrentUser: async () => null
};

export const studentsService = {
  getAll: async () => mockData.students,
  getById: async (id) => mockData.students.find(s => s.id === id),
  create: async (studentData) => {
    const newStudent = { 
      id: mockData.students.length + 1, 
      activo: true,
      ...studentData 
    };
    mockData.students.push(newStudent);
    return newStudent;
  },
  update: async (id, studentData) => {
    const idx = mockData.students.findIndex(s => s.id === id);
    if (idx !== -1) {
      mockData.students[idx] = { ...mockData.students[idx], ...studentData };
      return mockData.students[idx];
    }
    throw new Error('Student not found');
  },
  delete: async (id) => {
    const idx = mockData.students.findIndex(s => s.id === id);
    if (idx !== -1) {
      mockData.students.splice(idx, 1);
      return true;
    }
    return false;
  }
};

export const classesService = {
  getAll: async () => mockData.classes,
  getById: async (id) => mockData.classes.find(c => c.id === id),
  create: async (classData) => {
    const newClass = { 
      id: mockData.classes.length + 1,
      inscritos: 0,
      estado: 'Activa',
      membresiasPermitidas: classData.membresiasPermitidas || [],
      ...classData 
    };
    mockData.classes.push(newClass);
    return newClass;
  },
  update: async (id, classData) => {
    const idx = mockData.classes.findIndex(c => c.id === id);
    if (idx !== -1) {
      mockData.classes[idx] = { 
        ...mockData.classes[idx], 
        ...classData,
        membresiasPermitidas: classData.membresiasPermitidas || mockData.classes[idx].membresiasPermitidas
      };
      return mockData.classes[idx];
    }
    throw new Error('Class not found');
  },
  delete: async (id) => {
    const idx = mockData.classes.findIndex(c => c.id === id);
    if (idx !== -1) {
      mockData.classes.splice(idx, 1);
      return true;
    }
    return false;
  },
  inscribirse: async (classId, studentId) => {
    const clase = mockData.classes.find(c => c.id === classId);
    if (!clase) {
      throw new Error('Clase no encontrada');
    }
    if (clase.inscritos >= clase.capacidad) {
      throw new Error('La clase ya no tiene cupos disponibles');
    }
    
    // Verificar si el estudiante ya está inscrito
    const inscripcionExistente = mockData.inscripciones?.find(
      i => i.claseId === classId && i.studentId === studentId
    );
    if (inscripcionExistente) {
      throw new Error('Ya estás inscrito en esta clase');
    }

    // Crear la inscripción
    if (!mockData.inscripciones) {
      mockData.inscripciones = [];
    }
    mockData.inscripciones.push({
      id: mockData.inscripciones.length + 1,
      claseId,
      studentId,
      fechaInscripcion: new Date().toISOString()
    });

    // Actualizar el número de inscritos
    clase.inscritos += 1;
    return clase;
  },
  cancelarInscripcion: async (classId, studentId) => {
    const clase = mockData.classes.find(c => c.id === classId);
    if (!clase) {
      throw new Error('Clase no encontrada');
    }

    // Buscar la inscripción
    const inscripcionIndex = mockData.inscripciones?.findIndex(
      i => i.claseId === classId && i.studentId === studentId
    );
    if (inscripcionIndex === -1) {
      throw new Error('No estás inscrito en esta clase');
    }

    // Eliminar la inscripción
    mockData.inscripciones.splice(inscripcionIndex, 1);

    // Actualizar el número de inscritos
    clase.inscritos -= 1;
    return clase;
  }
};

export const paymentsService = {
  getAll: async () => mockData.payments,
  getById: async (id) => mockData.payments.find(p => p.id === id),
  create: async (paymentData) => {
    const newPayment = { 
      id: mockData.payments.length + 1,
      ...paymentData 
    };
    mockData.payments.push(newPayment);
    return newPayment;
  },
  update: async (id, paymentData) => {
    const idx = mockData.payments.findIndex(p => p.id === id);
    if (idx !== -1) {
      mockData.payments[idx] = { ...mockData.payments[idx], ...paymentData };
      return mockData.payments[idx];
    }
    throw new Error('Payment not found');
  },
  delete: async (id) => {
    const idx = mockData.payments.findIndex(p => p.id === id);
    if (idx !== -1) {
      mockData.payments.splice(idx, 1);
      return true;
    }
    return false;
  },
  getByStudent: async (studentId) => mockData.payments.filter(p => p.alumnoId === studentId)
};

export const attendanceService = {
  getAll: async () => mockData.attendance,
  getByDate: async (date) => mockData.attendance.filter(a => a.fecha === date),
  create: async (data) => {
    const newAttendance = { id: mockData.attendance.length + 1, ...data };
    mockData.attendance.push(newAttendance);
    return newAttendance;
  },
  update: async (id, data) => {
    const idx = mockData.attendance.findIndex(a => a.id === id);
    if (idx !== -1) {
      mockData.attendance[idx] = { ...mockData.attendance[idx], ...data };
      return mockData.attendance[idx];
    }
    throw new Error('Attendance not found');
  },
  delete: async (id) => {
    const idx = mockData.attendance.findIndex(a => a.id === id);
    if (idx !== -1) {
      mockData.attendance.splice(idx, 1);
      return true;
    }
    return false;
  }
};

export const dashboardService = {
  getStats: async () => {
    // Sumar todos los pagos completados o pagados
    const ingresosMensuales = mockData.payments
      .filter(p => p.estado === 'Completado' || p.estado === 'pagado')
      .reduce((acc, p) => acc + (Number(p.monto) || 0), 0);
    // Contar pagos pendientes
    const pagosPendientes = mockData.payments.filter(p => p.estado === 'Pendiente' || p.estado === 'pendiente').length;
    return {
      ...mockData.dashboard,
      ingresosMensuales,
      pagosPendientes
    };
  },
  getAttendanceData: async () => [
    { name: 'Lun', asistencias: 45, esperado: 50 },
    { name: 'Mar', asistencias: 38, esperado: 50 },
    { name: 'Mié', asistencias: 42, esperado: 50 },
    { name: 'Jue', asistencias: 50, esperado: 50 },
    { name: 'Vie', asistencias: 55, esperado: 50 },
    { name: 'Sáb', asistencias: 35, esperado: 40 },
    { name: 'Dom', asistencias: 20, esperado: 30 },
  ],
  getIncomeData: async () => [
    { mes: 'Enero', ingresos: 10000 },
    { mes: 'Febrero', ingresos: 12000 },
    { mes: 'Marzo', ingresos: 9000 },
    { mes: 'Abril', ingresos: 15000 },
    { mes: 'Mayo', ingresos: 11000 },
    { mes: 'Junio', ingresos: 13000 },
  ],
  getPendingPayments: async () => [
    { alumno: 'María García', monto: 5000, fecha: '2024-03-05', estado: 'pendiente' }
  ]
};

export const trainersService = {
  getAll: async () => mockData.trainers,
  getById: async (id) => mockData.trainers.find(t => t.id === id),
  create: async (trainerData) => { mockData.trainers.push(trainerData); return trainerData; },
  update: async (id, trainerData) => { const idx = mockData.trainers.findIndex(t => t.id === id); if (idx !== -1) mockData.trainers[idx] = { ...mockData.trainers[idx], ...trainerData }; return mockData.trainers[idx]; },
  delete: async (id) => { const idx = mockData.trainers.findIndex(t => t.id === id); if (idx !== -1) mockData.trainers.splice(idx, 1); return true; },
  getSchedule: async (trainerId) => []
};

export const settingsService = {
  getSettings: async () => mockData.settings,
  updateSettings: async (settingsData) => { mockData.settings = { ...mockData.settings, ...settingsData }; return mockData.settings; }
};

export const membershipService = {
  getAll: async () => {
    const stored = localStorage.getItem('membresias');
    return stored ? JSON.parse(stored) : [];
  },
  getById: async (id) => {
    const membresias = await membershipService.getAll();
    return membresias.find(m => m.id === id);
  },
  create: async (membershipData) => {
    const membresias = await membershipService.getAll();
    const newMembership = { 
      id: Date.now(),
      ...membershipData
    };
    membresias.push(newMembership);
    localStorage.setItem('membresias', JSON.stringify(membresias));
    return newMembership;
  },
  update: async (id, membershipData) => {
    const membresias = await membershipService.getAll();
    const idx = membresias.findIndex(m => m.id === id);
    if (idx !== -1) {
      membresias[idx] = { ...membresias[idx], ...membershipData };
      localStorage.setItem('membresias', JSON.stringify(membresias));
      return membresias[idx];
    }
    throw new Error('Membership not found');
  },
  delete: async (id) => {
    const membresias = await membershipService.getAll();
    const filteredMembresias = membresias.filter(m => m.id !== id);
    localStorage.setItem('membresias', JSON.stringify(filteredMembresias));
    return true;
  }
}; 