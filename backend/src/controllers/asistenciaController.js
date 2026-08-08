const asistenciaService = require('../services/asistenciaService');

const getAll = async (req, res) => {
  try {
    const asistencias = await asistenciaService.getAll();
    res.json(asistencias);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getById = async (req, res) => {
  try {
    const asistencia = await asistenciaService.getById(req.params.id);
    res.json(asistencia);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

const getByEmpleado = async (req, res) => {
  try {
    const asistencias = await asistenciaService.getByEmpleado(req.params.id);
    res.json(asistencias);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const marcarEntrada = async (req, res) => {
  try {
    const asistencia = await asistenciaService.marcarEntrada(req.params.id);
    res.status(201).json(asistencia);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const marcarSalida = async (req, res) => {
  try {
    const asistencia = await asistenciaService.marcarSalida(req.params.id);
    res.json(asistencia);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = { getAll, getById, getByEmpleado, marcarEntrada, marcarSalida };