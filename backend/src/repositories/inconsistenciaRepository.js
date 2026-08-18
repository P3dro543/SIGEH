const pool = require('../config/db');

const findAll = async () => {
  const { rows } = await pool.query(
    `SELECT i.*, e.nombre, e.apellido, e.cedula, ar.nombre as area
     FROM INCONSISTENCIA i
     JOIN ASISTENCIA a ON i.id_asistencia = a.id_asistencia
     JOIN EMPLEADO e ON a.id_empleado = e.id_empleado
     JOIN AREA ar ON e.id_area = ar.id_area
     ORDER BY i.fecha_hora DESC`
  );
  return rows;
};

const findById = async (id) => {
  const { rows } = await pool.query(
    `SELECT i.*, e.nombre, e.apellido, e.cedula, ar.nombre as area
     FROM INCONSISTENCIA i
     JOIN ASISTENCIA a ON i.id_asistencia = a.id_asistencia
     JOIN EMPLEADO e ON a.id_empleado = e.id_empleado
     JOIN AREA ar ON e.id_area = ar.id_area
     WHERE i.id_inconsistencia = $1`,
    [id]
  );
  return rows[0] || null;
};

const findByTipo = async (tipo) => {
  const { rows } = await pool.query(
    `SELECT i.*, e.nombre, e.apellido, e.cedula, ar.nombre as area
     FROM INCONSISTENCIA i
     JOIN ASISTENCIA a ON i.id_asistencia = a.id_asistencia
     JOIN EMPLEADO e ON a.id_empleado = e.id_empleado
     JOIN AREA ar ON e.id_area = ar.id_area
     WHERE i.tipo = $1
     ORDER BY i.fecha_hora DESC`,
    [tipo]
  );
  return rows;
};

const findByEstado = async (estado) => {
  const { rows } = await pool.query(
    `SELECT i.*, e.nombre, e.apellido, e.cedula, ar.nombre as area
     FROM INCONSISTENCIA i
     JOIN ASISTENCIA a ON i.id_asistencia = a.id_asistencia
     JOIN EMPLEADO e ON a.id_empleado = e.id_empleado
     JOIN AREA ar ON e.id_area = ar.id_area
     WHERE i.estado = $1
     ORDER BY i.fecha_hora DESC`,
    [estado]
  );
  return rows;
};

module.exports = { findAll, findById, findByTipo, findByEstado };
