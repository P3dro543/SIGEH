const jornadaRepository = require('../repositories/jornadaRepository');
const pool = require('../config/db');

const getAll = async () => {
  return await jornadaRepository.findAll();
};

const getById = async (id) => {
  const jornada = await jornadaRepository.findById(id);
  if (!jornada) throw new Error('Jornada no encontrada');
  return jornada;
};

const create = async (data) => {
  if (!data.nombre || !data.hora_inicio || !data.hora_fin || !data.horas_maximas) {
    throw new Error('Todos los campos son requeridos');
  }
  const id = await jornadaRepository.create(data);
  return await jornadaRepository.findById(id);
};

const update = async (id, data) => {
  await getById(id);
  await jornadaRepository.update(id, data);
  return await jornadaRepository.findById(id);
};

const remove = async (id) => {
  await getById(id);

  // Verificar si hay horarios activos con esta jornada
  const { rows: horarios } = await pool.query(
    `SELECT h.*, e.nombre, e.apellido 
     FROM HORARIO h
     JOIN EMPLEADO e ON h.id_empleado = e.id_empleado
     WHERE h.id_jornada = $1 AND h.fecha_fin >= CURRENT_DATE`,
    [id]
  );

  if (horarios.length > 0) {
    const nombres = horarios.map(h => `${h.nombre} ${h.apellido}`).join(', ');
    throw new Error(`No podés eliminar esta jornada porque está asignada a: ${nombres}`);
  }

  await jornadaRepository.remove(id);
};

module.exports = { getAll, getById, create, update, remove };
