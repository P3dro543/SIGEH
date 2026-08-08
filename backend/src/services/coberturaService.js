const coberturaRepository = require('../repositories/coberturaRepository');
const pool = require('../config/db');

const getAll = async () => {
  return await coberturaRepository.findAll();
};

const getById = async (id) => {
  const cobertura = await coberturaRepository.findById(id);
  if (!cobertura) throw new Error('Cobertura no encontrada');
  return cobertura;
};

const buscarSustitutos = async (id_inconsistencia) => {
  const [inconsistencias] = await pool.query(
    `SELECT i.*, a.id_empleado, a.fecha,
     h.id_jornada, j.horas_maximas, j.hora_inicio, j.hora_fin
     FROM INCONSISTENCIA i
     JOIN ASISTENCIA a ON i.id_asistencia = a.id_asistencia
     JOIN HORARIO h ON h.id_empleado = a.id_empleado AND a.fecha BETWEEN h.fecha_inicio AND h.fecha_fin
     JOIN JORNADA j ON h.id_jornada = j.id_jornada
     WHERE i.id_inconsistencia = ?`,
    [id_inconsistencia]
  );

  if (inconsistencias.length === 0) throw new Error('Inconsistencia no encontrada');

  const inconsistencia = inconsistencias[0];
  const fecha = inconsistencia.fecha;
  const id_empleado_ausente = inconsistencia.id_empleado;
  const horas_maximas = inconsistencia.horas_maximas;

  const [sustitutos] = await pool.query(
    `SELECT e.id_empleado, e.nombre, e.apellido, e.telefono,
     COALESCE(SUM(TIMESTAMPDIFF(HOUR, a.hora_entrada, a.hora_salida)), 0) as horas_trabajadas
     FROM EMPLEADO e
     LEFT JOIN ASISTENCIA a ON e.id_empleado = a.id_empleado 
       AND YEARWEEK(a.fecha) = YEARWEEK(?)
     WHERE e.activo = 1
       AND e.id_empleado != ?
       AND e.id_empleado NOT IN (
         SELECT id_empleado FROM PERMISO 
         WHERE estado = 'aprobado' AND ? BETWEEN fecha_inicio AND fecha_fin
       )
       AND e.id_empleado NOT IN (
         SELECT id_empleado FROM VACACION
         WHERE estado = 'aprobada' AND ? BETWEEN fecha_inicio AND fecha_fin
       )
       AND e.id_empleado NOT IN (
         SELECT id_empleado FROM ASISTENCIA
         WHERE fecha = ? AND hora_entrada IS NOT NULL
       )
     GROUP BY e.id_empleado
     HAVING horas_trabajadas + ? <= ?
     ORDER BY horas_trabajadas ASC`,
    [fecha, id_empleado_ausente, fecha, fecha, fecha, horas_maximas, horas_maximas]
  );

  return sustitutos;
};

const asignarCobertura = async (data) => {
  const { id_inconsistencia, id_empleado_sustituto } = data;

  if (!id_inconsistencia || !id_empleado_sustituto) {
    throw new Error('Inconsistencia y sustituto son requeridos');
  }

  const sustitutos = await buscarSustitutos(id_inconsistencia);
  const sustitutoValido = sustitutos.find(s => s.id_empleado === id_empleado_sustituto);

  if (!sustitutoValido) {
    throw new Error('El sustituto no cumple con los requisitos legales de jornada');
  }

  const fecha = new Date().toISOString().split('T')[0];
  const id = await coberturaRepository.create({ fecha, id_inconsistencia, id_empleado_sustituto });

  await pool.query(
    `UPDATE INCONSISTENCIA SET estado = 'cubierta' WHERE id_inconsistencia = ?`,
    [id_inconsistencia]
  );

  return await coberturaRepository.findById(id);
};

const confirmar = async (id) => {
  await getById(id);
  await coberturaRepository.updateEstado(id, 'confirmada');
  return await coberturaRepository.findById(id);
};

module.exports = { getAll, getById, buscarSustitutos, asignarCobertura, confirmar };