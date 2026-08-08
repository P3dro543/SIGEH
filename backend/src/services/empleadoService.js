const empleadoRepository = require('../repositories/empleadoRepository');
const { findUserByUsername } = require('../repositories/authRepository');
const pool = require('../config/db');
const bcrypt = require('bcryptjs');

const getAll = async () => {
  return await empleadoRepository.findAll();
};

const getById = async (id) => {
  const empleado = await empleadoRepository.findById(id);
  if (!empleado) throw new Error('Empleado no encontrado');
  return empleado;
};

const create = async (data) => {
  const { cedula, nombre, apellido, telefono, email, id_area, username, password, id_rol } = data;

  if (!cedula || !nombre || !apellido || !id_area || !username || !password || !id_rol) {
    throw new Error('Todos los campos obligatorios son requeridos');
  }

  // Validar cédula duplicada
  const existente = await empleadoRepository.findByCedula(cedula);
  if (existente) throw new Error('Ya existe un empleado con esa cédula');

  // Validar username duplicado
  const [usuarios] = await pool.query(
    'SELECT * FROM USUARIO WHERE username = ?', [username]
  );
  if (usuarios.length > 0) throw new Error('Ese nombre de usuario ya está en uso');

  // Validar formato de cédula (solo números)
  if (!/^\d+$/.test(cedula)) {
    throw new Error('La cédula solo debe contener números');
  }

  // Validar longitud de contraseña
  if (password.length < 6) {
    throw new Error('La contraseña debe tener al menos 6 caracteres');
  }

  // Validar email si se proporcionó
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('El formato del email no es válido');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const [result] = await pool.query(
    'INSERT INTO USUARIO (username, password, estado, id_rol) VALUES (?, ?, 1, ?)',
    [username, hashedPassword, id_rol]
  );

  const id_usuario = result.insertId;
  const id_empleado = await empleadoRepository.create({ cedula, nombre, apellido, telefono, email, id_area, id_usuario });

  return await empleadoRepository.findById(id_empleado);
};

const update = async (id, data) => {
  await getById(id);
  await empleadoRepository.update(id, data);
  return await empleadoRepository.findById(id);
};

module.exports = { getAll, getById, create, update };