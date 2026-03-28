import { Router } from 'express';
import { createVisitorPass, getMyVisitors, getAllVisitors, scanVisitorQR, denyVisitor } from '../controllers/visitorController';
import { verifyJWT, authorizeRoles } from '../middleware/authMiddleware';
import { UserRole } from '../entities/User';

const router = Router();

router.post('/', verifyJWT, authorizeRoles(UserRole.STUDENT), createVisitorPass);
router.post('/request', verifyJWT, authorizeRoles(UserRole.STUDENT), createVisitorPass);
router.get('/my', verifyJWT, authorizeRoles(UserRole.STUDENT), getMyVisitors);
router.get('/approved', verifyJWT, authorizeRoles(UserRole.SUPER_ADMIN, UserRole.WARDEN, UserRole.SECURITY, UserRole.STUDENT), getMyVisitors); // Return all for now or filter
router.get('/', verifyJWT, authorizeRoles(UserRole.SUPER_ADMIN, UserRole.WARDEN, UserRole.SECURITY), getAllVisitors);
router.post('/scan', verifyJWT, authorizeRoles(UserRole.SECURITY), scanVisitorQR);
router.patch('/:id/deny', verifyJWT, authorizeRoles(UserRole.SUPER_ADMIN, UserRole.WARDEN), denyVisitor);

export default router;
