const auditoriaService = require('../services/auditoriaService');

const getAll = async (req, res) => {
  try {
    res.json(await auditoriaService.listar(req.query));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getAll };
