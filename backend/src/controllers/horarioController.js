const horarioService = require('../services/horarioService');

const getByEmpleado = async (req, res) => {
  try {
    const horarios = await horarioService.getByEmpleado(req.params.id);
    res.json(horarios);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const create = async (req, res) => {
  try {
    const horario = await horarioService.create(req.body);
    res.status(201).json(horario);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const update = async (req, res) => {
  try {
    const horario = await horarioService.update(req.params.id, req.body);
    res.json(horario);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = { getByEmpleado, create, update };