const empleadoService = require('../services/empleadoService');

const getAll = async (req, res) => {
  try {
    const empleados = await empleadoService.getAll();
    res.json(empleados);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getById = async (req, res) => {
  try {
    const empleado = await empleadoService.getById(req.params.id);
    res.json(empleado);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

const create = async (req, res) => {
  try {
    const empleado = await empleadoService.create(req.body);
    res.status(201).json(empleado);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const update = async (req, res) => {
  try {
    const empleado = await empleadoService.update(req.params.id, req.body);
    res.json(empleado);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = { getAll, getById, create, update };