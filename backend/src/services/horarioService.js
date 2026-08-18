const horarioRepository = require('../repositories/horarioRepository');
const empleadoRepository = require('../repositories/empleadoRepository');
const pool = require('../config/db');

const getByEmpleado = async (id_empleado) => {
  return await horarioRepository.findByEmpleado(id_empleado);
};

const create = async (data) => {
  const { id_empleado, id_jornada, fecha_inicio, fecha_fin } = data;

  if (!id_empleado || !id_jornada || !fecha_inicio || !fecha_fin) {
    throw new Error('Todos los campos son requeridos');
  }

  if (new Date(fecha_inicio) > new Date(fecha_fin)) {
    throw new Error('La fecha inicio no puede ser mayor a la fecha fin');
  }

  const empleado = await empleadoRepository.findById(id_empleado);
  if (!empleado) throw new Error('Empleado no encontrado');

  const { rows: jornadas } = await pool.query(
    'SELECT * FROM JORNADA WHERE id_jornada = $1', [id_jornada]
  );
  if (jornadas.length === 0) throw new Error('Jornada no encontrada');

  const { rows: conflictos } = await pool.query(
    `SELECT * FROM HORARIO 
     WHERE id_empleado = $1
     AND (
       (fecha_inicio BETWEEN $2 AND $3) OR
       (fecha_fin BETWEEN $4 AND $5) OR
       ($6 BETWEEN fecha_inicio AND fecha_fin)
     )`,
    [id_empleado, fecha_inicio, fecha_fin, fecha_inicio, fecha_fin, fecha_inicio]
  );

  if (conflictos.length > 0) {
    throw new Error('El empleado ya tiene una jornada asignada en ese período');
  }

  const id = await horarioRepository.create(data);
  return { id_horario: id, ...data, jornada: jornadas[0].nombre };
};

const update = async (id, data) => {
  const { id_jornada, fecha_inicio, fecha_fin } = data;

  if (new Date(fecha_inicio) > new Date(fecha_fin)) {
    throw new Error('La fecha inicio no puede ser mayor a la fecha fin');
  }

  await horarioRepository.update(id, data);
  return { id_horario: id, ...data };
};

module.exports = { getByEmpleado, create, update };
