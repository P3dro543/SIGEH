const express = require('express');
const router = express.Router();
const { getAll, getById, getByEmpleado, marcarEntrada, marcarSalida } = require('../controllers/asistenciaController');
const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');

router.get('/', verificarToken, verificarRol('administrador', 'recursos_humanos', 'supervisor'), getAll);
router.get('/:id', verificarToken, getById);
router.get('/empleado/:id', verificarToken, getByEmpleado);
router.post('/entrada/:id', verificarToken, marcarEntrada);
router.post('/salida/:id', verificarToken, marcarSalida);

module.exports = router;