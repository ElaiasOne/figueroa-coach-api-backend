//   backend_figueroa_coach/src/controllers/planificaciones.controller.js

import { pool } from '../config/db.js';

// ===================== PLANIFICACIONES =====================

export const crearPlanificacion = async (req, res) => {
  const { user_id, titulo, descripcion, fecha_inicio, fecha_fin } = req.body
  try {
    const [result] = await pool.query(
      `INSERT INTO planificaciones (user_id, titulo, descripcion, fecha_inicio, fecha_fin, created_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [user_id, titulo, descripcion || null, fecha_inicio || null, fecha_fin || null, req.user.id]
    )
    return res.status(201).json({ id: result.insertId, message: 'Planificación creada' })
  } catch (e) {
    return res.status(500).json({ message: 'Error', error: e.message })
  }
}

export const listarPlanificaciones = async (req, res) => {
  const { user_id } = req.query
  try {
    let sql = `SELECT p.*, u.nombre AS alumno_nombre
               FROM planificaciones p
               JOIN users u ON u.id = p.user_id`
    const params = []
    if (req.user.rol === 'ALUMNO') {
      sql += ' WHERE p.user_id = ?'
      params.push(req.user.id)
    } else if (user_id) {
      sql += ' WHERE p.user_id = ?'
      params.push(user_id)
    }
    sql += ' ORDER BY p.created_at DESC'
    const [rows] = await pool.query(sql, params)
    return res.json(rows)
  } catch (e) {
    return res.status(500).json({ message: 'Error', error: e.message })
  }
}

export const obtenerPlanificacion = async (req, res) => {
  const { id } = req.params
  try {
    const [plans] = await pool.query('SELECT * FROM planificaciones WHERE id = ?', [id])
    if (plans.length === 0) return res.status(404).json({ message: 'No encontrada' })
    const plan = plans[0]

    // permisos: el alumno solo puede ver sus planes
    if (req.user.rol === 'ALUMNO' && plan.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Sin permiso' })
    }

    const [rutinas] = await pool.query('SELECT * FROM rutinas WHERE planificacion_id = ?', [id])
    const [alimentaciones] = await pool.query(
      `SELECT * FROM alimentaciones
       WHERE planificacion_id = ?
       ORDER BY FIELD(comida,'DESAYUNO','ALMUERZO','MERIENDA','CENA','COLACION'), id`,
      [id]
    );
    const [suplementaciones] = await pool.query('SELECT * FROM suplementaciones WHERE planificacion_id = ?', [id])

    return res.json({ ...plan, rutinas, alimentaciones, suplementaciones })
  } catch (e) {
    return res.status(500).json({ message: 'Error', error: e.message })
  }
}

export const editarPlanificacion = async (req, res) => {
  const { id } = req.params
  const { titulo, descripcion, fecha_inicio, fecha_fin } = req.body
  try {
    const [r] = await pool.query(
      `UPDATE planificaciones
       SET titulo = IFNULL(?, titulo),
           descripcion = IFNULL(?, descripcion),
           fecha_inicio = IFNULL(?, fecha_inicio),
           fecha_fin = IFNULL(?, fecha_fin)
       WHERE id = ?`,
      [titulo ?? null, descripcion ?? null, fecha_inicio ?? null, fecha_fin ?? null, id]
    )
    if (r.affectedRows === 0) return res.status(404).json({ message: 'No encontrada' })
    return res.json({ message: 'Planificación actualizada' })
  } catch (e) {
    return res.status(500).json({ message: 'Error', error: e.message })
  }
}

export const eliminarPlanificacion = async (req, res) => {
  const { id } = req.params
  try {
    const [r] = await pool.query('DELETE FROM planificaciones WHERE id = ?', [id])
    if (r.affectedRows === 0) return res.status(404).json({ message: 'No encontrada' })
    return res.json({ message: 'Planificación eliminada' })
  } catch (e) {
    return res.status(500).json({ message: 'Error', error: e.message })
  }
}

// ===================== RUTINAS =====================

export const agregarRutina = async (req, res) => {
  const { planificacion_id, dia_semana, descripcion } = req.body
  try {
    await pool.query(
      'INSERT INTO rutinas (planificacion_id, dia_semana, descripcion) VALUES (?, ?, ?)',
      [planificacion_id, dia_semana, descripcion || null]
    )
    return res.status(201).json({ message: 'Rutina agregada' })
  } catch (e) {
    return res.status(500).json({ message: 'Error', error: e.message })
  }
}

export const editarRutina = async (req, res) => {
  const { id } = req.params
  const { dia_semana, descripcion } = req.body
  try {
    const [r] = await pool.query(
      `UPDATE rutinas SET
         dia_semana = IFNULL(?, dia_semana),
         descripcion = IFNULL(?, descripcion)
       WHERE id = ?`,
      [dia_semana ?? null, descripcion ?? null, id]
    )
    if (r.affectedRows === 0) return res.status(404).json({ message: 'No encontrada' })
    return res.json({ message: 'Rutina actualizada' })
  } catch (e) {
    return res.status(500).json({ message: 'Error', error: e.message })
  }
}

export const eliminarRutina = async (req, res) => {
  const { id } = req.params
  try {
    const [r] = await pool.query('DELETE FROM rutinas WHERE id = ?', [id])
    if (r.affectedRows === 0) return res.status(404).json({ message: 'No encontrada' })
    return res.json({ message: 'Rutina eliminada' })
  } catch (e) {
    return res.status(500).json({ message: 'Error', error: e.message })
  }
}

// ===================== ALIMENTACIÓN =====================

export const agregarAlimentacion = async (req, res) => {
  const { planificacion_id, comida, descripcion } = req.body;
  try {
    await pool.query(
      'INSERT INTO alimentaciones (planificacion_id, comida, descripcion) VALUES (?, ?, ?)',
      [planificacion_id, comida ?? null, descripcion || null]
    );
    return res.status(201).json({ message: 'Alimentación agregada' });
  } catch (e) {
    return res.status(500).json({ message: 'Error', error: e.message });
  }
};


export const editarAlimentacion = async (req, res) => {
  const { id } = req.params;
  const { comida, descripcion } = req.body;
  try {
    const [r] = await pool.query(
      `UPDATE alimentaciones
       SET comida = IFNULL(?, comida),
           descripcion = IFNULL(?, descripcion)
       WHERE id = ?`,
      [comida ?? null, descripcion ?? null, id]
    );
    if (r.affectedRows === 0) return res.status(404).json({ message: 'No encontrada' });
    return res.json({ message: 'Alimentación actualizada' });
  } catch (e) {
    return res.status(500).json({ message: 'Error', error: e.message });
  }
};


export const eliminarAlimentacion = async (req, res) => {
  const { id } = req.params
  try {
    const [r] = await pool.query('DELETE FROM alimentaciones WHERE id = ?', [id])
    if (r.affectedRows === 0) return res.status(404).json({ message: 'No encontrada' })
    return res.json({ message: 'Alimentación eliminada' })
  } catch (e) {
    return res.status(500).json({ message: 'Error', error: e.message })
  }
}

// ===================== SUPLEMENTACIÓN =====================

export const agregarSuplementacion = async (req, res) => {
  const { planificacion_id, descripcion } = req.body
  try {
    await pool.query(
      'INSERT INTO suplementaciones (planificacion_id, descripcion) VALUES (?, ?)',
      [planificacion_id, descripcion || null]
    )
    return res.status(201).json({ message: 'Suplementación agregada' })
  } catch (e) {
    return res.status(500).json({ message: 'Error', error: e.message })
  }
}

export const editarSuplementacion = async (req, res) => {
  const { id } = req.params
  const { descripcion } = req.body
  try {
    const [r] = await pool.query(
      `UPDATE suplementaciones SET descripcion = IFNULL(?, descripcion) WHERE id = ?`,
      [descripcion ?? null, id]
    )
    if (r.affectedRows === 0) return res.status(404).json({ message: 'No encontrada' })
    return res.json({ message: 'Suplementación actualizada' })
  } catch (e) {
    return res.status(500).json({ message: 'Error', error: e.message })
  }
}

export const eliminarSuplementacion = async (req, res) => {
  const { id } = req.params
  try {
    const [r] = await pool.query('DELETE FROM suplementaciones WHERE id = ?', [id])
    if (r.affectedRows === 0) return res.status(404).json({ message: 'No encontrada' })
    return res.json({ message: 'Suplementación eliminada' })
  } catch (e) {
    return res.status(500).json({ message: 'Error', error: e.message })
  }
}