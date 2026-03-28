import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { uploadMenu, getMenus, submitFeedback, getMessAnalytics, getAllFeedbacks } from '../controllers/messController';
import { verifyJWT, authorizeRoles } from '../middleware/authMiddleware';
import { UserRole } from '../entities/User';

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, 'uploads/'),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

const router = Router();

router.post('/menu', verifyJWT, authorizeRoles(UserRole.SUPER_ADMIN, UserRole.WARDEN), upload.single('image'), uploadMenu);
router.get('/menu', verifyJWT, getMenus);
router.post('/feedback', verifyJWT, authorizeRoles(UserRole.STUDENT), submitFeedback);
router.get('/analytics', verifyJWT, authorizeRoles(UserRole.SUPER_ADMIN, UserRole.WARDEN), getMessAnalytics);
router.get('/feedback', verifyJWT, authorizeRoles(UserRole.SUPER_ADMIN, UserRole.WARDEN), getAllFeedbacks);

export default router;
