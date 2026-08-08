const express = require('express');
const router = express.Router();
const { getResumen, descargarExcel, descargarPDF } = require('../controllers/reporteController');
const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');

router.get('/resumen', verificarToken, verificarRol('administrador', 'recursos_humanos'), getResumen);
router.get('/excel', verificarToken, verificarRol('administrador', 'recursos_humanos'), descargarExcel);
router.get('/pdf', verificarToken, verificarRol('administrador', 'recursos_humanos'), descargarPDF);

module.exports = router;