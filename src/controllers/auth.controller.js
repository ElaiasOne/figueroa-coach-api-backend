import { pool } from '../config/db.js';
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken';

const signToken = (user) => {
  const payload = { id: user.id, rol: user.rol, nombre: user.nombre, email: user.email };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES || '7d' });
};

export const registerTrainerIfNeeded = async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) return res.status(404).json({ message: 'No existe usuario con ese email' });
    const user = rows[0];
    if (user.rol !== 'ENTRENADOR') return res.status(400).json({ message: 'El usuario no es ENTRENADOR' });
    const hash = await bcrypt.hash(password, 10);
    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [hash, user.id]);
    return res.json({ message: 'Password de entrenador seteada OK' });
  } catch (e) {
    return res.status(500).json({ message: 'Error', error: e.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) return res.status(401).json({ message: 'Credenciales inválidas' });
    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ message: 'Credenciales inválidas' });
    const token = signToken(user);
    return res.json({ token, user: { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol } });
  } catch (e) {
    return res.status(500).json({ message: 'Error', error: e.message });
  }
};

export const me = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, nombre, email, rol, sexo, edad, altura_cm, peso_actual_kg, peso_objetivo_kg
       FROM users WHERE id = ?`,
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Usuario no encontrado' });
    return res.json(rows[0]);
  } catch (e) {
    return res.status(500).json({ message: 'Error', error: e.message });
  }
};

export const createAlumno = async (req, res) => {
  const {
    nombre,
    email,
    password,
    sexo = null,
    edad = null,
    altura_cm = null,
    peso_actual_kg = null,
    peso_objetivo_kg = null
  } = req.body;

  try {
    if (!nombre || !email || !password) {
      return res.status(400).json({ message: 'Nombre, email y password son obligatorios' });
    }

    const hash = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO users
        (nombre, email, password_hash, rol, sexo, edad, altura_cm, peso_actual_kg, peso_objetivo_kg)
       VALUES
        (?, ?, ?, 'ALUMNO', ?, ?, ?, ?, ?)`,
      [
        nombre,
        email,
        hash,
        sexo ?? null,
        edad ?? null,
        altura_cm ?? null,
        peso_actual_kg ?? null,
        peso_objetivo_kg ?? null
      ]
    );

    return res.status(201).json({ message: 'Alumno creado' });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'El email ya existe' });
    }
    return res.status(500).json({ message: 'Error', error: e.message });
  }
};


// LISTAR / BUSCAR alumnos (solo entrenador)
export const listarAlumnos = async (req, res) => {
  const { search = '' } = req.query;
  try {
    let sql = `SELECT id, nombre, email, rol, sexo, edad, altura_cm, peso_actual_kg, peso_objetivo_kg, created_at
               FROM users WHERE rol = 'ALUMNO'`;
    const params = [];
    if (search) {
      sql += ` AND (nombre LIKE ? OR email LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }
    sql += ` ORDER BY created_at DESC LIMIT 100`;
    const [rows] = await pool.query(sql, params);
    return res.json(rows);
  } catch (e) {
    return res.status(500).json({ message: 'Error', error: e.message });
  }
};

// OBTENER alumno por id (solo entrenador)
export const obtenerAlumno = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT id, nombre, email, rol, sexo, edad, altura_cm, peso_actual_kg, peso_objetivo_kg
       FROM users WHERE id = ? AND rol = 'ALUMNO'`,
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'No encontrado' });
    return res.json(rows[0]);
  } catch (e) {
    return res.status(500).json({ message: 'Error', error: e.message });
  }
};

// ACTUALIZAR datos del alumno (solo entrenador)
export const actualizarAlumno = async (req, res) => {
  const { id } = req.params;
  const { nombre, email, sexo, edad, altura_cm, peso_actual_kg, peso_objetivo_kg } = req.body;
  try {
    const [r] = await pool.query(
      `UPDATE users SET
        nombre = IFNULL(?, nombre),
        email = IFNULL(?, email),
        sexo = ?,
        edad = ?,
        altura_cm = ?,
        peso_actual_kg = ?,
        peso_objetivo_kg = ?
       WHERE id = ? AND rol = 'ALUMNO'`,
      [
        nombre ?? null,
        email ?? null,
        sexo ?? null,
        (edad ?? null),
        (altura_cm ?? null),
        (peso_actual_kg ?? null),
        (peso_objetivo_kg ?? null),
        id
      ]
    );
    if (r.affectedRows === 0) return res.status(404).json({ message: 'No encontrado' });
    return res.json({ message: 'Alumno actualizado' });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: 'Email ya en uso' });
    return res.status(500).json({ message: 'Error', error: e.message });
  }
};
