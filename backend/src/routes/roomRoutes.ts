import { Router } from 'express';
import { getRooms, createRoom, getPreferences, submitPreference, autoAllocate, manualAllocate, getMyAllocation, getAllAllocations } from '../controllers/roomController';
import { verifyJWT, authorizeRoles } from '../middleware/authMiddleware';
import { UserRole } from '../entities/User';
import { catchAsync } from '../middleware/errorMiddleware';

const router = Router();

router.get('/', verifyJWT, catchAsync(getRooms));
router.post('/', verifyJWT, authorizeRoles(UserRole.SUPER_ADMIN, UserRole.WARDEN), catchAsync(createRoom));
router.get('/preferences', verifyJWT, catchAsync(getPreferences));
router.post('/preferences', verifyJWT, authorizeRoles(UserRole.STUDENT), catchAsync(submitPreference));
router.post('/allocate/auto', verifyJWT, authorizeRoles(UserRole.SUPER_ADMIN, UserRole.WARDEN), catchAsync(autoAllocate));
router.post('/allocate/manual', verifyJWT, authorizeRoles(UserRole.SUPER_ADMIN, UserRole.WARDEN), catchAsync(manualAllocate));
router.get('/my-allocation', verifyJWT, authorizeRoles(UserRole.STUDENT), catchAsync(getMyAllocation));
router.get('/allocations', verifyJWT, authorizeRoles(UserRole.SUPER_ADMIN, UserRole.WARDEN), catchAsync(getAllAllocations));

export default router;
