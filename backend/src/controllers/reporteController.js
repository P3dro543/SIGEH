const reporteService = require('../services/reporteService');

const getResumen = async (req, res) => {
  try {
    const {
      fecha_inicio,
      fecha_fin,
      id_area,
      id_empleado
    } = req.query;

    const resumen = await reporteService.getResumen(
      fecha_inicio,
      fecha_fin,
      id_area,
      id_empleado
    );

    res.json(resumen);

  } catch (err) {
    res.status(400).json({
      error: err.message
    });
  }
};

const descargarExcel = async (req, res) => {
  try {
    const {
      fecha_inicio,
      fecha_fin,
      id_area,
      id_empleado
    } = req.query;

    const workbook = await reporteService.generarExcel(
      fecha_inicio,
      fecha_fin,
      id_area,
      id_empleado
    );

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );

    res.setHeader(
      'Content-Disposition',
      `attachment; filename=reporte_${fecha_inicio}_${fecha_fin}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();

  } catch (err) {
    res.status(400).json({
      error: err.message
    });
  }
};

const descargarPDF = async (req, res) => {
  try {
    const {
      fecha_inicio,
      fecha_fin,
      id_area,
      id_empleado
    } = req.query;

    const doc = await reporteService.generarPDF(
      fecha_inicio,
      fecha_fin,
      id_area,
      id_empleado
    );

    res.setHeader('Content-Type', 'application/pdf');

    res.setHeader(
      'Content-Disposition',
      `attachment; filename=reporte_${fecha_inicio}_${fecha_fin}.pdf`
    );

    doc.pipe(res);
    doc.end();

  } catch (err) {
    res.status(400).json({
      error: err.message
    });
  }
};

module.exports = {
  getResumen,
  descargarExcel,
  descargarPDF
};