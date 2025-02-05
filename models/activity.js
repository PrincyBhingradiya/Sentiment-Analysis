const { type } = require("os");

const activitySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    createdAt: {
        type: Date,
        default: Date.now, 
    }
});
const userActivitySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    createdAt: {
        type: Date,
        default: Date.now, 
    },
    userId: {  
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }
});

  const completedActivitySchema = new mongoose.Schema({
    activityId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Activity', 
        required: true 
    },
    userId: {  
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    completedAt: { 
        type: Date, 
        default: Date.now 
    },
    ischecked:{
        type:Boolean,
        default:false
    }
  });
  
  const Activity = mongoose.model('Activity', activitySchema);
  const UserActivity = mongoose.model('UserActivity', userActivitySchema);
  const CompletedActivity = mongoose.model('CompletedActivity', completedActivitySchema);

  module.exports = { Activity, CompletedActivity ,UserActivity};

