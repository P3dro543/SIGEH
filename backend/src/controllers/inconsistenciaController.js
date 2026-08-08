const inconsistenciaService = require('../services/inconsistenciaService');

const getAll = async (req, res) => {
  try {
    const { tipo, estado } = req.query;
    const inconsistencias = await inconsistenciaService.getAll(tipo, estado);
    res.json(inconsistencias);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getById = async (req, res) => {
  try {
    const inconsistencia = await inconsistenciaService.getById(req.params.id);
    res.json(inconsistencia);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

module.exports = { getAll, getById };