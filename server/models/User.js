import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: 6,
      select: false, // Don't return password by default
    },
    role: {
      type: String,
      enum: ['student', 'owner', 'admin'],
      default: 'student',
    },
    status: {
      type: String,
      enum: ['pending', 'verified', 'rejected', 'suspended'],
      default: function () {
        // Students are auto-verified for signup; owners/admins are subject to approval/roles.
        return this.role === 'student' ? 'verified' : 'pending';
      },
    },
    verificationDocs: {
      govtId: { type: String },        // Cloudinary URL or file path (Owners)
      businessProof: { type: String }, // Cloudinary URL or file path (Owners)
      collegeId: { type: String },     // Cloudinary URL or file path (Students)
      feeReceipt: { type: String },    // Cloudinary URL or file path (Students)
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
