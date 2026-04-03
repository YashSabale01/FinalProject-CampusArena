const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['Student', 'Admin'],
    default: 'Student'
  },
  profileImage: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    maxlength: 200,
    default: ''
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.statics.createDefaultAdmins = async function() {
  const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@123';
  const admins = [
    { username: 'admin1', email: 'admin1@campusarena.com', password: adminPassword, role: 'Admin' },
    { username: 'admin2', email: 'admin2@campusarena.com', password: adminPassword, role: 'Admin' }
  ];

  for (const admin of admins) {
    const exists = await this.findOne({ username: admin.username });
    if (!exists) {
      await this.create(admin);
      console.log(`✅ Default admin created: ${admin.username}`);
    }
  }
};

module.exports = mongoose.model('User', userSchema);