const permisoRepository = require('../repositories/permisoRepository');
const empleadoRepository = require('../repositories/empleadoRepository');
const pool = require('../config/db');

const getAll = async () => {
  return await permisoRepository.findAll();
};

const getById = async (id) => {
  const permiso = await permisoRepository.findById(id);
  if (!permiso) throw new Error('Permiso no encontrado');
  return permiso;
};

const getByEmpleado = async (id_empleado) => {
  return await permisoRepository.findByEmpleado(id_empleado);
};

const create = async (data) => {
  const { fecha_inicio, fecha_fin, motivo, id_empleado } = data;

  if (!fecha_inicio || !fecha_fin || !id_empleado) {
    throw new Error('Fecha inicio, fecha fin y empleado son requeridos');
  }

  if (new Date(fecha_inicio) > new Date(fecha_fin)) {
    throw new Error('La fecha de inicio no puede ser mayor a la fecha fin');
  }

  const hoy = new Date().toISOString().split('T')[0];
  if (fecha_inicio < hoy) {
    throw new Error('No podés solicitar un permiso para una fecha pasada');
  }

  const empleado = await empleadoRepository.findById(id_empleado);
  if (!empleado) throw new Error('Empleado no encontrado');

  // Verificar vacaciones aprobadas en ese período
  const [vacaciones] = await pool.query(
    `SELECT * FROM VACACION 
     WHERE id_empleado = ? AND estado = 'aprobada'
     AND (fecha_inicio BETWEEN ? AND ? OR fecha_fin BETWEEN ? AND ? OR ? BETWEEN fecha_inicio AND fecha_fin)`,
    [id_empleado, fecha_inicio, fecha_fin, fecha_inicio, fecha_fin, fecha_inicio]
  );
  if (vacaciones.length > 0) {
    throw new Error('El empleado ya tiene vacaciones aprobadas en ese período');
  }

  // Verificar permisos aprobados en ese período
  const [permisos] = await pool.query(
    `SELECT * FROM PERMISO 
     WHERE id_empleado = ? AND estado = 'aprobado'
     AND (fecha_inicio BETWEEN ? AND ? OR fecha_fin BETWEEN ? AND ? OR ? BETWEEN fecha_inicio AND fecha_fin)`,
    [id_empleado, fecha_inicio, fecha_fin, fecha_inicio, fecha_fin, fecha_inicio]
  );
  if (permisos.length > 0) {
    throw new Error('El empleado ya tiene un permiso aprobado en ese período');
  }

  // Verificar si ya trabajó en esas fechas
  const [asistencias] = await pool.query(
    `SELECT * FROM ASISTENCIA 
     WHERE id_empleado = ? AND fecha BETWEEN ? AND ?`,
    [id_empleado, fecha_inicio, fecha_fin]
  );
  if (asistencias.length > 0) {
    throw new Error('El empleado ya tiene asistencia registrada en alguna de esas fechas');
  }

  const id = await permisoRepository.create(data);
  return await permisoRepository.findById(id);
};;

const aprobar = async (id) => {
  await getById(id);
  await permisoRepository.updateEstado(id, 'aprobado');
  return await permisoRepository.findById(id);
};

const rechazar = async (id) => {
  await getById(id);
  await permisoRepository.updateEstado(id, 'rechazado');
  return await permisoRepository.findById(id);
};

module.exports = { getAll, getById, getByEmpleado, create, aprobar, rechazar };