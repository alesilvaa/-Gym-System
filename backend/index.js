import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Datos de ejemplo (en un sistema real, esto vendría de una base de datos)
const stats = {
  alumnosActivos: 248,
  ingresosMensuales: 5200000,
  clasesHoy: 8,
  pagosPendientes: 3
};

const asistenciaData = [
  { name: 'Lun', asistencias: 45, meta: 50 },
  { name: 'Mar', asistencias: 38, meta: 50 },
  { name: 'Mié', asistencias: 42, meta: 50 },
  { name: 'Jue', asistencias: 50, meta: 50 },
  { name: 'Vie', asistencias: 55, meta: 50 },
  { name: 'Sáb', asistencias: 35, meta: 40 },
  { name: 'Dom', asistencias: 20, meta: 30 }
];

const ingresosData = [
  { name: 'Ene', ingresos: 4.2 },
  { name: 'Feb', ingresos: 4.5 },
  { name: 'Mar', ingresos: 4.8 },
  { name: 'Abr', ingresos: 5.2 },
  { name: 'May', ingresos: 5.0 },
  { name: 'Jun', ingresos: 5.2 }
];

const pagosPendientes = [
  { id: 1, alumno: 'Carlos Ramírez', monto: 250000, vencimiento: '28/04/2025', diasVencido: 2 },
  { id: 2, alumno: 'Ana Silva', monto: 180000, vencimiento: '27/04/2025', diasVencido: 3 },
  { id: 3, alumno: 'Juan Martínez', monto: 300000, vencimiento: '26/04/2025', diasVencido: 4 }
];

// Endpoints
app.get('/api/dashboard/stats', (req, res) => {
  res.json(stats);
});

app.get('/api/dashboard/attendance', (req, res) => {
  res.json(asistenciaData);
});

app.get('/api/dashboard/income', (req, res) => {
  res.json(ingresosData);
});

app.get('/api/dashboard/pending-payments', (req, res) => {
  res.json(pagosPendientes);
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
}); 