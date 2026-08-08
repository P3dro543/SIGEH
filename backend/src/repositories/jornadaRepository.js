const pool = require('../config/db');

const findAll = async () => {
  const [rows] = await pool.query('SELECT * FROM JORNADA');
  return rows;
};

const findById = async (id) => {
  const [rows] = await pool.query('SELECT * FROM JORNADA WHERE id_jornada = ?', [id]);
  return rows[0] || null;
};

const create = async (jornada) => {
  const { nombre, hora_inicio, hora_fin, horas_maximas } = jornada;
  const [result] = await pool.query(
    'INSERT INTO JORNADA (nombre, hora_inicio, hora_fin, horas_maximas) VALUES (?, ?, ?, ?)',
    [nombre, hora_inicio, hora_fin, horas_maximas]
  );
  return result.insertId;
};

const update = async (id, jornada) => {
  const { nombre, hora_inicio, hora_fin, horas_maximas } = jornada;
  await pool.query(
    'UPDATE JORNADA SET nombre = ?, hora_inicio = ?, hora_fin = ?, horas_maximas = ? WHERE id_jornada = ?',
    [nombre, hora_inicio, hora_fin, horas_maximas, id]
  );
};

const remove = async (id) => {
  await pool.query('DELETE FROM JORNADA WHERE id_jornada = ?', [id]);
};

module.exports = { findAll, findById, create, update, remove };