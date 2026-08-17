import express from 'express';
import {
  addReview,
  updateReview,
  deleteReview,
  reportReview,
  getMyReviews,
} from '../controllers/reviewController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/my-reviews', protect, authorize('student'), getMyReviews);
router.post('/:hostelId', protect, authorize('student'), addReview);
router.put('/:id', protect, authorize('student', 'owner'), updateReview);
router.delete('/:id', protect, authorize('student', 'admin'), deleteReview);
router.post('/:id/report', protect, reportReview);

export default router;
