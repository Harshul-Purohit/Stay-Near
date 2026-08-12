import Hostel from '../models/Hostel.js';
import Review from '../models/Review.js';
import { uploadToCloudinary } from '../middleware/uploadMiddleware.js';

// @desc    Get hostels with filtering & search
// @route   GET /api/hostels
// @access  Public
export const getHostels = async (req, res, next) => {
  try {
    const {
      genderType,
      budget,
      facilities,
      roomType,
      search,
      sort,
      university,
      all, // Admin flag to bypass verification filters
    } = req.query;

    const query = {};

    // Only show verified hostels unless explicitly requested by Admin/Owner
    if (all !== 'true') {
      query.isVerified = true;
    }

    // Filter by University
    if (university) {
      query.university = new RegExp(university, 'i');
    } else {
      query.university = 'JECRC University'; // default
    }

    // Filter by Gender
    if (genderType && genderType !== 'all') {
      query.genderType = genderType;
    }

    // Filter by Room Type
    if (roomType && roomType !== 'all') {
      query['roomTypes.type'] = new RegExp(roomType, 'i');
    }

    // Filter by Budget (checks if any roomType price is <= budget)
    if (budget) {
      query['roomTypes.price'] = { $lte: Number(budget) };
    }

    // Filter by Facilities (all listed facilities must match)
    if (facilities) {
      const facilityArray = Array.isArray(facilities)
        ? facilities
        : facilities.split(',');
      query.facilities = { $all: facilityArray };
    }

    // Search query (hostel name or address)
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { 'location.address': new RegExp(search, 'i') },
      ];
    }

    // Filter by Minimum Rating
    const { rating } = req.query;
    if (rating) {
      query.rating = { $gte: Number(rating) };
    }

    let result = Hostel.find(query);

    // Sorting options
    if (sort) {
      if (sort === 'priceAsc') {
        // Sort by minimum room price ascending
        result = result.sort({ 'roomTypes.price': 1 });
      } else if (sort === 'priceDesc') {
        result = result.sort({ 'roomTypes.price': -1 });
      } else if (sort === 'rating') {
        result = result.sort({ rating: -1 });
      } else {
        result = result.sort({ createdAt: -1 });
      }
    } else {
      result = result.sort({ createdAt: -1 });
    }

    const hostels = await result.populate('owner', 'name email');

    res.status(200).json({
      success: true,
      count: hostels.length,
      hostels,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single hostel details
// @route   GET /api/hostels/:id
// @access  Public
export const getHostelById = async (req, res, next) => {
  try {
    const hostel = await Hostel.findById(req.params.id).populate('owner', 'name email');

    if (!hostel) {
      return res.status(404).json({ success: false, message: 'Hostel not found' });
    }

    // Fetch reviews for this hostel
    const reviews = await Review.find({ hostel: req.params.id })
      .populate('student', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      hostel,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Register new hostel
// @route   POST /api/hostels
// @access  Private (Owner only)
export const createHostel = async (req, res, next) => {
  try {
    req.body.owner = req.user.id;

    // Set JECRC University default coordinates if not provided
    if (!req.body.location) {
      req.body.location = {
        address: req.body.address || 'Near JECRC University, Jaipur',
        lat: 26.7865,
        lng: 75.8725,
      };
    } else if (typeof req.body.location === 'string') {
      req.body.location = {
        address: req.body.location,
        lat: 26.7865,
        lng: 75.8725,
      };
    }

    // Parse JSON arrays/objects if sent as string from FormData
    if (req.body.roomTypes && typeof req.body.roomTypes === 'string') {
      req.body.roomTypes = JSON.parse(req.body.roomTypes);
    }
    if (req.body.facilities && typeof req.body.facilities === 'string') {
      req.body.facilities = JSON.parse(req.body.facilities);
    }
    if (req.body.mealTimings && typeof req.body.mealTimings === 'string') {
      req.body.mealTimings = JSON.parse(req.body.mealTimings);
    }
    if (req.body.weeklyMenu && typeof req.body.weeklyMenu === 'string') {
      req.body.weeklyMenu = JSON.parse(req.body.weeklyMenu);
    }

    const hostel = await Hostel.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Hostel listing submitted. Awaiting admin verification.',
      hostel,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update hostel details
// @route   PUT /api/hostels/:id
// @access  Private (Owner/Admin only)
export const updateHostel = async (req, res, next) => {
  try {
    let hostel = await Hostel.findById(req.params.id);

    if (!hostel) {
      return res.status(404).json({ success: false, message: 'Hostel not found' });
    }

    // Check ownership (only owner or admin can update)
    if (hostel.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this hostel listing' });
    }

    // Parse JSON fields if they are sent as strings
    if (req.body.roomTypes && typeof req.body.roomTypes === 'string') {
      req.body.roomTypes = JSON.parse(req.body.roomTypes);
    }
    if (req.body.facilities && typeof req.body.facilities === 'string') {
      req.body.facilities = JSON.parse(req.body.facilities);
    }
    if (req.body.mealTimings && typeof req.body.mealTimings === 'string') {
      req.body.mealTimings = JSON.parse(req.body.mealTimings);
    }
    if (req.body.weeklyMenu && typeof req.body.weeklyMenu === 'string') {
      req.body.weeklyMenu = JSON.parse(req.body.weeklyMenu);
    }
    if (req.body.location && typeof req.body.location === 'string') {
      req.body.location = JSON.parse(req.body.location);
    }

    hostel = await Hostel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Hostel updated successfully',
      hostel,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload images for hostel (room or food images)
// @route   POST /api/hostels/:id/images
// @access  Private (Owner only)
export const uploadHostelImages = async (req, res, next) => {
  try {
    const hostel = await Hostel.findById(req.params.id);
    if (!hostel) {
      return res.status(404).json({ success: false, message: 'Hostel not found' });
    }

    if (hostel.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this hostel' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'Please upload files' });
    }

    const { type } = req.body; // 'room' or 'food'
    const folder = type === 'food' ? 'staynear/food' : 'staynear/rooms';

    const uploadPromises = req.files.map((file) => uploadToCloudinary(file.buffer, folder));
    const urls = await Promise.all(uploadPromises);

    if (type === 'food') {
      hostel.foodImages = [...hostel.foodImages, ...urls];
    } else {
      hostel.images = [...hostel.images, ...urls];
    }

    await hostel.save();

    res.status(200).json({
      success: true,
      message: 'Images uploaded successfully',
      images: type === 'food' ? hostel.foodImages : hostel.images,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete hostel listing
// @route   DELETE /api/hostels/:id
// @access  Private (Owner/Admin only)
export const deleteHostel = async (req, res, next) => {
  try {
    const hostel = await Hostel.findById(req.params.id);

    if (!hostel) {
      return res.status(404).json({ success: false, message: 'Hostel not found' });
    }

    // Check ownership
    if (hostel.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this hostel listing' });
    }

    await hostel.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Hostel deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
