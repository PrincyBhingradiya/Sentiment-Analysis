const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim:true,
    },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  googleId: {
    type: String,
    unique: true, // Ensures no duplicate Google accounts
    sparse: true, // Allows users without Google Sign-In
  },
  type: {
    type: String,
    enum:['user','admin'],
    default: 'user',
    required: true,
  },
  isBlocked: {
    type: Boolean,
    default: false, 
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  fcmToken: {
    type: String,
    default: null
  },
  
});

const User = mongoose.model('User', userSchema);

module.exports = User;
