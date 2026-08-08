const express = require('express');
const router = express.Router();
const { getAll, getById, create, update } = require('../controllers/empleadoController');
const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');

router.get('/', verificarToken, getAll);
router.get('/:id', verificarToken, getById);
router.post('/', verificarToken, verificarRol('administrador', 'recursos_humanos'), create);
router.put('/:id', verificarToken, verificarRol('administrador', 'recursos_humanos'), update);

module.exports = router;