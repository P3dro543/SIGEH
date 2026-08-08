const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { findUserByUsername } = require('../repositories/authRepository');
const pool = require('../config/db');

const login = async (username, password) => {
  const usuario = await findUserByUsername(username);
  if (!usuario) throw new Error('Usuario no encontrado');

  const passwordValido = await bcrypt.compare(password, usuario.password);
  if (!passwordValido) throw new Error('Contraseña incorrecta');

  const [empleados] = await pool.query(
    'SELECT id_empleado FROM EMPLEADO WHERE id_usuario = ?',
    [usuario.id_usuario]
  );

  const id_empleado = empleados.length > 0 ? empleados[0].id_empleado : null;

  const token = jwt.sign(
    { id: usuario.id_usuario, rol: usuario.rol, id_empleado },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  return { token, rol: usuario.rol, username: usuario.username, id_empleado };
};

module.exports = { login };