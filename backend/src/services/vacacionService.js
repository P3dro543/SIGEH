const vacacionRepository = require('../repositories/vacacionRepository');
const empleadoRepository = require('../repositories/empleadoRepository');
const pool = require('../config/db');
const auditoriaService = require('./auditoriaService');

const getAll = async () => {
  return await vacacionRepository.findAll();
};

const getById = async (id) => {
  const vacacion = await vacacionRepository.findById(id);
  if (!vacacion) throw new Error('Vacación no encontrada');
  return vacacion;
};

const getByEmpleado = async (id_empleado) => {
  return await vacacionRepository.findByEmpleado(id_empleado);
};

const create = async (data) => {
  const { fecha_inicio, fecha_fin, id_empleado } = data;

  if (!fecha_inicio || !fecha_fin || !id_empleado) {
    throw new Error('Fecha inicio, fecha fin y empleado son requeridos');
  }

  if (new Date(fecha_inicio) > new Date(fecha_fin)) {
    throw new Error('La fecha de inicio no puede ser mayor a la fecha fin');
  }

  const hoy = new Date().toISOString().split('T')[0];
  if (fecha_inicio <= hoy) {
    throw new Error('No podés solicitar vacaciones para hoy o una fecha pasada');
  }

  const empleado = await empleadoRepository.findById(id_empleado);
  if (!empleado) throw new Error('Empleado no encontrado');

  // Verificar permisos aprobados en ese período
  const { rows: permisos } = await pool.query(
    `SELECT * FROM PERMISO 
     WHERE id_empleado = $1 AND estado = 'aprobado'
     AND (fecha_inicio BETWEEN $2 AND $3 OR fecha_fin BETWEEN $4 AND $5 OR $6 BETWEEN fecha_inicio AND fecha_fin)`,
    [id_empleado, fecha_inicio, fecha_fin, fecha_inicio, fecha_fin, fecha_inicio]
  );
  if (permisos.length > 0) {
    throw new Error('El empleado ya tiene un permiso aprobado en ese período');
  }

  // Verificar vacaciones aprobadas en ese período
  const { rows: vacaciones } = await pool.query(
    `SELECT * FROM VACACION 
     WHERE id_empleado = $1 AND estado = 'aprobada'
     AND (fecha_inicio BETWEEN $2 AND $3 OR fecha_fin BETWEEN $4 AND $5 OR $6 BETWEEN fecha_inicio AND fecha_fin)`,
    [id_empleado, fecha_inicio, fecha_fin, fecha_inicio, fecha_fin, fecha_inicio]
  );
  if (vacaciones.length > 0) {
    throw new Error('El empleado ya tiene vacaciones aprobadas en ese período');
  }

  // Verificar si ya trabajó en esas fechas
  const { rows: asistencias } = await pool.query(
    `SELECT * FROM ASISTENCIA 
     WHERE id_empleado = $1 AND fecha BETWEEN $2 AND $3`,
    [id_empleado, fecha_inicio, fecha_fin]
  );
  if (asistencias.length > 0) {
    throw new Error('El empleado ya tiene asistencia registrada en alguna de esas fechas');
  }

  const id = await vacacionRepository.create(data);
  return await vacacionRepository.findById(id);
};

const aprobar = async (id, idUsuario) => {
  const vacacion = await getById(id);
  await vacacionRepository.updateEstado(id, 'aprobada');
  await auditoriaService.registrar({ entidad: 'vacacion', idEntidad: id, accion: 'aprobada', idUsuario, descripcion: `Vacaciones aprobadas para ${vacacion.nombre} ${vacacion.apellido}.`, datos: { estado_anterior: vacacion.estado, estado_nuevo: 'aprobada' } });
  return await vacacionRepository.findById(id);
};

const rechazar = async (id, idUsuario) => {
  const vacacion = await getById(id);
  await vacacionRepository.updateEstado(id, 'rechazada');
  await auditoriaService.registrar({ entidad: 'vacacion', idEntidad: id, accion: 'rechazada', idUsuario, descripcion: `Vacaciones rechazadas para ${vacacion.nombre} ${vacacion.apellido}.`, datos: { estado_anterior: vacacion.estado, estado_nuevo: 'rechazada' } });
  return await vacacionRepository.findById(id);
};

module.exports = { getAll, getById, getByEmpleado, create, aprobar, rechazar };
