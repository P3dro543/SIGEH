const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

require('./config/db');

const authRoutes = require('./routes/authRoutes');
const jornadaRoutes = require('./routes/jornadaRoutes');
const empleadoRoutes = require('./routes/empleadoRoutes');
const asistenciaRoutes = require('./routes/asistenciaRoutes');
const justificacionRoutes = require('./routes/justificacionRoutes');
const permisoRoutes = require('./routes/permisoRoutes');
const coberturaRoutes = require('./routes/coberturaRoutes');
const reporteRoutes = require('./routes/reporteRoutes');
const vacacionRoutes = require('./routes/vacacionRoutes');
const inconsistenciaRoutes = require('./routes/inconsistenciaRoutes');
const horarioRoutes = require('./routes/horarioRoutes');

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/jornadas', jornadaRoutes);
app.use('/api/empleados', empleadoRoutes);
app.use('/api/asistencias', asistenciaRoutes);
app.use('/api/justificaciones', justificacionRoutes);
app.use('/api/permisos', permisoRoutes);
app.use('/api/coberturas', coberturaRoutes);
app.use('/api/reportes', reporteRoutes);
app.use('/api/vacaciones', vacacionRoutes);
app.use('/api/inconsistencias', inconsistenciaRoutes);
app.use('/api/horarios', horarioRoutes);

app.get('/', (req, res) => {
  res.json({ mensaje: 'SIGEH API corriendo correctamente' });
});

module.exports = app;