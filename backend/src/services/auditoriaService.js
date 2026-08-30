const pool = require('../config/db');

const registrar = async ({ entidad, idEntidad = null, accion, descripcion, idUsuario = null, datos = {} }, client = pool) => {
  const { rows } = await client.query(
    `INSERT INTO AUDITORIA (entidad, id_entidad, accion, descripcion, id_usuario, datos)
     VALUES ($1, $2, $3, $4, $5, $6::jsonb)
     RETURNING *`,
    [entidad, idEntidad, accion, descripcion, idUsuario, JSON.stringify(datos)]
  );
  return rows[0];
};

const listar = async ({ entidad, idEntidad, limite = 100 } = {}) => {
  const params = [];
  const filtros = [];
  if (entidad) { params.push(entidad); filtros.push(`a.entidad = $${params.length}`); }
  if (idEntidad) { params.push(idEntidad); filtros.push(`a.id_entidad = $${params.length}`); }
  params.push(Math.min(Math.max(Number(limite) || 100, 1), 250));

  const { rows } = await pool.query(
    `SELECT a.*, COALESCE(u.username, 'Sistema automático') AS actor
     FROM AUDITORIA a
     LEFT JOIN USUARIO u ON u.id_usuario = a.id_usuario
     ${filtros.length ? `WHERE ${filtros.join(' AND ')}` : ''}
     ORDER BY a.fecha_hora DESC
     LIMIT $${params.length}`,
    params
  );
  return rows;
};

module.exports = { registrar, listar };
