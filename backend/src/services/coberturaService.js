const coberturaRepository = require('../repositories/coberturaRepository');
const pool = require('../config/db');
const auditoriaService = require('./auditoriaService');

const getAll = async () => {
  return await coberturaRepository.findAll();
};

const getById = async (id) => {
  const cobertura = await coberturaRepository.findById(id);
  if (!cobertura) throw new Error('Cobertura no encontrada');
  return cobertura;
};

const buscarSustitutos = async (id_inconsistencia) => {
  const { rows: inconsistencias } = await pool.query(
    `SELECT i.*, a.id_empleado, a.fecha,
     h.id_jornada, j.horas_maximas, j.hora_inicio, j.hora_fin
     FROM INCONSISTENCIA i
     JOIN ASISTENCIA a ON i.id_asistencia = a.id_asistencia
     JOIN HORARIO h ON h.id_empleado = a.id_empleado AND a.fecha BETWEEN h.fecha_inicio AND h.fecha_fin
     JOIN JORNADA j ON h.id_jornada = j.id_jornada
     WHERE i.id_inconsistencia = $1`,
    [id_inconsistencia]
  );

  if (inconsistencias.length === 0) throw new Error('Inconsistencia no encontrada');

  const inconsistencia = inconsistencias[0];
  const fecha = inconsistencia.fecha;
  const id_empleado_ausente = inconsistencia.id_empleado;
  const horas_maximas = inconsistencia.horas_maximas;

  const { rows: sustitutos } = await pool.query(
    `SELECT e.id_empleado, e.nombre, e.apellido, e.telefono,
     COALESCE(SUM(EXTRACT(EPOCH FROM (a.hora_salida - a.hora_entrada)) / 3600), 0) AS horas_trabajadas
     FROM EMPLEADO e
     LEFT JOIN ASISTENCIA a ON e.id_empleado = a.id_empleado 
       AND DATE_TRUNC('week', a.fecha) = DATE_TRUNC('week', $1::date)
     WHERE e.activo = true
       AND e.id_empleado != $2
       AND e.id_empleado NOT IN (
         SELECT id_empleado FROM PERMISO 
         WHERE estado = 'aprobado' AND $3 BETWEEN fecha_inicio AND fecha_fin
       )
       AND e.id_empleado NOT IN (
         SELECT id_empleado FROM VACACION
         WHERE estado = 'aprobada' AND $4 BETWEEN fecha_inicio AND fecha_fin
       )
       AND e.id_empleado NOT IN (
         SELECT id_empleado FROM ASISTENCIA
         WHERE fecha = $5 AND hora_entrada IS NOT NULL
       )
     GROUP BY e.id_empleado, e.nombre, e.apellido, e.telefono
     HAVING COALESCE(SUM(EXTRACT(EPOCH FROM (a.hora_salida - a.hora_entrada)) / 3600), 0) + $6 <= $7
     ORDER BY horas_trabajadas ASC`,
    [fecha, id_empleado_ausente, fecha, fecha, fecha, horas_maximas, horas_maximas]
  );

  return sustitutos;
};

const asignarCobertura = async (data, idUsuario) => {
  const { id_inconsistencia, id_empleado_sustituto } = data;

  if (!id_inconsistencia || !id_empleado_sustituto) {
    throw new Error('Inconsistencia y sustituto son requeridos');
  }

  const sustitutos = await buscarSustitutos(id_inconsistencia);
  const sustitutoValido = sustitutos.find(
    (s) => Number(s.id_empleado) === Number(id_empleado_sustituto)
  );

  if (!sustitutoValido) {
    throw new Error('El sustituto no cumple con los requisitos legales de jornada');
  }

  const fecha = new Date().toISOString().split('T')[0];
  const id = await coberturaRepository.create({ fecha, id_inconsistencia, id_empleado_sustituto });

  await pool.query(
    `UPDATE INCONSISTENCIA SET estado = 'cubierta' WHERE id_inconsistencia = $1`,
    [id_inconsistencia]
  );

  await auditoriaService.registrar({ entidad: 'cobertura', idEntidad: id, accion: 'asignada', idUsuario, descripcion: `Cobertura asignada a ${sustitutoValido.nombre} ${sustitutoValido.apellido}.`, datos: { id_inconsistencia, id_empleado_sustituto } });

  return await coberturaRepository.findById(id);
};

const confirmar = async (id, idUsuario) => {
  const cobertura = await getById(id);
  await coberturaRepository.updateEstado(id, 'confirmada');
  await auditoriaService.registrar({ entidad: 'cobertura', idEntidad: id, accion: 'confirmada', idUsuario, descripcion: `Cobertura confirmada para ${cobertura.sustituto_nombre} ${cobertura.sustituto_apellido}.`, datos: { estado_anterior: cobertura.estado, estado_nuevo: 'confirmada' } });
  return await coberturaRepository.findById(id);
};

module.exports = { getAll, getById, buscarSustitutos, asignarCobertura, confirmar };
