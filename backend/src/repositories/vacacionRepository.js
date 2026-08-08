const pool = require('../config/db');

const findAll = async () => {
  const [rows] = await pool.query(
    `SELECT v.*, e.nombre, e.apellido, e.cedula
     FROM VACACION v
     JOIN EMPLEADO e ON v.id_empleado = e.id_empleado
     ORDER BY v.fecha_inicio DESC`
  );
  return rows;
};

const findById = async (id) => {
  const [rows] = await pool.query(
    `SELECT v.*, e.nombre, e.apellido, e.cedula
     FROM VACACION v
     JOIN EMPLEADO e ON v.id_empleado = e.id_empleado
     WHERE v.id_vacacion = ?`,
    [id]
  );
  return rows[0] || null;
};

const findByEmpleado = async (id_empleado) => {
  const [rows] = await pool.query(
    'SELECT * FROM VACACION WHERE id_empleado = ? ORDER BY fecha_inicio DESC',
    [id_empleado]
  );
  return rows;
};

const create = async (vacacion) => {
  const { fecha_inicio, fecha_fin, id_empleado } = vacacion;
  const [result] = await pool.query(
    'INSERT INTO VACACION (fecha_inicio, fecha_fin, estado, id_empleado) VALUES (?, ?, "pendiente", ?)',
    [fecha_inicio, fecha_fin, id_empleado]
  );
  return result.insertId;
};

const updateEstado = async (id, estado) => {
  await pool.query(
    'UPDATE VACACION SET estado = ? WHERE id_vacacion = ?',
    [estado, id]
  );
};

module.exports = { findAll, findById, findByEmpleado, create, updateEstado };