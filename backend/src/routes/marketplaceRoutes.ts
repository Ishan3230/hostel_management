import { Router } from 'express';
import multer from 'multer';
import { createListing, getListings, getMyListings, updateListing, deleteListing, getSellerContact } from '../controllers/marketplaceController';
import { verifyJWT, authorizeRoles } from '../middleware/authMiddleware';
import { UserRole } from '../entities/User';

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, 'uploads/'),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

const router = Router();

router.post('/', verifyJWT, authorizeRoles(UserRole.STUDENT), upload.single('image'), createListing);
router.get('/', verifyJWT, getListings);
router.get('/my', verifyJWT, authorizeRoles(UserRole.STUDENT), getMyListings);
router.patch('/:id', verifyJWT, authorizeRoles(UserRole.STUDENT), updateListing);
router.delete('/:id', verifyJWT, deleteListing);
router.get('/:id/contact', verifyJWT, getSellerContact);

export default router;
