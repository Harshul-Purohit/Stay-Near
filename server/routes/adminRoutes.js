import express from 'express';
import {
  getPendingOwners,
  getPendingHostels,
  approveOwner,
  approveHostel,
  suspendUser,
  getReportedReviews,
  getAnalytics,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply admin protection to all routes in this file
router.use(protect);
router.use(authorize('admin'));

router.get('/pending-owners', getPendingOwners);
router.get('/pending-hostels', getPendingHostels);
router.put('/approve-owner/:id', approveOwner);
router.put('/approve-hostel/:id', approveHostel);
router.put('/suspend-user/:id', suspendUser);
router.get('/reported-reviews', getReportedReviews);
router.get('/analytics', getAnalytics);

export default router;
