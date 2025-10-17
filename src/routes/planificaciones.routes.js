import { Router } from 'express'
import { authRequired, onlyTrainer } from '../middlewares/auth.js'
import {
  crearPlanificacion,
  listarPlanificaciones,
  obtenerPlanificacion,
  editarPlanificacion,
  eliminarPlanificacion,
  agregarRutina,
  editarRutina,
  eliminarRutina,
  agregarAlimentacion,
  editarAlimentacion,
  eliminarAlimentacion,
  agregarSuplementacion,
  editarSuplementacion,
  eliminarSuplementacion
} from '../controllers/planificaciones.controller.js'

const router = Router()

router.use(authRequired)

// Planificaciones
router.post('/planificaciones', onlyTrainer, crearPlanificacion)
router.get('/planificaciones', listarPlanificaciones)
router.get('/planificaciones/:id', obtenerPlanificacion)
router.put('/planificaciones/:id', onlyTrainer, editarPlanificacion)
router.delete('/planificaciones/:id', onlyTrainer, eliminarPlanificacion)

// Rutinas
router.post('/planificaciones/rutinas', onlyTrainer, agregarRutina)
router.put('/planificaciones/rutinas/:id', onlyTrainer, editarRutina)
router.delete('/planificaciones/rutinas/:id', onlyTrainer, eliminarRutina)

// Alimentación
router.post('/planificaciones/alimentaciones', onlyTrainer, agregarAlimentacion)
router.put('/planificaciones/alimentaciones/:id', onlyTrainer, editarAlimentacion)
router.delete('/planificaciones/alimentaciones/:id', onlyTrainer, eliminarAlimentacion)

// Suplementación
router.post('/planificaciones/suplementaciones', onlyTrainer, agregarSuplementacion)
router.put('/planificaciones/suplementaciones/:id', onlyTrainer, editarSuplementacion)
router.delete('/planificaciones/suplementaciones/:id', onlyTrainer, eliminarSuplementacion)

export default router
