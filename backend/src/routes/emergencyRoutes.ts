import { Router } from 'express';
import { triggerAlert, getAlerts, resolveAlert } from '../controllers/emergencyController';
import { verifyJWT, authorizeRoles } from '../middleware/authMiddleware';
import { UserRole } from '../entities/User';

const router = Router();

router.post('/alert', verifyJWT, triggerAlert);
router.get('/alerts', verifyJWT, authorizeRoles(UserRole.SUPER_ADMIN, UserRole.WARDEN), getAlerts);
router.patch('/alerts/:id/resolve', verifyJWT, authorizeRoles(UserRole.SUPER_ADMIN, UserRole.WARDEN), resolveAlert);
router.patch('/alert/:id/resolve', verifyJWT, authorizeRoles(UserRole.SUPER_ADMIN, UserRole.WARDEN), resolveAlert);

export default router;
