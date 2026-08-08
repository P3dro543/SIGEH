const justificacionService = require('../services/justificacionService');

const getAll = async (req, res) => {
  try {
    const justificaciones = await justificacionService.getAll();
    res.json(justificaciones);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getById = async (req, res) => {
  try {
    const justificacion = await justificacionService.getById(req.params.id);
    res.json(justificacion);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

const create = async (req, res) => {
  try {
    const justificacion = await justificacionService.create(req.body);
    res.status(201).json(justificacion);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const aprobar = async (req, res) => {
  try {
    const justificacion = await justificacionService.aprobar(req.params.id);
    res.json(justificacion);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const rechazar = async (req, res) => {
  try {
    const justificacion = await justificacionService.rechazar(req.params.id);
    res.json(justificacion);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = { getAll, getById, create, aprobar, rechazar };