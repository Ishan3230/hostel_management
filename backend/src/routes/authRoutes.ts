import { Router } from 'express';
import { register, login, getMe, getAllStudents } from '../controllers/authController';
import { verifyJWT, authorizeRoles } from '../middleware/authMiddleware';
import { UserRole } from '../entities/User';
import { catchAsync } from '../middleware/errorMiddleware';

const router = Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *               role: { type: string, enum: [STUDENT, WARDEN, SECURITY] }
 *               department: { type: string }
 *               year: { type: integer }
 *               studentId: { type: string }
 *               phoneNumber: { type: string }
 *     responses:
 *       201:
 *         description: User registered successfully
 */
router.post('/register', catchAsync(register));

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login and receive JWT token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, role]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *               role: { type: string, enum: [SUPER_ADMIN, WARDEN, STUDENT, SECURITY] }
 *     responses:
 *       200:
 *         description: JWT token returned
 */
router.post('/login', catchAsync(login));

router.get('/me', verifyJWT, catchAsync(getMe));
router.get('/students', verifyJWT, authorizeRoles(UserRole.SUPER_ADMIN, UserRole.WARDEN, UserRole.SECURITY), catchAsync(getAllStudents));

export default router;
