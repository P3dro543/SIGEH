const pool = require('../config/db');

const findAll = async () => {
  const { rows } = await pool.query('SELECT * FROM JORNADA');
  return rows;
};

const findById = async (id) => {
  const { rows } = await pool.query('SELECT * FROM JORNADA WHERE id_jornada = $1', [id]);
  return rows[0] || null;
};

const create = async (jornada) => {
  const { nombre, hora_inicio, hora_fin, horas_maximas } = jornada;
  const { rows } = await pool.query(
    'INSERT INTO JORNADA (nombre, hora_inicio, hora_fin, horas_maximas) VALUES ($1, $2, $3, $4) RETURNING id_jornada',
    [nombre, hora_inicio, hora_fin, horas_maximas]
  );
  return rows[0].id_jornada;
};

const update = async (id, jornada) => {
  const { nombre, hora_inicio, hora_fin, horas_maximas } = jornada;
  await pool.query(
    'UPDATE JORNADA SET nombre = $1, hora_inicio = $2, hora_fin = $3, horas_maximas = $4 WHERE id_jornada = $5',
    [nombre, hora_inicio, hora_fin, horas_maximas, id]
  );
};

const remove = async (id) => {
  await pool.query('DELETE FROM JORNADA WHERE id_jornada = $1', [id]);
};

module.exports = { findAll, findById, create, update, remove };
