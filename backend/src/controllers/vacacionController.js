const vacacionService = require('../services/vacacionService');

const getAll = async (req, res) => {
  try {
    const vacaciones = await vacacionService.getAll();
    res.json(vacaciones);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getById = async (req, res) => {
  try {
    const vacacion = await vacacionService.getById(req.params.id);
    res.json(vacacion);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

const getByEmpleado = async (req, res) => {
  try {
    const vacaciones = await vacacionService.getByEmpleado(req.params.id);
    res.json(vacaciones);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const create = async (req, res) => {
  try {
    const vacacion = await vacacionService.create(req.body);
    res.status(201).json(vacacion);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const aprobar = async (req, res) => {
  try {
    const vacacion = await vacacionService.aprobar(req.params.id, req.usuario.id);
    res.json(vacacion);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const rechazar = async (req, res) => {
  try {
    const vacacion = await vacacionService.rechazar(req.params.id, req.usuario.id);
    res.json(vacacion);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = { getAll, getById, getByEmpleado, create, aprobar, rechazar };
