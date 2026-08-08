const pool = require('../config/db');

const findAll = async () => {
  const [rows] = await pool.query(
    `SELECT j.*, i.tipo, i.descripcion as inconsistencia_descripcion,
     e.nombre, e.apellido
     FROM JUSTIFICACION j
     JOIN INCONSISTENCIA i ON j.id_inconsistencia = i.id_inconsistencia
     JOIN ASISTENCIA a ON i.id_asistencia = a.id_asistencia
     JOIN EMPLEADO e ON a.id_empleado = e.id_empleado
     ORDER BY j.fecha_envio DESC`
  );
  return rows;
};

const findById = async (id) => {
  const [rows] = await pool.query(
    `SELECT j.*, i.tipo, i.descripcion as inconsistencia_descripcion,
     e.nombre, e.apellido
     FROM JUSTIFICACION j
     JOIN INCONSISTENCIA i ON j.id_inconsistencia = i.id_inconsistencia
     JOIN ASISTENCIA a ON i.id_asistencia = a.id_asistencia
     JOIN EMPLEADO e ON a.id_empleado = e.id_empleado
     WHERE j.id_justificacion = ?`,
    [id]
  );
  return rows[0] || null;
};

const create = async (justificacion) => {
  const { descripcion, id_inconsistencia } = justificacion;
  const [result] = await pool.query(
    'INSERT INTO JUSTIFICACION (descripcion, fecha_envio, estado, id_inconsistencia) VALUES (?, ?, "pendiente", ?)',
    [descripcion, new Date(), id_inconsistencia]
  );
  return result.insertId;
};

const updateEstado = async (id, estado) => {
  await pool.query(
    'UPDATE JUSTIFICACION SET estado = ? WHERE id_justificacion = ?',
    [estado, id]
  );
};

module.exports = { findAll, findById, create, updateEstado };