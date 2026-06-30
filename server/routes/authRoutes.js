import express from 'express';
import {
  signup,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Define verification fields upload mapping
const uploadFields = upload.fields([
  { name: 'govtId', maxCount: 1 },
  { name: 'businessProof', maxCount: 1 },
  { name: 'collegeId', maxCount: 1 },
  { name: 'feeReceipt', maxCount: 1 },
]);

router.post('/signup', uploadFields, signup);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

export default router;
