const pool = require('../config/db');

const findAll = async () => {
  const { rows } = await pool.query(
    `SELECT p.*, e.nombre, e.apellido, e.cedula
     FROM PERMISO p
     JOIN EMPLEADO e ON p.id_empleado = e.id_empleado
     ORDER BY p.fecha_inicio DESC`
  );
  return rows;
};

const findById = async (id) => {
  const { rows } = await pool.query(
    `SELECT p.*, e.nombre, e.apellido, e.cedula
     FROM PERMISO p
     JOIN EMPLEADO e ON p.id_empleado = e.id_empleado
     WHERE p.id_permiso = $1`,
    [id]
  );
  return rows[0] || null;
};

const findByEmpleado = async (id_empleado) => {
  const { rows } = await pool.query(
    'SELECT * FROM PERMISO WHERE id_empleado = $1 ORDER BY fecha_inicio DESC',
    [id_empleado]
  );
  return rows;
};

const create = async (permiso) => {
  const { fecha_inicio, fecha_fin, motivo, id_empleado } = permiso;
  const { rows } = await pool.query(
    "INSERT INTO PERMISO (fecha_inicio, fecha_fin, motivo, estado, id_empleado) VALUES ($1, $2, $3, 'pendiente', $4) RETURNING id_permiso",
    [fecha_inicio, fecha_fin, motivo, id_empleado]
  );
  return rows[0].id_permiso;
};

const updateEstado = async (id, estado) => {
  await pool.query(
    'UPDATE PERMISO SET estado = $1 WHERE id_permiso = $2',
    [estado, id]
  );
};

module.exports = { findAll, findById, findByEmpleado, create, updateEstado };
