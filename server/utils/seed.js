import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Hostel from '../models/Hostel.js';
import Review from '../models/Review.js';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding...');

    // Clear existing data
    await User.deleteMany();
    await Hostel.deleteMany();
    await Review.deleteMany();
    console.log('Existing collections cleared.');

    // 1. Create Users
    const student = await User.create({
      name: 'Harshul Student',
      email: 'student@staynear.in',
      password: 'student123',
      role: 'student',
      status: 'verified',
    });

    const owner = await User.create({
      name: 'Rajendra PG Owner',
      email: 'owner@staynear.in',
      password: 'owner123',
      role: 'owner',
      status: 'verified',
    });

    const admin = await User.create({
      name: 'Campus Admin',
      email: 'admin@staynear.in',
      password: 'admin123',
      role: 'admin',
      status: 'verified',
    });

    console.log('Users created (student, owner, admin).');

    // 2. Create Hostels
    const hostel1 = await Hostel.create({
      owner: owner._id,
      name: 'Royal Heritage Boys Hostel',
      university: 'JECRC University',
      location: {
        address: 'Sitapura Industrial Area, near JECRC Gate 2, Jaipur',
        lat: 26.7865,
        lng: 75.8725,
      },
      genderType: 'boys',
      contactNumber: '+91 9988776655',
      isVerified: true,
      facilities: ['Wi-Fi', 'AC', 'Gym', 'Laundry', 'Power Backup', 'RO Water', 'CCTV Security', '3 Meals Daily'],
      roomTypes: [
        { type: 'Single', capacity: 1, price: 9500, available: true },
        { type: 'Double', capacity: 2, price: 7500, available: true },
      ],
      mealTimings: {
        breakfast: '8:00 AM - 9:30 AM',
        lunch: '1:00 PM - 2:30 PM',
        dinner: '8:00 PM - 9:30 PM',
      },
      weeklyMenu: {
        monday: ['Poha', 'Dal Baati Churma', 'Alloo Sabji & Roti'],
        tuesday: ['Idli Sambhar', 'Rajma Chawal', 'Paneer Butter Masala & Roti'],
        wednesday: ['Aloo Paratha', 'Kadi Chawal', 'Seasonal Veg & Roti'],
        thursday: ['Upma', 'Chole Bhature', 'Veg Biryani & Raita'],
        friday: ['Veg Sandwich', 'Dal Makhani & Rice', 'Shahi Paneer & Naan'],
        saturday: ['Puri Bhaaji', 'Khichdi', 'Kofta Curry & Roti'],
        sunday: ['Sprouts', 'Veg Pulao', 'Special Kheer Thali'],
      },
      images: [
        'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=600',
        'https://images.unsplash.com/photo-1596276122653-651a3898309f?auto=format&fit=crop&q=80&w=600',
      ],
    });

    const hostel2 = await Hostel.create({
      owner: owner._id,
      name: 'Shree Balaji Girls Residency',
      university: 'JECRC University',
      location: {
        address: 'Plot 4, Sitapura Link Road, Jaipur',
        lat: 26.7845,
        lng: 75.8745,
      },
      genderType: 'girls',
      contactNumber: '+91 9922334455',
      isVerified: true,
      facilities: ['Wi-Fi', 'AC', 'Laundry', 'RO Water', 'CCTV Security', '3 Meals Daily'],
      roomTypes: [
        { type: 'Double', capacity: 2, price: 6800, available: true },
        { type: 'Triple', capacity: 3, price: 5500, available: true },
      ],
      mealTimings: {
        breakfast: '7:45 AM - 9:15 AM',
        lunch: '1:15 PM - 2:30 PM',
        dinner: '7:45 PM - 9:15 PM',
      },
      weeklyMenu: {
        monday: ['Poha', 'Dal Baati', 'Alloo Sabji'],
        tuesday: ['Idli', 'Rajma Chawal', 'Paneer Tikka'],
        wednesday: ['Paratha', 'Kadi Chawal', 'Mix Veg'],
        thursday: ['Upma', 'Chole Bhature', 'Veg Biryani'],
        friday: ['Sandwich', 'Dal Makhani', 'Shahi Paneer'],
        saturday: ['Puri Sabji', 'Khichdi', 'Kofta Curry'],
        sunday: ['Sprouts', 'Veg Pulao', 'Special Thali'],
      },
      images: [
        'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=600',
      ],
    });

    console.log('Hostels created.');

    // 3. Create Reviews
    await Review.create({
      student: student._id,
      hostel: hostel1._id,
      rating: 5,
      comment: 'Excellent hygiene and prompt maintenance. The food tastes homely and Wi-Fi speeds are outstanding!',
      ownerReply: 'Thank you Harshul! We aim to provide the best atmosphere for JECRC students.',
    });

    await Review.create({
      student: student._id,
      hostel: hostel2._id,
      rating: 4,
      comment: 'Very secure PG for girls. Wardens are helpful, and close proximity to campus gate makes it ideal.',
    });

    console.log('Reviews created.');
    console.log('Database Seeding Successful!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
