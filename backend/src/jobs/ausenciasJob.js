const cron = require('node-cron');
const pool = require('../config/db');
const auditoriaService = require('../services/auditoriaService');

const TIME_ZONE = process.env.APP_TIME_ZONE || 'America/Costa_Rica';
const GRACE_MINUTES = Math.max(Number(process.env.ABSENCE_GRACE_MINUTES || 15), 0);

const localNow = () => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23'
  }).formatToParts(new Date()).reduce((result, part) => ({ ...result, [part.type]: part.value }), {});
  return { date: `${parts.year}-${parts.month}-${parts.day}`, time: `${parts.hour}:${parts.minute}:${parts.second}` };
};

const detectarAusencias = async () => {
  const { date, time } = localNow();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows: candidatos } = await client.query(
      `SELECT e.id_empleado, e.nombre, e.apellido, j.hora_inicio, a.id_asistencia
       FROM EMPLEADO e
       JOIN HORARIO h ON h.id_empleado = e.id_empleado AND $1::date BETWEEN h.fecha_inicio AND h.fecha_fin
       JOIN JORNADA j ON j.id_jornada = h.id_jornada
       LEFT JOIN ASISTENCIA a ON a.id_empleado = e.id_empleado AND a.fecha = $1::date
       WHERE e.activo = true
         AND $2::time >= j.hora_inicio + ($3 * INTERVAL '1 minute')
         AND (a.id_asistencia IS NULL OR a.hora_entrada IS NULL)
         AND NOT EXISTS (SELECT 1 FROM PERMISO p WHERE p.id_empleado = e.id_empleado AND p.estado = 'aprobado' AND $1::date BETWEEN p.fecha_inicio AND p.fecha_fin)
         AND NOT EXISTS (SELECT 1 FROM VACACION v WHERE v.id_empleado = e.id_empleado AND v.estado = 'aprobada' AND $1::date BETWEEN v.fecha_inicio AND v.fecha_fin)`,
      [date, time, GRACE_MINUTES]
    );

    const creadas = [];
    for (const empleado of candidatos) {
      let idAsistencia = empleado.id_asistencia;
      if (!idAsistencia) {
        const { rows } = await client.query(
          `INSERT INTO ASISTENCIA (fecha, id_empleado) VALUES ($1::date, $2)
           ON CONFLICT (id_empleado, fecha) DO UPDATE SET fecha = EXCLUDED.fecha
           RETURNING id_asistencia`,
          [date, empleado.id_empleado]
        );
        idAsistencia = rows[0].id_asistencia;
      }

      const { rows } = await client.query(
        `INSERT INTO INCONSISTENCIA (tipo, descripcion, fecha_hora, estado, id_asistencia)
         SELECT 'ausencia', $1, NOW(), 'pendiente', $2
         WHERE NOT EXISTS (
           SELECT 1 FROM INCONSISTENCIA WHERE id_asistencia = $2 AND tipo = 'ausencia'
         )
         RETURNING id_inconsistencia`,
        [`Ausencia detectada automáticamente. El turno inició a las ${String(empleado.hora_inicio).slice(0, 5)} y no se registró entrada.`, idAsistencia]
      );
      if (rows[0]) {
        await auditoriaService.registrar({
          entidad: 'inconsistencia', idEntidad: rows[0].id_inconsistencia, accion: 'ausencia_detectada',
          descripcion: `Ausencia detectada automáticamente para ${empleado.nombre} ${empleado.apellido}.`,
          datos: { id_empleado: empleado.id_empleado, fecha: date, hora_inicio: empleado.hora_inicio, margen_minutos: GRACE_MINUTES }
        }, client);
        creadas.push(rows[0].id_inconsistencia);
      }
    }
    await client.query('COMMIT');
    return creadas.length;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const iniciarJobAusencias = () => {
  const expression = process.env.ABSENCE_CRON || '*/5 * * * *';
  cron.schedule(expression, () => {
    detectarAusencias()
      .then(total => { if (total) console.info(`[ausencias-job] ${total} ausencia(s) detectada(s).`); })
      .catch(error => console.error('[ausencias-job] Error:', error.message));
  }, { timezone: TIME_ZONE, name: 'detectar-ausencias' });
  console.info(`[ausencias-job] Programado (${expression}, ${TIME_ZONE}, margen ${GRACE_MINUTES} min).`);
};

module.exports = { iniciarJobAusencias, detectarAusencias };
