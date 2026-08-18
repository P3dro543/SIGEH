const pool = require('../config/db');

const getAsistenciasPorPeriodo = async (
  fecha_inicio,
  fecha_fin,
  id_area,
  id_empleado
) => {
  let query = `
    SELECT
      a.*,
      e.nombre,
      e.apellido,
      e.cedula,
      ar.nombre AS area,
      j.nombre AS jornada
    FROM ASISTENCIA a
    JOIN EMPLEADO e ON a.id_empleado = e.id_empleado
    JOIN AREA ar ON e.id_area = ar.id_area
    LEFT JOIN HORARIO h
      ON h.id_empleado = e.id_empleado
      AND a.fecha BETWEEN h.fecha_inicio AND h.fecha_fin
    LEFT JOIN JORNADA j
      ON h.id_jornada = j.id_jornada
    WHERE a.fecha BETWEEN $1 AND $2
  `;

  const params = [fecha_inicio, fecha_fin];

  if (id_area) {
    query += ` AND e.id_area = $${params.length + 1}`;
    params.push(id_area);
  }

  if (id_empleado) {
    query += ` AND e.id_empleado = $${params.length + 1}`;
    params.push(id_empleado);
  }

  query += ` ORDER BY a.fecha DESC, e.apellido ASC`;

  const { rows } = await pool.query(query, params);
  return rows;
};

const getInconsistenciasPorPeriodo = async (
  fecha_inicio,
  fecha_fin,
  tipo,
  id_area,
  id_empleado
) => {
  let query = `
    SELECT
      i.*,
      e.nombre,
      e.apellido,
      e.cedula,
      ar.nombre AS area
    FROM INCONSISTENCIA i
    JOIN ASISTENCIA a
      ON i.id_asistencia = a.id_asistencia
    JOIN EMPLEADO e
      ON a.id_empleado = e.id_empleado
    JOIN AREA ar
      ON e.id_area = ar.id_area
    WHERE a.fecha BETWEEN $1 AND $2
  `;

  const params = [fecha_inicio, fecha_fin];

  if (tipo) {
    query += ` AND i.tipo = $${params.length + 1}`;
    params.push(tipo);
  }

  if (id_area) {
    query += ` AND e.id_area = $${params.length + 1}`;
    params.push(id_area);
  }

  if (id_empleado) {
    query += ` AND e.id_empleado = $${params.length + 1}`;
    params.push(id_empleado);
  }

  query += ` ORDER BY i.fecha_hora DESC`;

  const { rows } = await pool.query(query, params);
  return rows;
};

const getResumenPorEmpleado = async (
  fecha_inicio,
  fecha_fin,
  id_area,
  id_empleado
) => {
  let query = `
    SELECT
      e.id_empleado,
      e.nombre,
      e.apellido,
      e.cedula,
      ar.nombre AS area,
      COUNT(a.id_asistencia) AS dias_trabajados,
      SUM(CASE WHEN i.tipo='tardanza' THEN 1 ELSE 0 END) AS tardanzas,
      SUM(CASE WHEN i.tipo='ausencia' THEN 1 ELSE 0 END) AS ausencias,
      SUM(CASE WHEN i.tipo='salida_anticipada' THEN 1 ELSE 0 END) AS salidas_anticipadas
    FROM EMPLEADO e
    JOIN AREA ar
      ON e.id_area = ar.id_area
    LEFT JOIN ASISTENCIA a
      ON e.id_empleado = a.id_empleado
      AND a.fecha BETWEEN $1 AND $2
    LEFT JOIN INCONSISTENCIA i
      ON a.id_asistencia = i.id_asistencia
    WHERE e.activo = true
  `;

  const params = [fecha_inicio, fecha_fin];

  if (id_area) {
    query += ` AND e.id_area = $${params.length + 1}`;
    params.push(id_area);
  }

  if (id_empleado) {
    query += ` AND e.id_empleado = $${params.length + 1}`;
    params.push(id_empleado);
  }

  query += `
    GROUP BY
      e.id_empleado,
      e.nombre,
      e.apellido,
      e.cedula,
      ar.nombre
    ORDER BY e.apellido ASC
  `;

  const { rows } = await pool.query(query, params);
  return rows;
};

module.exports = {
  getAsistenciasPorPeriodo,
  getInconsistenciasPorPeriodo,
  getResumenPorEmpleado
};
