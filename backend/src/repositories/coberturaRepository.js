const pool = require('../config/db');

const findAll = async () => {
  const [rows] = await pool.query(
    `SELECT c.*, 
     e.nombre as sustituto_nombre, e.apellido as sustituto_apellido,
     i.tipo as inconsistencia_tipo
     FROM COBERTURA c
     JOIN EMPLEADO e ON c.id_empleado_sustituto = e.id_empleado
     JOIN INCONSISTENCIA i ON c.id_inconsistencia = i.id_inconsistencia
     ORDER BY c.fecha DESC`
  );
  return rows;
};

const findById = async (id) => {
  const [rows] = await pool.query(
    `SELECT c.*, 
     e.nombre as sustituto_nombre, e.apellido as sustituto_apellido,
     i.tipo as inconsistencia_tipo
     FROM COBERTURA c
     JOIN EMPLEADO e ON c.id_empleado_sustituto = e.id_empleado
     JOIN INCONSISTENCIA i ON c.id_inconsistencia = i.id_inconsistencia
     WHERE c.id_cobertura = ?`,
    [id]
  );
  return rows[0] || null;
};

const create = async (cobertura) => {
  const { fecha, id_inconsistencia, id_empleado_sustituto } = cobertura;
  const [result] = await pool.query(
    'INSERT INTO COBERTURA (fecha, estado, id_inconsistencia, id_empleado_sustituto) VALUES (?, "pendiente", ?, ?)',
    [fecha, id_inconsistencia, id_empleado_sustituto]
  );
  return result.insertId;
};

const updateEstado = async (id, estado) => {
  await pool.query(
    'UPDATE COBERTURA SET estado = ? WHERE id_cobertura = ?',
    [estado, id]
  );
};

module.exports = { findAll, findById, create, updateEstado };