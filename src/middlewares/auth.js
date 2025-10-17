import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export const authRequired = (req, res, next) => {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Token requerido' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
};

export const onlyTrainer = (req, res, next) => {
  if (req.user?.rol !== 'ENTRENADOR') {
    return res.status(403).json({ message: 'Requiere rol ENTRENADOR' });
  }
  next();
};
