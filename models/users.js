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
  type: {
    type: String,
    enum:['user','admin'],
    default: 'user',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  fcmToken: {
    type: String
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
