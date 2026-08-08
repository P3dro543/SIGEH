const express = require('express');
const router = express.Router();
const { getByEmpleado, create, update } = require('../controllers/horarioController');
const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');

router.get('/empleado/:id', verificarToken, getByEmpleado);
router.post('/', verificarToken, verificarRol('administrador', 'recursos_humanos'), create);
router.put('/:id', verificarToken, verificarRol('administrador', 'recursos_humanos'), update);

module.exports = router;