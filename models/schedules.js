const scheduleSchema = new mongoose.Schema({
  userId: 
  { type: mongoose.Schema.Types.ObjectId,
  ref: 'User',
  required: true },
   createdAt: {
        type: Date,
        default: Date.now, 
    },
}, 
{ timestamps: true });
  
  const Schedule = mongoose.model('Schedule', scheduleSchema);

  module.exports = Schedule;
  