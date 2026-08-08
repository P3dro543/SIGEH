const pool = require('../config/db');

const findAll = async () => {
  const [rows] = await pool.query(
    `SELECT e.*, a.nombre AS area, u.username,
            j.nombre AS jornada
     FROM EMPLEADO e
     JOIN AREA a ON e.id_area = a.id_area
     JOIN USUARIO u ON e.id_usuario = u.id_usuario
     LEFT JOIN HORARIO h
       ON h.id_empleado = e.id_empleado
      AND CURDATE() BETWEEN h.fecha_inicio AND h.fecha_fin
     LEFT JOIN JORNADA j
       ON h.id_jornada = j.id_jornada`
  );
  return rows;
};

const findById = async (id) => {
  const [rows] = await pool.query(
    `SELECT e.*, a.nombre AS area, u.username,
            j.nombre AS jornada
     FROM EMPLEADO e
     JOIN AREA a ON e.id_area = a.id_area
     JOIN USUARIO u ON e.id_usuario = u.id_usuario
     LEFT JOIN HORARIO h
       ON h.id_empleado = e.id_empleado
      AND CURDATE() BETWEEN h.fecha_inicio AND h.fecha_fin
     LEFT JOIN JORNADA j
       ON h.id_jornada = j.id_jornada
     WHERE e.id_empleado = ?`,
    [id]
  );
  return rows[0] || null;
};

const findByCedula = async (cedula) => {
  const [rows] = await pool.query(
    'SELECT * FROM EMPLEADO WHERE cedula = ?',
    [cedula]
  );
  return rows[0] || null;
};

const create = async (empleado) => {
  const {
    cedula,
    nombre,
    apellido,
    telefono,
    email,
    id_area,
    id_usuario
  } = empleado;

  const [result] = await pool.query(
    `INSERT INTO EMPLEADO
      (cedula, nombre, apellido, telefono, email, id_area, id_usuario)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [cedula, nombre, apellido, telefono, email, id_area, id_usuario]
  );

  return result.insertId;
};

const update = async (id, empleado) => {
  const {
    cedula,
    nombre,
    apellido,
    telefono,
    email,
    id_area,
    activo
  } = empleado;

  await pool.query(
    `UPDATE EMPLEADO
     SET cedula = ?,
         nombre = ?,
         apellido = ?,
         telefono = ?,
         email = ?,
         id_area = ?,
         activo = ?
     WHERE id_empleado = ?`,
    [cedula, nombre, apellido, telefono, email, id_area, activo, id]
  );
};

module.exports = {
  findAll,
  findById,
  findByCedula,
  create,
  update
};