const reporteRepository = require('../repositories/reporteRepository');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

const getResumen = async (fecha_inicio, fecha_fin, id_area, id_empleado) => {
  if (!fecha_inicio || !fecha_fin) {
    throw new Error('Fechas requeridas');
  }

  return await reporteRepository.getResumenPorEmpleado(
    fecha_inicio,
    fecha_fin,
    id_area,
    id_empleado
  );
};

const generarExcel = async (fecha_inicio, fecha_fin, id_area, id_empleado) => {
  if (!fecha_inicio || !fecha_fin) {
    throw new Error('Fechas requeridas');
  }

  const asistencias = await reporteRepository.getAsistenciasPorPeriodo(
    fecha_inicio,
    fecha_fin,
    id_area,
    id_empleado
  );

  const inconsistencias = await reporteRepository.getInconsistenciasPorPeriodo(
    fecha_inicio,
    fecha_fin,
    null,
    id_area,
    id_empleado
  );

  const resumen = await reporteRepository.getResumenPorEmpleado(
    fecha_inicio,
    fecha_fin,
    id_area,
    id_empleado
  );

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'SIGEH';

  // Hoja Resumen
  const hojaResumen = workbook.addWorksheet('Resumen');
  hojaResumen.columns = [
    { header: 'Cédula', key: 'cedula', width: 15 },
    { header: 'Nombre', key: 'nombre', width: 20 },
    { header: 'Apellido', key: 'apellido', width: 20 },
    { header: 'Área', key: 'area', width: 20 },
    { header: 'Días Trabajados', key: 'dias_trabajados', width: 15 },
    { header: 'Tardanzas', key: 'tardanzas', width: 12 },
    { header: 'Ausencias', key: 'ausencias', width: 12 },
    { header: 'Salidas Anticipadas', key: 'salidas_anticipadas', width: 20 }
  ];

  hojaResumen.getRow(1).font = { bold: true };
  resumen.forEach(r => hojaResumen.addRow(r));

  // Hoja Asistencias
  const hojaAsistencias = workbook.addWorksheet('Asistencias');
  hojaAsistencias.columns = [
    { header: 'Fecha', key: 'fecha', width: 15 },
    { header: 'Cédula', key: 'cedula', width: 15 },
    { header: 'Nombre', key: 'nombre', width: 20 },
    { header: 'Apellido', key: 'apellido', width: 20 },
    { header: 'Área', key: 'area', width: 20 },
    { header: 'Entrada', key: 'hora_entrada', width: 20 },
    { header: 'Salida', key: 'hora_salida', width: 20 },
    { header: 'Jornada', key: 'jornada', width: 15 }
  ];

  hojaAsistencias.getRow(1).font = { bold: true };
  asistencias.forEach(a => hojaAsistencias.addRow(a));

  // Hoja Inconsistencias
  const hojaInconsistencias = workbook.addWorksheet('Inconsistencias');
  hojaInconsistencias.columns = [
    { header: 'Fecha', key: 'fecha_hora', width: 20 },
    { header: 'Cédula', key: 'cedula', width: 15 },
    { header: 'Nombre', key: 'nombre', width: 20 },
    { header: 'Apellido', key: 'apellido', width: 20 },
    { header: 'Área', key: 'area', width: 20 },
    { header: 'Tipo', key: 'tipo', width: 15 },
    { header: 'Descripción', key: 'descripcion', width: 40 },
    { header: 'Estado', key: 'estado', width: 15 }
  ];

  hojaInconsistencias.getRow(1).font = { bold: true };
  inconsistencias.forEach(i => hojaInconsistencias.addRow(i));

  return workbook;
};

const generarPDF = async (fecha_inicio, fecha_fin, id_area, id_empleado) => {
  if (!fecha_inicio || !fecha_fin) {
    throw new Error('Fechas requeridas');
  }

  const resumen = await reporteRepository.getResumenPorEmpleado(
    fecha_inicio,
    fecha_fin,
    id_area,
    id_empleado
  );

  const inconsistencias = await reporteRepository.getInconsistenciasPorPeriodo(
    fecha_inicio,
    fecha_fin,
    null,
    id_area,
    id_empleado
  );

  const doc = new PDFDocument({ margin: 40 });

  doc.fontSize(18)
    .font('Helvetica-Bold')
    .text('SIGEH - Reporte de Asistencia', { align: 'center' });

  doc.fontSize(11)
    .font('Helvetica')
    .text(`Período: ${fecha_inicio} al ${fecha_fin}`, { align: 'center' });

  doc.moveDown();

  doc.fontSize(13)
    .font('Helvetica-Bold')
    .text('Resumen por Empleado');

  doc.moveDown(0.5);

  resumen.forEach(r => {
    doc.fontSize(10)
      .font('Helvetica-Bold')
      .text(`${r.nombre} ${r.apellido} - ${r.cedula}`);

    doc.fontSize(10)
      .font('Helvetica')
      .text(
        `Área: ${r.area} | Días trabajados: ${r.dias_trabajados} | Tardanzas: ${r.tardanzas} | Ausencias: ${r.ausencias} | Salidas anticipadas: ${r.salidas_anticipadas}`
      );

    doc.moveDown(0.5);
  });

  doc.moveDown();

  doc.fontSize(13)
    .font('Helvetica-Bold')
    .text('Inconsistencias');

  doc.moveDown(0.5);

  inconsistencias.forEach(i => {
    doc.fontSize(10)
      .font('Helvetica-Bold')
      .text(`${i.nombre} ${i.apellido} - ${i.tipo.toUpperCase()}`);

    doc.fontSize(10)
      .font('Helvetica')
      .text(`${i.descripcion} | Estado: ${i.estado}`);

    doc.moveDown(0.5);
  });

  return doc;
};

module.exports = {
  getResumen,
  generarExcel,
  generarPDF
};