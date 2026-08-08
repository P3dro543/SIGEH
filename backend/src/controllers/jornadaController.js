const jornadaService = require('../services/jornadaService');

const getAll = async (req, res) => {
  try {
    const jornadas = await jornadaService.getAll();
    res.json(jornadas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getById = async (req, res) => {
  try {
    const jornada = await jornadaService.getById(req.params.id);
    res.json(jornada);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

const create = async (req, res) => {
  try {
    const jornada = await jornadaService.create(req.body);
    res.status(201).json(jornada);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const update = async (req, res) => {
  try {
    const jornada = await jornadaService.update(req.params.id, req.body);
    res.json(jornada);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const remove = async (req, res) => {
  try {
    await jornadaService.remove(req.params.id);
    res.json({ mensaje: 'Jornada eliminada correctamente' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = { getAll, getById, create, update, remove };