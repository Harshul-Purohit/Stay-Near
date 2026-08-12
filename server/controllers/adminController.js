import User from '../models/User.js';
import Hostel from '../models/Hostel.js';
import Review from '../models/Review.js';

// @desc    Get owners awaiting approval
// @route   GET /api/admin/pending-owners
// @access  Private (Admin only)
export const getPendingOwners = async (req, res, next) => {
  try {
    const owners = await User.find({ role: 'owner', status: 'pending' });
    res.status(200).json({ success: true, count: owners.length, owners });
  } catch (error) {
    next(error);
  }
};

// @desc    Get hostels awaiting verification
// @route   GET /api/admin/pending-hostels
// @access  Private (Admin only)
export const getPendingHostels = async (req, res, next) => {
  try {
    const hostels = await Hostel.find({ isVerified: false }).populate('owner', 'name email');
    res.status(200).json({ success: true, count: hostels.length, hostels });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve/verify owner status
// @route   PUT /api/admin/approve-owner/:id
// @access  Private (Admin only)
export const approveOwner = async (req, res, next) => {
  try {
    const { status } = req.body; // 'verified' or 'rejected'
    if (!['verified', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Please specify status as verified or rejected' });
    }

    const owner = await User.findById(req.params.id);
    if (!owner || owner.role !== 'owner') {
      return res.status(404).json({ success: false, message: 'Owner not found' });
    }

    owner.status = status;
    await owner.save();

    res.status(200).json({
      success: true,
      message: `Owner status updated to ${status}`,
      owner,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve/verify a hostel listing
// @route   PUT /api/admin/approve-hostel/:id
// @access  Private (Admin only)
export const approveHostel = async (req, res, next) => {
  try {
    const { action } = req.body; // 'approve' or 'reject'
    const hostel = await Hostel.findById(req.params.id);

    if (!hostel) {
      return res.status(404).json({ success: false, message: 'Hostel listing not found' });
    }

    if (action === 'approve') {
      hostel.isVerified = true;
      await hostel.save();
      res.status(200).json({ success: true, message: 'Hostel verified successfully', hostel });
    } else {
      // Rejection removes or flags the hostel
      await Hostel.findByIdAndDelete(req.params.id);
      res.status(200).json({ success: true, message: 'Hostel listing rejected and deleted' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Suspend or unsuspend a user account
// @route   PUT /api/admin/suspend-user/:id
// @access  Private (Admin only)
export const suspendUser = async (req, res, next) => {
  try {
    const { action } = req.body; // 'suspend' or 'unsuspend'
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot suspend an administrator account' });
    }

    user.status = action === 'suspend' ? 'suspended' : (user.role === 'owner' ? 'pending' : 'verified');
    await user.save();

    res.status(200).json({
      success: true,
      message: `User account status updated successfully to ${user.status}`,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reported reviews
// @route   GET /api/admin/reported-reviews
// @access  Private (Admin only)
export const getReportedReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ isReported: true })
      .populate('student', 'name email')
      .populate('hostel', 'name');
    res.status(200).json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    next(error);
  }
};

// @desc    Get system-wide analytics stats
// @route   GET /api/admin/analytics
// @access  Private (Admin only)
export const getAnalytics = async (req, res, next) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalOwners = await User.countDocuments({ role: 'owner' });
    const totalHostels = await Hostel.countDocuments();
    const verifiedHostels = await Hostel.countDocuments({ isVerified: true });
    const totalReviews = await Review.countDocuments();
    const reportedReviews = await Review.countDocuments({ isReported: true });

    // Calculate rating distribution
    const ratingStats = await Review.aggregate([
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      stats: {
        users: { student: totalStudents, owner: totalOwners },
        hostels: { total: totalHostels, verified: verifiedHostels, pending: totalHostels - verifiedHostels },
        reviews: { total: totalReviews, reported: reportedReviews },
        ratingDistribution: ratingStats,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all registered users (excluding admins)
// @route   GET /api/admin/users
// @access  Private (Admin only)
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } }).select('-password');
    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
};
