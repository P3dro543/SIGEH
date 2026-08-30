const coberturaService = require('../services/coberturaService');

const getAll = async (req, res) => {
  try {
    const coberturas = await coberturaService.getAll();
    res.json(coberturas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getById = async (req, res) => {
  try {
    const cobertura = await coberturaService.getById(req.params.id);
    res.json(cobertura);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

const buscarSustitutos = async (req, res) => {
  try {
    const sustitutos = await coberturaService.buscarSustitutos(req.params.id);
    res.json(sustitutos);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const asignarCobertura = async (req, res) => {
  try {
    const cobertura = await coberturaService.asignarCobertura(req.body, req.usuario.id);
    res.status(201).json(cobertura);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const confirmar = async (req, res) => {
  try {
    const cobertura = await coberturaService.confirmar(req.params.id, req.usuario.id);
    res.json(cobertura);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = { getAll, getById, buscarSustitutos, asignarCobertura, confirmar };
