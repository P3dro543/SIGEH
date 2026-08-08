const inconsistenciaRepository = require('../repositories/inconsistenciaRepository');

const getAll = async (tipo, estado) => {
  if (tipo) return await inconsistenciaRepository.findByTipo(tipo);
  if (estado) return await inconsistenciaRepository.findByEstado(estado);
  return await inconsistenciaRepository.findAll();
};

const getById = async (id) => {
  const inconsistencia = await inconsistenciaRepository.findById(id);
  if (!inconsistencia) throw new Error('Inconsistencia no encontrada');
  return inconsistencia;
};

module.exports = { getAll, getById };