const pool = require('../config/db');

const findUserByUsername = async (username) => {
  const [rows] = await pool.query(
    `SELECT u.*, r.nombre as rol 
     FROM USUARIO u 
     JOIN ROL r ON u.id_rol = r.id_rol 
     WHERE u.username = ? AND u.estado = 1`,
    [username]
  );
  return rows[0] || null;
};

module.exports = { findUserByUsername };