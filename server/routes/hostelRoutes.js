import express from 'express';
import {
  getHostels,
  getHostelById,
  createHostel,
  updateHostel,
  uploadHostelImages,
  deleteHostel,
} from '../controllers/hostelController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getHostels)
  .post(protect, authorize('owner'), createHostel);

router.route('/:id')
  .get(getHostelById)
  .put(protect, authorize('owner', 'admin'), updateHostel)
  .delete(protect, authorize('owner', 'admin'), deleteHostel);

router.post(
  '/:id/images',
  protect,
  authorize('owner'),
  upload.array('images', 10),
  uploadHostelImages
);

export default router;
