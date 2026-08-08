const express = require('express');
const router = express.Router();
const { getAll, getById, create, update, remove } = require('../controllers/jornadaController');
const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');

router.get('/', verificarToken, getAll);
router.get('/:id', verificarToken, getById);
router.post('/', verificarToken, verificarRol('administrador', 'recursos_humanos'), create);
router.put('/:id', verificarToken, verificarRol('administrador', 'recursos_humanos'), update);
router.delete('/:id', verificarToken, verificarRol('administrador'), remove);

module.exports = router;