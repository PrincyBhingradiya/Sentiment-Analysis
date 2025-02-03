const scheduleSchema = new mongoose.Schema({
  userId: 
  { type: mongoose.Schema.Types.ObjectId,
  ref: 'User',
  required: true },

  date: 
  { type: Date, 
  required: true },

  time: { type: String, 
    required: true 
  }
}, 
{ timestamps: true });
  
  const Schedule = mongoose.model('Schedule', scheduleSchema);

  module.exports = Schedule;
  