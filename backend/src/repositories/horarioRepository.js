const pool = require('../config/db');

const findByEmpleado = async (id_empleado) => {
  const { rows } = await pool.query(
    `SELECT h.*, j.nombre as jornada, j.hora_inicio, j.hora_fin, j.horas_maximas
     FROM HORARIO h
     JOIN JORNADA j ON h.id_jornada = j.id_jornada
     WHERE h.id_empleado = $1
     ORDER BY h.fecha_inicio DESC`,
    [id_empleado]
  );
  return rows;
};

const findActivo = async (id_empleado, fecha) => {
  const { rows } = await pool.query(
    `SELECT h.*, j.nombre as jornada, j.hora_inicio, j.hora_fin, j.horas_maximas
     FROM HORARIO h
     JOIN JORNADA j ON h.id_jornada = j.id_jornada
     WHERE h.id_empleado = $1 AND $2 BETWEEN h.fecha_inicio AND h.fecha_fin`,
    [id_empleado, fecha]
  );
  return rows[0] || null;
};

const create = async (horario) => {
  const { id_empleado, id_jornada, fecha_inicio, fecha_fin } = horario;
  const { rows } = await pool.query(
    'INSERT INTO HORARIO (fecha_inicio, fecha_fin, id_empleado, id_jornada) VALUES ($1, $2, $3, $4) RETURNING id_horario',
    [fecha_inicio, fecha_fin, id_empleado, id_jornada]
  );
  return rows[0].id_horario;
};

const update = async (id, horario) => {
  const { id_jornada, fecha_inicio, fecha_fin } = horario;
  await pool.query(
    'UPDATE HORARIO SET id_jornada = $1, fecha_inicio = $2, fecha_fin = $3 WHERE id_horario = $4',
    [id_jornada, fecha_inicio, fecha_fin, id]
  );
};

module.exports = { findByEmpleado, findActivo, create, update };
