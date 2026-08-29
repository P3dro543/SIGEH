const reporteRepository = require('../repositories/reporteRepository');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

const BRAND = {
  indigo: '4F46E5',
  indigoDark: '312E81',
  indigoLight: 'EEF2FF',
  slate: '475569',
  slateLight: 'F8FAFC',
  border: 'E2E8F0',
  green: '15803D',
  amber: 'B45309',
  red: 'B91C1C'
};

const formatDate = (value) => {
  if (!value) return 'Sin registro';
  const [year, month, day] = String(value).slice(0, 10).split('-');
  return year && month && day ? `${day}/${month}/${year}` : String(value);
};

const formatDateTime = (value) => {
  if (!value) return 'Sin registro';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleString('es-CR', { dateStyle: 'short', timeStyle: 'short' });
};

const formatTime = (value) => value ? String(value).slice(0, 5) : '-';

const toNumber = (value) => Number(value || 0);

const excelTitle = (sheet, title, period, endColumn) => {
  sheet.mergeCells(`A1:${endColumn}1`);
  sheet.getCell('A1').value = title;
  sheet.getCell('A1').font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
  sheet.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${BRAND.indigoDark}` } };
  sheet.getCell('A1').alignment = { vertical: 'middle' };
  sheet.getRow(1).height = 30;

  sheet.mergeCells(`A2:${endColumn}2`);
  sheet.getCell('A2').value = `Período: ${formatDate(period.start)} al ${formatDate(period.end)}`;
  sheet.getCell('A2').font = { name: 'Arial', size: 10, color: { argb: `FF${BRAND.slate}` } };
  sheet.getCell('A2').alignment = { vertical: 'middle' };
  sheet.getRow(2).height = 22;
  sheet.views = [{ state: 'frozen', ySplit: 6 }];
  sheet.properties.defaultRowHeight = 19;
  sheet.pageSetup = { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0, margins: { left: 0.3, right: 0.3, top: 0.5, bottom: 0.5, header: 0.2, footer: 0.2 } };
};

const excelTable = (sheet, headers, rows, options = {}) => {
  const headerRow = options.headerRow || 6;
  const keys = headers.map(header => header.key);
  const header = sheet.getRow(headerRow);
  header.values = headers.map(header => header.label);
  header.height = 24;
  header.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
  header.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${BRAND.indigo}` } };
  header.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

  rows.forEach((row, index) => {
    const excelRow = sheet.getRow(headerRow + 1 + index);
    excelRow.values = keys.map(key => row[key] ?? '');
    excelRow.font = { name: 'Arial', size: 10, color: { argb: 'FF1E293B' } };
    excelRow.alignment = { vertical: 'middle', wrapText: Boolean(options.wrap) };
    if (index % 2 === 1) {
      excelRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
    }
  });

  const lastRow = Math.max(headerRow, headerRow + rows.length);
  const lastColumn = String.fromCharCode(64 + headers.length);
  sheet.autoFilter = `A${headerRow}:${lastColumn}${lastRow}`;
  for (let col = 1; col <= headers.length; col++) {
    const column = sheet.getColumn(col);
    column.width = headers[col - 1].width;
    column.alignment = { vertical: 'middle', horizontal: headers[col - 1].align || 'left', wrapText: Boolean(options.wrap) };
  }

  sheet.getCell(`A${lastRow}`).border = { bottom: { style: 'thin', color: { argb: `FF${BRAND.border}` } } };
};

const addKpiCard = (sheet, startColumn, label, value, color) => {
  const letter = String.fromCharCode(64 + startColumn);
  const endLetter = String.fromCharCode(65 + startColumn);
  sheet.mergeCells(`${letter}4:${endLetter}4`);
  sheet.mergeCells(`${letter}5:${endLetter}5`);
  const labelCell = sheet.getCell(`${letter}4`);
  labelCell.value = label;
  labelCell.font = { name: 'Arial', size: 9, bold: true, color: { argb: `FF${BRAND.slate}` } };
  labelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${BRAND.slateLight}` } };
  const valueCell = sheet.getCell(`${letter}5`);
  valueCell.value = value;
  valueCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: `FF${color}` } };
  valueCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${BRAND.slateLight}` } };
  [labelCell, valueCell].forEach(cell => {
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = { top: { style: 'thin', color: { argb: `FF${BRAND.border}` }, }, bottom: { style: 'thin', color: { argb: `FF${BRAND.border}` } } };
  });
};

const pdfText = (value, maxLength = 42) => {
  const text = String(value || '-').replace(/\s+/g, ' ').trim();
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text;
};

const pdfHeader = (doc, period, continuation = false) => {
  const { width, margins } = doc.page;
  const left = margins.left;
  const right = width - margins.right;
  doc.save();
  doc.rect(0, 0, width, 70).fill(`#${BRAND.indigoDark}`);
  doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(17).text('SIGEH', left, 19);
  doc.font('Helvetica').fontSize(8).fillColor('#C7D2FE').text('VIGSAFE SEGURIDAD', left, 40);
  doc.font('Helvetica-Bold').fontSize(11).fillColor('#FFFFFF').text(continuation ? 'Reporte de asistencia (continuación)' : 'Reporte de asistencia', left, 23, { align: 'right', width: right - left });
  doc.font('Helvetica').fontSize(8).fillColor('#C7D2FE').text(`Período: ${formatDate(period.start)} al ${formatDate(period.end)}`, left, 41, { align: 'right', width: right - left });
  doc.restore();
  doc.y = 92;
};

const pdfSectionTitle = (doc, title) => {
  doc.fillColor(`#${BRAND.indigoDark}`).font('Helvetica-Bold').fontSize(12).text(title);
  doc.moveTo(doc.page.margins.left, doc.y + 5).lineTo(doc.page.width - doc.page.margins.right, doc.y + 5).strokeColor(`#${BRAND.border}`).lineWidth(0.6).stroke();
  doc.moveDown(0.8);
};

const ensurePdfSpace = (doc, required, period) => {
  const bottom = doc.page.height - doc.page.margins.bottom - 22;
  if (doc.y + required > bottom) {
    doc.addPage();
    pdfHeader(doc, period, true);
    return true;
  }
  return false;
};

const pdfTable = (doc, period, columns, rows) => {
  const left = doc.page.margins.left;
  const width = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const drawHead = () => {
    const y = doc.y;
    doc.rect(left, y, width, 20).fill(`#${BRAND.indigo}`);
    let x = left;
    columns.forEach(column => {
      doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(7.5).text(column.label, x + 4, y + 6, { width: column.width - 8, align: column.align || 'left' });
      x += column.width;
    });
    doc.y = y + 24;
  };

  drawHead();
  rows.forEach((row, index) => {
    const height = row.height || 22;
    if (ensurePdfSpace(doc, height + 24, period)) drawHead();
    const y = doc.y;
    if (index % 2 === 1) doc.rect(left, y - 2, width, height).fill(`#${BRAND.slateLight}`);
    let x = left;
    columns.forEach(column => {
      doc.fillColor('#1E293B').font('Helvetica').fontSize(column.size || 8).text(pdfText(row[column.key], column.limit), x + 4, y + 4, { width: column.width - 8, align: column.align || 'left', lineBreak: false });
      x += column.width;
    });
    doc.moveTo(left, y + height - 2).lineTo(left + width, y + height - 2).strokeColor(`#${BRAND.border}`).lineWidth(0.35).stroke();
    doc.y = y + height;
  });
  doc.moveDown(0.8);
};

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
  workbook.created = new Date();
  workbook.modified = new Date();
  workbook.properties.title = 'Reporte de asistencia SIGEH';
  const period = { start: fecha_inicio, end: fecha_fin };
  const totalDias = resumen.reduce((total, row) => total + toNumber(row.dias_trabajados), 0);

  const hojaResumen = workbook.addWorksheet('Resumen', { views: [{ showGridLines: false }] });
  excelTitle(hojaResumen, 'SIGEH | Resumen de asistencia', period, 'H');
  addKpiCard(hojaResumen, 1, 'EMPLEADOS', resumen.length, BRAND.indigo);
  addKpiCard(hojaResumen, 3, 'DÍAS REGISTRADOS', totalDias, BRAND.green);
  addKpiCard(hojaResumen, 5, 'INCIDENCIAS', inconsistencias.length, BRAND.amber);
  addKpiCard(hojaResumen, 7, 'AUSENCIAS', resumen.reduce((total, row) => total + toNumber(row.ausencias), 0), BRAND.red);
  excelTable(hojaResumen, [
    { label: 'Cédula', key: 'cedula', width: 16 }, { label: 'Colaborador', key: 'colaborador', width: 28 }, { label: 'Área', key: 'area', width: 20 },
    { label: 'Días trabajados', key: 'dias_trabajados', width: 17, align: 'right' }, { label: 'Tardanzas', key: 'tardanzas', width: 13, align: 'right' },
    { label: 'Ausencias', key: 'ausencias', width: 13, align: 'right' }, { label: 'Salidas anticipadas', key: 'salidas_anticipadas', width: 20, align: 'right' }, { label: 'Observaciones', key: 'observaciones', width: 22 }
  ], resumen.map(row => ({ ...row, colaborador: `${row.nombre} ${row.apellido}`, dias_trabajados: toNumber(row.dias_trabajados), tardanzas: toNumber(row.tardanzas), ausencias: toNumber(row.ausencias), salidas_anticipadas: toNumber(row.salidas_anticipadas), observaciones: toNumber(row.ausencias) > 0 ? 'Revisar ausencias' : toNumber(row.tardanzas) > 0 ? 'Revisar tardanzas' : 'Sin incidencias' })));

  const hojaAsistencias = workbook.addWorksheet('Marcaciones', { views: [{ showGridLines: false }] });
  excelTitle(hojaAsistencias, 'SIGEH | Detalle de marcaciones', period, 'G');
  excelTable(hojaAsistencias, [
    { label: 'Fecha', key: 'fecha', width: 14 }, { label: 'Colaborador', key: 'colaborador', width: 28 }, { label: 'Cédula', key: 'cedula', width: 16 }, { label: 'Área', key: 'area', width: 20 },
    { label: 'Entrada', key: 'hora_entrada', width: 14, align: 'center' }, { label: 'Salida', key: 'hora_salida', width: 14, align: 'center' }, { label: 'Jornada', key: 'jornada', width: 20 }
  ], asistencias.map(row => ({ ...row, fecha: formatDate(row.fecha), colaborador: `${row.nombre} ${row.apellido}`, hora_entrada: formatTime(row.hora_entrada), hora_salida: formatTime(row.hora_salida) })));

  const hojaInconsistencias = workbook.addWorksheet('Inconsistencias', { views: [{ showGridLines: false }] });
  excelTitle(hojaInconsistencias, 'SIGEH | Incidencias de asistencia', period, 'G');
  excelTable(hojaInconsistencias, [
    { label: 'Fecha y hora', key: 'fecha_hora', width: 20 }, { label: 'Colaborador', key: 'colaborador', width: 26 }, { label: 'Área', key: 'area', width: 19 },
    { label: 'Tipo', key: 'tipo', width: 18 }, { label: 'Descripción', key: 'descripcion', width: 42 }, { label: 'Estado', key: 'estado', width: 16 }, { label: 'Cédula', key: 'cedula', width: 16 }
  ], inconsistencias.map(row => ({ ...row, fecha_hora: formatDateTime(row.fecha_hora), colaborador: `${row.nombre} ${row.apellido}` })), { wrap: true });
  hojaInconsistencias.eachRow((row, number) => { if (number > 6) row.height = 28; });

  return workbook;
};

const generarPDF = async (fecha_inicio, fecha_fin, id_area, id_empleado) => {
  if (!fecha_inicio || !fecha_fin) {
    throw new Error('Fechas requeridas');
  }

  const [resumen, inconsistencias, asistencias] = await Promise.all([
    reporteRepository.getResumenPorEmpleado(fecha_inicio, fecha_fin, id_area, id_empleado),
    reporteRepository.getInconsistenciasPorPeriodo(fecha_inicio, fecha_fin, null, id_area, id_empleado),
    reporteRepository.getAsistenciasPorPeriodo(fecha_inicio, fecha_fin, id_area, id_empleado)
  ]);

  const period = { start: fecha_inicio, end: fecha_fin };
  const doc = new PDFDocument({ size: 'A4', margin: 42, bufferPages: true, info: { Title: 'Reporte de asistencia SIGEH', Author: 'SIGEH - VigSafe Seguridad' } });
  pdfHeader(doc, period);
  const kpis = [
    { label: 'Colaboradores', value: resumen.length, color: BRAND.indigo },
    { label: 'Días registrados', value: resumen.reduce((sum, row) => sum + toNumber(row.dias_trabajados), 0), color: BRAND.green },
    { label: 'Incidencias', value: inconsistencias.length, color: BRAND.amber },
    { label: 'Ausencias', value: resumen.reduce((sum, row) => sum + toNumber(row.ausencias), 0), color: BRAND.red }
  ];
  const cardWidth = 124;
  kpis.forEach((kpi, index) => {
    const x = doc.page.margins.left + index * (cardWidth + 4);
    const y = doc.y;
    doc.roundedRect(x, y, cardWidth, 47, 5).fill(`#${BRAND.slateLight}`).strokeColor(`#${BRAND.border}`).lineWidth(0.6).stroke();
    doc.fillColor(`#${BRAND.slate}`).font('Helvetica-Bold').fontSize(7.5).text(kpi.label.toUpperCase(), x + 9, y + 9, { width: cardWidth - 18, align: 'center' });
    doc.fillColor(`#${kpi.color}`).font('Helvetica-Bold').fontSize(17).text(String(kpi.value), x + 9, y + 23, { width: cardWidth - 18, align: 'center' });
  });
  doc.y += 65;

  pdfSectionTitle(doc, 'Resumen por colaborador');
  pdfTable(doc, period, [
    { label: 'COLABORADOR', key: 'colaborador', width: 172, limit: 30 }, { label: 'ÁREA', key: 'area', width: 88, limit: 15 }, { label: 'DÍAS', key: 'dias_trabajados', width: 45, align: 'right' },
    { label: 'TARD.', key: 'tardanzas', width: 45, align: 'right' }, { label: 'AUS.', key: 'ausencias', width: 45, align: 'right' }, { label: 'SAL. ANT.', key: 'salidas_anticipadas', width: 62, align: 'right' }, { label: 'CÉDULA', key: 'cedula', width: 54, align: 'right', limit: 12 }
  ], resumen.map(row => ({ ...row, colaborador: `${row.nombre} ${row.apellido}`, dias_trabajados: toNumber(row.dias_trabajados), tardanzas: toNumber(row.tardanzas), ausencias: toNumber(row.ausencias), salidas_anticipadas: toNumber(row.salidas_anticipadas) })));

  pdfSectionTitle(doc, 'Detalle de marcaciones');
  pdfTable(doc, period, [
    { label: 'FECHA', key: 'fecha', width: 69, limit: 12 }, { label: 'COLABORADOR', key: 'colaborador', width: 146, limit: 27 }, { label: 'ÁREA', key: 'area', width: 82, limit: 14 },
    { label: 'ENTRADA', key: 'hora_entrada', width: 60, align: 'center' }, { label: 'SALIDA', key: 'hora_salida', width: 60, align: 'center' }, { label: 'JORNADA', key: 'jornada', width: 94, limit: 16 }
  ], asistencias.map(row => ({ ...row, fecha: formatDate(row.fecha), colaborador: `${row.nombre} ${row.apellido}`, hora_entrada: formatTime(row.hora_entrada), hora_salida: formatTime(row.hora_salida) })));

  pdfSectionTitle(doc, 'Inconsistencias registradas');
  if (inconsistencias.length === 0) {
    doc.fillColor(`#${BRAND.slate}`).font('Helvetica').fontSize(9).text('No se registraron inconsistencias durante el período seleccionado.');
  } else {
    pdfTable(doc, period, [
      { label: 'FECHA', key: 'fecha_hora', width: 78, limit: 15 }, { label: 'COLABORADOR', key: 'colaborador', width: 128, limit: 22 }, { label: 'TIPO', key: 'tipo', width: 75, limit: 14 },
      { label: 'DESCRIPCIÓN', key: 'descripcion', width: 160, limit: 31 }, { label: 'ESTADO', key: 'estado', width: 70, limit: 14 }
    ], inconsistencias.map(row => ({ ...row, fecha_hora: formatDateTime(row.fecha_hora), colaborador: `${row.nombre} ${row.apellido}` })));
  }

  const range = doc.bufferedPageRange();
  for (let page = range.start; page < range.start + range.count; page++) {
    doc.switchToPage(page);
    doc.fillColor(`#${BRAND.slate}`).font('Helvetica').fontSize(7.5)
      .text('Generado por SIGEH · VigSafe Seguridad', doc.page.margins.left, doc.page.height - 28)
      .text(`Página ${page + 1} de ${range.count}`, doc.page.margins.left, doc.page.height - 28, { align: 'right', width: doc.page.width - doc.page.margins.left - doc.page.margins.right });
  }

  return doc;
};

module.exports = {
  getResumen,
  generarExcel,
  generarPDF
};
