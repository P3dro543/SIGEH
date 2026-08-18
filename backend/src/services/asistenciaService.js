const asistenciaRepository = require('../repositories/asistenciaRepository');
const empleadoRepository = require('../repositories/empleadoRepository');
const pool = require('../config/db');

const getAll = async () => {
  return await asistenciaRepository.findAll();
};

const getById = async (id) => {
  const asistencia = await asistenciaRepository.findById(id);

  if (!asistencia) {
    throw new Error('Asistencia no encontrada');
  }

  return asistencia;
};

const getByEmpleado = async (id_empleado) => {
  return await asistenciaRepository.findByEmpleado(id_empleado);
};

const marcarEntrada = async (id_empleado) => {
  const empleado = await empleadoRepository.findById(id_empleado);

  if (!empleado) {
    throw new Error('Empleado no encontrado');
  }

  if (!empleado.activo) {
    throw new Error('Empleado inactivo');
  }

  const ahora = new Date();

  // Obtener la fecha local
  const hoy = new Date(
    ahora.getTime() - ahora.getTimezoneOffset() * 60000
  ).toISOString().split('T')[0];

  // Verificar si ya marcó entrada hoy
  const existente = await asistenciaRepository.findByEmpleadoYFecha(
    id_empleado,
    hoy
  );

  if (existente) {
    throw new Error('Ya se registró entrada para hoy');
  }

  // Verificar si tiene permiso aprobado hoy
  const { rows: permisos } = await pool.query(
    `SELECT * FROM PERMISO 
     WHERE id_empleado = $1
     AND estado = 'aprobado'
     AND $2 BETWEEN fecha_inicio AND fecha_fin`,
    [id_empleado, hoy]
  );

  if (permisos.length > 0) {
    throw new Error('El empleado tiene un permiso aprobado para hoy');
  }

  // Verificar si tiene vacaciones aprobadas hoy
  const { rows: vacaciones } = await pool.query(
    `SELECT * FROM VACACION 
     WHERE id_empleado = $1
     AND estado = 'aprobada'
     AND $2 BETWEEN fecha_inicio AND fecha_fin`,
    [id_empleado, hoy]
  );

  if (vacaciones.length > 0) {
    throw new Error('El empleado tiene vacaciones aprobadas para hoy');
  }

  // Registrar entrada
  const id = await asistenciaRepository.registrarEntrada(
    id_empleado,
    hoy,
    ahora
  );

  // Verificar tardanza
  const { rows: horarios } = await pool.query(
    `SELECT h.*, j.hora_inicio
     FROM HORARIO h
     JOIN JORNADA j ON h.id_jornada = j.id_jornada
     WHERE h.id_empleado = $1
     AND $2 BETWEEN h.fecha_inicio AND h.fecha_fin`,
    [id_empleado, hoy]
  );

  if (horarios.length > 0) {
    const horaInicio = horarios[0].hora_inicio;
    const horaEntrada = ahora.toTimeString().split(' ')[0];

    if (horaEntrada > horaInicio) {
      await pool.query(
        `INSERT INTO INCONSISTENCIA
        (tipo, descripcion, fecha_hora, estado, id_asistencia)
        VALUES ('tardanza', $1, $2, 'pendiente', $3)`,
        [
          `Llegó tarde. Hora esperada: ${horaInicio}, hora real: ${horaEntrada}`,
          ahora,
          id
        ]
      );
    }
  }

  return await asistenciaRepository.findById(id);
};

const marcarSalida = async (id_empleado) => {
  const ahora = new Date();

  // Obtener la fecha local
  const hoy = new Date(
    ahora.getTime() - ahora.getTimezoneOffset() * 60000
  ).toISOString().split('T')[0];

  // Buscar la asistencia de hoy
  const asistencia = await asistenciaRepository.findByEmpleadoYFecha(
    id_empleado,
    hoy
  );

  if (!asistencia) {
    throw new Error('No se registró entrada hoy');
  }

  if (asistencia.hora_salida) {
    throw new Error('Ya se registró salida para hoy');
  }

  // Registrar salida
  await asistenciaRepository.registrarSalida(
    asistencia.id_asistencia,
    ahora
  );

  // Verificar salida anticipada
  const { rows: horarios } = await pool.query(
    `SELECT h.*, j.hora_fin
     FROM HORARIO h
     JOIN JORNADA j ON h.id_jornada = j.id_jornada
     WHERE h.id_empleado = $1
     AND $2 BETWEEN h.fecha_inicio AND h.fecha_fin`,
    [id_empleado, hoy]
  );

  if (horarios.length > 0) {
    const horaFin = horarios[0].hora_fin;
    const horaSalida = ahora.toTimeString().split(' ')[0];

    if (horaSalida < horaFin) {
      await pool.query(
        `INSERT INTO INCONSISTENCIA
        (tipo, descripcion, fecha_hora, estado, id_asistencia)
        VALUES ('salida_anticipada', $1, $2, 'pendiente', $3)`,
        [
          `Salió antes. Hora esperada: ${horaFin}, hora real: ${horaSalida}`,
          ahora,
          asistencia.id_asistencia
        ]
      );
    }
  }

  return await asistenciaRepository.findById(
    asistencia.id_asistencia
  );
};

module.exports = {
  getAll,
  getById,
  getByEmpleado,
  marcarEntrada,
  marcarSalida
};
