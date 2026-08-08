const express = require('express');
const router = express.Router();
const { getAll, getById, getByEmpleado, create, aprobar, rechazar } = require('../controllers/vacacionController');
const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');

router.get('/', verificarToken, verificarRol('administrador', 'recursos_humanos', 'supervisor'), getAll);
router.get('/:id', verificarToken, getById);
router.get('/empleado/:id', verificarToken, getByEmpleado);
router.post('/', verificarToken, create);
router.put('/:id/aprobar', verificarToken, verificarRol('administrador', 'recursos_humanos'), aprobar);
router.put('/:id/rechazar', verificarToken, verificarRol('administrador', 'recursos_humanos'), rechazar);

module.exports = router;