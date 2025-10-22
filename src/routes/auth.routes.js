//   backend_figueroa_coach/src/routes/auth.routes.js

import { Router } from 'express';
import {
  login,
  me,
  createAlumno,
  registerTrainerIfNeeded,
  listarAlumnos,
  obtenerAlumno,
  actualizarAlumno,
  eliminarAlumno ,
  actualizarPasswordAlumno 
} from '../controllers/auth.controller.js';
import { authRequired, onlyTrainer } from '../middlewares/auth.js';

const router = Router();

router.post('/auth/setup-trainer', registerTrainerIfNeeded);
router.post('/auth/login', login);

// alumnos
router.post('/auth/alumnos', authRequired, onlyTrainer, createAlumno);
router.get('/auth/alumnos', authRequired, onlyTrainer, listarAlumnos);
router.get('/auth/alumnos/:id', authRequired, onlyTrainer, obtenerAlumno);
router.put('/auth/alumnos/:id', authRequired, onlyTrainer, actualizarAlumno);
router.delete('/auth/alumnos/:id', authRequired, onlyTrainer, eliminarAlumno);
router.put('/auth/alumnos/:id/password', authRequired, onlyTrainer, actualizarPasswordAlumno); // <-- NUEVO

router.get('/auth/me', authRequired, me);

export default router;
