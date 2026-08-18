const pool = require('../config/db');

const findAll = async () => {
  const { rows } = await pool.query(
    `SELECT v.*, e.nombre, e.apellido, e.cedula
     FROM VACACION v
     JOIN EMPLEADO e ON v.id_empleado = e.id_empleado
     ORDER BY v.fecha_inicio DESC`
  );
  return rows;
};

const findById = async (id) => {
  const { rows } = await pool.query(
    `SELECT v.*, e.nombre, e.apellido, e.cedula
     FROM VACACION v
     JOIN EMPLEADO e ON v.id_empleado = e.id_empleado
     WHERE v.id_vacacion = $1`,
    [id]
  );
  return rows[0] || null;
};

const findByEmpleado = async (id_empleado) => {
  const { rows } = await pool.query(
    'SELECT * FROM VACACION WHERE id_empleado = $1 ORDER BY fecha_inicio DESC',
    [id_empleado]
  );
  return rows;
};

const create = async (vacacion) => {
  const { fecha_inicio, fecha_fin, id_empleado } = vacacion;
  const { rows } = await pool.query(
    "INSERT INTO VACACION (fecha_inicio, fecha_fin, estado, id_empleado) VALUES ($1, $2, 'pendiente', $3) RETURNING id_vacacion",
    [fecha_inicio, fecha_fin, id_empleado]
  );
  return rows[0].id_vacacion;
};

const updateEstado = async (id, estado) => {
  await pool.query(
    'UPDATE VACACION SET estado = $1 WHERE id_vacacion = $2',
    [estado, id]
  );
};

module.exports = { findAll, findById, findByEmpleado, create, updateEstado };
