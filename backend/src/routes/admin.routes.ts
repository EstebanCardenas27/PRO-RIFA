import { Router } from 'express'
import * as adminController from '../controllers/admin.controller'
import { requireAuth } from '../middleware/auth'

const router = Router()

router.use(requireAuth)

router.get('/me', adminController.getMe)
router.get('/raffles', adminController.getRaffles)
router.get('/raffles/:id/numbers', adminController.getRaffleNumbers)
router.patch('/raffles/:id', adminController.updateRaffle)
router.patch(
  '/raffles/:id/numbers/:number',
  adminController.updateRaffleNumber,
)

export default router