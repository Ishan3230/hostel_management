import { Router } from 'express';
import { getMyQR, scanQR, getLogs, getLateEntries } from '../controllers/qrController';
import { verifyJWT, authorizeRoles } from '../middleware/authMiddleware';
import { UserRole } from '../entities/User';

const router = Router();

router.get('/my-qr', verifyJWT, authorizeRoles(UserRole.STUDENT), getMyQR);
router.post('/scan', verifyJWT, authorizeRoles(UserRole.SECURITY), scanQR);
router.get('/logs', verifyJWT, authorizeRoles(UserRole.SUPER_ADMIN, UserRole.WARDEN, UserRole.SECURITY), getLogs);
router.get('/logs/late', verifyJWT, authorizeRoles(UserRole.SUPER_ADMIN, UserRole.WARDEN), getLateEntries);

export default router;
