const pool = require('../config/db');

const findByEmpleado = async (id_empleado) => {
  const [rows] = await pool.query(
    `SELECT h.*, j.nombre as jornada, j.hora_inicio, j.hora_fin, j.horas_maximas
     FROM HORARIO h
     JOIN JORNADA j ON h.id_jornada = j.id_jornada
     WHERE h.id_empleado = ?
     ORDER BY h.fecha_inicio DESC`,
    [id_empleado]
  );
  return rows;
};

const findActivo = async (id_empleado, fecha) => {
  const [rows] = await pool.query(
    `SELECT h.*, j.nombre as jornada, j.hora_inicio, j.hora_fin, j.horas_maximas
     FROM HORARIO h
     JOIN JORNADA j ON h.id_jornada = j.id_jornada
     WHERE h.id_empleado = ? AND ? BETWEEN h.fecha_inicio AND h.fecha_fin`,
    [id_empleado, fecha]
  );
  return rows[0] || null;
};

const create = async (horario) => {
  const { id_empleado, id_jornada, fecha_inicio, fecha_fin } = horario;
  const [result] = await pool.query(
    'INSERT INTO HORARIO (fecha_inicio, fecha_fin, id_empleado, id_jornada) VALUES (?, ?, ?, ?)',
    [fecha_inicio, fecha_fin, id_empleado, id_jornada]
  );
  return result.insertId;
};

const update = async (id, horario) => {
  const { id_jornada, fecha_inicio, fecha_fin } = horario;
  await pool.query(
    'UPDATE HORARIO SET id_jornada = ?, fecha_inicio = ?, fecha_fin = ? WHERE id_horario = ?',
    [id_jornada, fecha_inicio, fecha_fin, id]
  );
};

module.exports = { findByEmpleado, findActivo, create, update };