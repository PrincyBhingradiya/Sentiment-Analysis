const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    default: "Don't forget! Log your mood now to stay on track."
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
  