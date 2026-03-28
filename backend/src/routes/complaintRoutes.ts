import { Router } from 'express';
import { createComplaint, getAllComplaints, getMyComplaints, updateComplaintStatus, getComplaintAnalytics } from '../controllers/complaintController';
import { verifyJWT, authorizeRoles } from '../middleware/authMiddleware';
import { UserRole } from '../entities/User';

const router = Router();

router.post('/', verifyJWT, authorizeRoles(UserRole.STUDENT), createComplaint);
router.get('/', verifyJWT, authorizeRoles(UserRole.SUPER_ADMIN, UserRole.WARDEN), getAllComplaints);
router.get('/my', verifyJWT, authorizeRoles(UserRole.STUDENT), getMyComplaints);
router.get('/analytics', verifyJWT, authorizeRoles(UserRole.SUPER_ADMIN, UserRole.WARDEN), getComplaintAnalytics);
router.patch('/:id/status', verifyJWT, authorizeRoles(UserRole.SUPER_ADMIN, UserRole.WARDEN), updateComplaintStatus);

export default router;
