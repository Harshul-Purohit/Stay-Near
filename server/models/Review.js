import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    hostel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hostel',
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Please add a rating between 1 and 5'],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: [true, 'Please add a review comment'],
      trim: true,
    },
    ownerReply: {
      type: String,
      default: '',
    },
    isReported: {
      type: Boolean,
      default: false,
    },
    reportReason: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent user from submitting more than one review per hostel
reviewSchema.index({ hostel: 1, student: 1 }, { unique: true });

// Static method to get average rating for a hostel
reviewSchema.statics.calculateAverageRating = async function (hostelId) {
  const stats = await this.aggregate([
    {
      $match: { hostel: hostelId },
    },
    {
      $group: {
        _id: '$hostel',
        averageRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  try {
    if (stats.length > 0) {
      await this.model('Hostel').findByIdAndUpdate(hostelId, {
        rating: Math.round(stats[0].averageRating * 10) / 10,
        reviewCount: stats[0].reviewCount,
      });
    } else {
      await this.model('Hostel').findByIdAndUpdate(hostelId, {
        rating: 0,
        reviewCount: 0,
      });
    }
  } catch (err) {
    console.error('Error calculating average rating:', err);
  }
};

// Call calculateAverageRating after save
reviewSchema.post('save', function () {
  this.constructor.calculateAverageRating(this.hostel);
});

// Call calculateAverageRating after remove (or findOneAndDelete)
reviewSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    await doc.constructor.calculateAverageRating(doc.hostel);
  }
});

const Review = mongoose.model('Review', reviewSchema);
export default Review;
