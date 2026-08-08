const justificacionRepository = require('../repositories/justificacionRepository');
const pool = require('../config/db');

const getAll = async () => {
  return await justificacionRepository.findAll();
};

const getById = async (id) => {
  const justificacion = await justificacionRepository.findById(id);
  if (!justificacion) throw new Error('Justificación no encontrada');
  return justificacion;
};

const create = async (data) => {
  const { descripcion, id_inconsistencia } = data;

  if (!descripcion || !id_inconsistencia) {
    throw new Error('Descripción e inconsistencia son requeridas');
  }

  const [inconsistencias] = await pool.query(
    'SELECT * FROM INCONSISTENCIA WHERE id_inconsistencia = ?',
    [id_inconsistencia]
  );

  if (inconsistencias.length === 0) {
    throw new Error('Inconsistencia no encontrada');
  }

  const id = await justificacionRepository.create(data);
  return await justificacionRepository.findById(id);
};

const aprobar = async (id) => {
  await getById(id);
  await justificacionRepository.updateEstado(id, 'aprobada');
  await pool.query(
    `UPDATE INCONSISTENCIA SET estado = 'justificada'
     WHERE id_inconsistencia = (
       SELECT id_inconsistencia FROM JUSTIFICACION WHERE id_justificacion = ?
     )`,
    [id]
  );
  return await justificacionRepository.findById(id);
};

const rechazar = async (id) => {
  await getById(id);
  await justificacionRepository.updateEstado(id, 'rechazada');
  return await justificacionRepository.findById(id);
};

module.exports = { getAll, getById, create, aprobar, rechazar };