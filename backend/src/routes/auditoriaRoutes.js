const express = require('express');
const router = express.Router();
const { getAll } = require('../controllers/auditoriaController');
const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');

router.get('/', verificarToken, verificarRol('administrador', 'recursos_humanos'), getAll);

module.exports = router;
