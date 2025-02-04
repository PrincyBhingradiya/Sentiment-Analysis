const { Activity, CompletedActivity, UserActivity } = require('../models/activity'); // Adjust the path accordingly
const cron = require('node-cron');

module.exports = {
    ADD_ACTIVITY: async function(data, callback) {
        const { title } = data; 
        if (!title || title.trim() === "") {
            return callback({
                status: 400,
                data: { success: false, message: "Title is required." }
            });
        }
    
        try {
            // Check if an activity with the same title already exists
            const existingActivity = await Activity.findOne({ title: title.trim() });
    
            if (existingActivity) {
                return callback({
                    status: 400,
                    data: { success: false, message: "Activity with this title already exists." }
                });
            }
        
            const newActivity = new Activity({
                title,
                isChecked: false, // Default unchecked
                checkedBy: [],
                createdAt: new Date()
            });

            await newActivity.save();

            callback({
                status: 201,
                data: { success: true, message: 'Activity added successfully.', activity: newActivity }
            });
        } catch (error) {
            console.error("Add activity error:", error);
            callback({
                status: 500,
                data: { success: false, message: 'Failed to add activity.', error: error.message }
            });
        }
    },
        ADD_USER_ACTIVITY: async function (data, callback) {
            const { title, token } = data;  // Ensure token is received
            
            if (!title || title.trim() === "") {
                return callback({
                    status: 400,
                    data: { success: false, message: 'Title is required.' }
                });
            }
    
            try {
                // Verify the token and extract user ID
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                console.log("Decoded Token:", decoded);

                const userId = decoded._id; // Ensure _id exists in token
    
                if (!userId) {
                    return callback({
                        status: 400,
                        data: { success: false, message: 'Invalid token: userId is missing.' }
                    });
                }
    
                // Create new user activity
                const newUserActivity = new UserActivity({
                    title,
                    isChecked: false,
                    createdAt: new Date(),
                    userId: userId  // Ensure userId is included
                });
    
                await newUserActivity.save();
    
                callback({
                    status: 201,
                    data: { success: true, message: 'User-created activity added successfully.', activity: newUserActivity }
                });
            } catch (error) {
                console.error("Add user activity error:", error);
                callback({
                    status: 500,
                    data: { success: false, message: 'Failed to add user-created activity.', error: error.message }
                });
            }
        },

    // Get Default + User Activities Based on User ID
    GET_ACTIVITIES: async function(data, callback) {
        const { userId } = data;
    
        if (!userId) {
            return callback({
                status: 400,
                data: { success: false, message: 'User ID is required.' }
            });
        }
    
        try {
            // Fetch Default Activities (Only show checked activities by this user OR activities that haven't been checked yet)
            const defaultActivities = await Activity.find({
                $or: [
                    { checkedBy: { $in: [userId] } },
                    { checkedBy: { $size: 0 } }
                ]
            });
    
            // Fetch User-Specific Activities for this particular user
            const userActivities = await UserActivity.find({
                userId,
                isChecked: true,
                $or: [
                    { checkedBy: { $in: [userId] } },
                    { checkedBy: { $size: 0 } }
                ],

            });
    console.log("Date >>", new Date())
            callback({
                status: 200,
                data: { success: true, activities: [...defaultActivities, ...userActivities] }
            });
        } catch (error) {
            console.error("Get activities error:", error);
            callback({
                status: 500,
                data: { success: false, message: 'Failed to fetch activities.', error: error.message }
            });
        }
    },
    
    // Mark Activity as Checked (Per User)
    MARK_CHECKED: async function(data, callback) {
        const { activityId, userId } = data;
    
        if (!activityId || !userId) {
            return callback({ status: 400, data: { success: false, message: 'Activity ID and User ID are required.' } });
        }
    
        let activity = await Activity.findById(activityId);
        let isUserActivity = false;
    
        // Check if it's a User Activity or Default Activity
        if (!activity) {
            activity = await UserActivity.findById(activityId);
            isUserActivity = true;
        }
    
        if (!activity) {
            return callback({ status: 404, data: { success: false, message: 'Activity not found.' } });
        }
    
        // If the activity is already checked by the user, return conflict
        if (activity.checkedBy && activity.checkedBy.includes(userId)) {
            return callback({ status: 409, data: { success: false, message: 'Activity already checked by this user.' } });
        }
    
        // Add user to the checkedBy array for both types of activities
        if (!activity.checkedBy) {
            activity.checkedBy = [];
        }
        
        activity.checkedBy.push(userId);
    
        // If it is a user-created activity, mark as checked specifically for the user
        if (isUserActivity) {
            activity.isChecked = true;  // Mark user activity as checked
        }
    
        await activity.save();
    
        // Save Completion Record (tracking the completion)
        const completedActivity = new CompletedActivity({
            activityId: activity._id,
            userId,
            completedAt: new Date(),
        });
    
        await completedActivity.save();
    
        callback({ status: 200, data: { success: true, message: 'Activity marked as checked.', activity } });
    },
}
cron.schedule('0 0 * * *', async () => {
    try {
        await Activity.updateMany({}, { $set: { checkedBy: [] }});
        await UserActivity.updateMany({}, { $set: { checkedBy: [], isChecked: false }});
        console.log("All activities have been unchecked (reset at midnight GMT).");
    } catch (error) {
        console.error("Error resetting activities:", error);
    }
});