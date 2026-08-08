const express = require('express');
const router = express.Router();
const { getAll, getById } = require('../controllers/inconsistenciaController');
const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');

router.get('/', verificarToken, verificarRol('administrador', 'recursos_humanos', 'supervisor'), getAll);
router.get('/:id', verificarToken, getById);

module.exports = router;