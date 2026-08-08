const pool = require('../config/db');

const findAll = async () => {
  const [rows] = await pool.query(
    `SELECT a.*, e.nombre, e.apellido, e.cedula
     FROM ASISTENCIA a
     JOIN EMPLEADO e ON a.id_empleado = e.id_empleado
     ORDER BY a.fecha DESC`
  );
  return rows;
};

const findById = async (id) => {
  const [rows] = await pool.query(
    `SELECT a.*, e.nombre, e.apellido, e.cedula
     FROM ASISTENCIA a
     JOIN EMPLEADO e ON a.id_empleado = e.id_empleado
     WHERE a.id_asistencia = ?`,
    [id]
  );
  return rows[0] || null;
};

const findByEmpleadoYFecha = async (id_empleado, fecha) => {
  const [rows] = await pool.query(
    'SELECT * FROM ASISTENCIA WHERE id_empleado = ? AND fecha = ?',
    [id_empleado, fecha]
  );
  return rows[0] || null;
};

const registrarEntrada = async (id_empleado, fecha, hora_entrada) => {
  const [result] = await pool.query(
    'INSERT INTO ASISTENCIA (fecha, hora_entrada, id_empleado) VALUES (?, ?, ?)',
    [fecha, hora_entrada, id_empleado]
  );
  return result.insertId;
};

const registrarSalida = async (id_asistencia, hora_salida) => {
  await pool.query(
    'UPDATE ASISTENCIA SET hora_salida = ? WHERE id_asistencia = ?',
    [hora_salida, id_asistencia]
  );
};

const findByEmpleado = async (id_empleado) => {
  const [rows] = await pool.query(
    'SELECT * FROM ASISTENCIA WHERE id_empleado = ? ORDER BY fecha DESC',
    [id_empleado]
  );
  return rows;
};

module.exports = { findAll, findById, findByEmpleadoYFecha, registrarEntrada, registrarSalida, findByEmpleado };