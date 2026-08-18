import { Router } from 'express'
import * as raffleController from '../controllers/raffle.controller'

const router = Router()

router.get('/', raffleController.getRaffles)
router.get('/:id', raffleController.getRaffleById)
router.get('/:id/numbers', raffleController.getNumbersByRaffleId)

export default router