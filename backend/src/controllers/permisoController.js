const permisoService = require('../services/permisoService');

const getAll = async (req, res) => {
  try {
    const permisos = await permisoService.getAll();
    res.json(permisos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getById = async (req, res) => {
  try {
    const permiso = await permisoService.getById(req.params.id);
    res.json(permiso);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

const getByEmpleado = async (req, res) => {
  try {
    const permisos = await permisoService.getByEmpleado(req.params.id);
    res.json(permisos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const create = async (req, res) => {
  try {
    const permiso = await permisoService.create(req.body);
    res.status(201).json(permiso);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const aprobar = async (req, res) => {
  try {
    const permiso = await permisoService.aprobar(req.params.id);
    res.json(permiso);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const rechazar = async (req, res) => {
  try {
    const permiso = await permisoService.rechazar(req.params.id);
    res.json(permiso);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = { getAll, getById, getByEmpleado, create, aprobar, rechazar };