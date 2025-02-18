const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    default: "It's time to recognize or scan your face!"
  },
  date: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  notificationSent: {
    type: Boolean,
    default: false
  }
});
  
const Schedule = mongoose.model('Schedule', scheduleSchema);
module.exports = Schedule;
  