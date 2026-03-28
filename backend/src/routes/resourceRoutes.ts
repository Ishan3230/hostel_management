import { Router } from 'express';
import { getResources, createResource, bookResource, getMyBookings, getAllBookings, cancelBooking } from '../controllers/resourceController';
import { verifyJWT, authorizeRoles } from '../middleware/authMiddleware';
import { UserRole } from '../entities/User';

const router = Router();

router.get('/', verifyJWT, getResources);
router.post('/', verifyJWT, authorizeRoles(UserRole.SUPER_ADMIN, UserRole.WARDEN), createResource);
router.post('/book', verifyJWT, authorizeRoles(UserRole.STUDENT), bookResource);
router.get('/bookings/my', verifyJWT, authorizeRoles(UserRole.STUDENT), getMyBookings);
router.get('/bookings', verifyJWT, authorizeRoles(UserRole.SUPER_ADMIN, UserRole.WARDEN), getAllBookings);
router.delete('/bookings/:id', verifyJWT, cancelBooking);

export default router;
