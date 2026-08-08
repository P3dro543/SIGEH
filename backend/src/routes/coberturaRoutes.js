const express = require('express');
const router = express.Router();
const { getAll, getById, buscarSustitutos, asignarCobertura, confirmar } = require('../controllers/coberturaController');
const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');

router.get('/', verificarToken, verificarRol('administrador', 'recursos_humanos', 'supervisor'), getAll);
router.get('/:id', verificarToken, getById);
router.get('/sustitutos/:id', verificarToken, verificarRol('administrador', 'recursos_humanos', 'supervisor'), buscarSustitutos);
router.post('/', verificarToken, verificarRol('administrador', 'recursos_humanos', 'supervisor'), asignarCobertura);
router.put('/:id/confirmar', verificarToken, verificarRol('administrador', 'recursos_humanos', 'supervisor'), confirmar);

module.exports = router;