const forgotPasswordSchema = new mongoose.Schema({
   
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true
    },
    otp: {
      type: String,
      required: true,
      minlength: 6,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  });
  
  const forgotPassword = mongoose.model('forgot_password', forgotPasswordSchema);
  
  module.exports = forgotPassword;