import mongoose from 'mongoose';

const roomTypeSchema = new mongoose.Schema({
  type: {
    type: String,
    required: [true, 'Please specify room type (e.g., Single, Double, Triple)'],
  },
  capacity: {
    type: Number,
    required: [true, 'Please specify room capacity (number of beds)'],
  },
  price: {
    type: Number,
    required: [true, 'Please specify room price per month'],
  },
  available: {
    type: Boolean,
    default: true,
  },
});

const mealTimingsSchema = new mongoose.Schema({
  breakfast: { type: String, default: '8:00 AM - 9:30 AM' },
  lunch: { type: String, default: '1:00 PM - 2:30 PM' },
  dinner: { type: String, default: '8:00 PM - 9:30 PM' },
});

const weeklyMenuSchema = new mongoose.Schema({
  monday: { type: [String], default: [] },
  tuesday: { type: [String], default: [] },
  wednesday: { type: [String], default: [] },
  thursday: { type: [String], default: [] },
  friday: { type: [String], default: [] },
  saturday: { type: [String], default: [] },
  sunday: { type: [String], default: [] },
});

const hostelSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Please add hostel name'],
      trim: true,
    },
    university: {
      type: String,
      default: 'JECRC University',
      required: true,
    },
    location: {
      address: {
        type: String,
        required: [true, 'Please add hostel address'],
      },
      lat: {
        type: Number,
        default: 26.7865, // Approximated coordinate for JECRC University, Jaipur
      },
      lng: {
        type: Number,
        default: 75.8725,
      },
    },
    genderType: {
      type: String,
      enum: ['boys', 'girls', 'co-ed'],
      required: [true, 'Please specify gender type'],
    },
    roomTypes: [roomTypeSchema],
    facilities: {
      type: [String],
      default: ['Wi-Fi', 'Power Backup', 'RO Water', 'CCTV Security'],
    },
    mealTimings: {
      type: mealTimingsSchema,
      default: () => ({}),
    },
    weeklyMenu: {
      type: weeklyMenuSchema,
      default: () => ({}),
    },
    images: {
      type: [String],
      default: [],
    },
    foodImages: {
      type: [String],
      default: [],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    contactNumber: {
      type: String,
      required: [true, 'Please add owner contact number'],
    },
    rating: {
      type: Number,
      default: 0,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Hostel = mongoose.model('Hostel', hostelSchema);
export default Hostel;
