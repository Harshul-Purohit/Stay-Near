import Review from '../models/Review.js';
import Hostel from '../models/Hostel.js';

// @desc    Add review for a hostel
// @route   POST /api/reviews/:hostelId
// @access  Private (Student only)
export const addReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const hostelId = req.params.hostelId;

    // Check if hostel exists
    const hostel = await Hostel.findById(hostelId);
    if (!hostel) {
      return res.status(404).json({ success: false, message: 'Hostel not found' });
    }

    // Check if student has already reviewed this hostel
    const alreadyReviewed = await Review.findOne({
      hostel: hostelId,
      student: req.user.id,
    });

    if (alreadyReviewed) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this hostel. Use Edit instead.' });
    }

    const review = await Review.create({
      student: req.user.id,
      hostel: hostelId,
      rating: Number(rating),
      comment,
    });

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      review,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update review or add reply
// @route   PUT /api/reviews/:id
// @access  Private (Student/Owner)
export const updateReview = async (req, res, next) => {
  try {
    let review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // If User is Owner, they can reply to reviews on their hostel
    if (req.user.role === 'owner') {
      const hostel = await Hostel.findById(review.hostel);
      if (!hostel || hostel.owner.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Not authorized to reply to this review' });
      }

      review.ownerReply = req.body.ownerReply || '';
      await review.save();

      return res.status(200).json({
        success: true,
        message: 'Reply added successfully',
        review,
      });
    }

    // If User is Student, they can edit their own rating/comment
    if (req.user.role === 'student') {
      if (review.student.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Not authorized to edit this review' });
      }

      review.rating = req.body.rating !== undefined ? Number(req.body.rating) : review.rating;
      review.comment = req.body.comment || review.comment;
      await review.save();

      // Trigger recalculation of average rating
      await Review.calculateAverageRating(review.hostel);

      return res.status(200).json({
        success: true,
        message: 'Review updated successfully',
        review,
      });
    }

    return res.status(403).json({ success: false, message: 'Not authorized to edit this review' });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private (Student/Admin only)
export const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Check permissions: either the student who wrote it or an admin
    if (review.student.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this review' });
    }

    const hostelId = review.hostel;
    await Review.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Report a review
// @route   POST /api/reviews/:id/report
// @access  Private
export const reportReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    review.isReported = true;
    review.reportReason = req.body.reason || 'Reported as inappropriate or fake';
    await review.save();

    res.status(200).json({
      success: true,
      message: 'Review reported to administrator for review.',
    });
  } catch (error) {
    next(error);
  }
};
