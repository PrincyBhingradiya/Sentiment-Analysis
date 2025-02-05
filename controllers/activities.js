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

         // Mark Activity as Checked (Per User)MARK_CHECKED: async function (data, callback) {
            MARK_CHECKED: async function (data, callback) {
                const { activityId, userId } = data;
            
                if (!activityId || !userId) {
                    return callback({ status: 400, data: { success: false, message: 'Activity ID and User ID are required.' } });
                }
            
                try {
                    // Check if activity exists in either default or user-created activities
                    let activity = await Activity.findById(activityId) || await UserActivity.findById(activityId);
            
                    if (!activity) {
                        return callback({ status: 404, data: { success: false, message: 'Activity not found.' } });
                    }
            
                    let existingCompleted = await CompletedActivity.findOne({ activityId, userId });
            
                    if (existingCompleted) {
                        if (!existingCompleted.ischecked) {
                            existingCompleted.ischecked = true;
                            existingCompleted.completedAt = new Date();
                            await existingCompleted.save();
                        }
                        return callback({ status: 200, data: { success: true, message: 'Activity already checked, updated timestamp.', activity: existingCompleted } });
                    }
            
                    // Store the title inside CompletedActivity
                    const completedActivity = new CompletedActivity({
                        activityId: activity._id,
                        userId,
                        title: activity.title, // Store the fetched title
                        completedAt: new Date(),
                        ischecked: true
                    });
            
                    await completedActivity.save();
            
                    callback({ status: 200, data: { success: true, message: 'Activity marked as checked.', completedActivity } });
            
                } catch (error) {
                    console.error("Mark checked error:", error);
                    callback({ status: 500, data: { success: false, message: 'Failed to mark activity as checked.', error: error.message } });
                }
            },
            GET_ACTIVITIES: async function (data, callback) {
                const { userId } = data;
            
                if (!userId) {
                    return callback({
                        status: 400,
                        data: { success: false, message: 'User ID is required.' }
                    });
                }
            
                try {
                    // Get all checked activity records for this user (including ischecked status)
                    const completedActivities = await CompletedActivity.find({ userId }).select("activityId ischecked");
                    
                    // Convert checked activities into a Map for quick lookup
                    const checkedActivityMap = new Map();
                    completedActivities.forEach(activity => {
                        checkedActivityMap.set(activity.activityId.toString(), activity.ischecked);
                    });
            
                    // Fetch default activities (including checked ones)
                    const defaultActivities = await Activity.find({
                        $or: [{ _id: { $nin: Array.from(checkedActivityMap.keys()) } }, { _id: { $in: Array.from(checkedActivityMap.keys()) } }]
                    });
            
                    // Fetch user-created activities (including checked ones)
                    const userActivities = await UserActivity.find({
                        userId,
                        $or: [{ _id: { $nin: Array.from(checkedActivityMap.keys()) } }, { _id: { $in: Array.from(checkedActivityMap.keys()) } }]
                    });
            
                    console.log("Date >>", new Date());
            
                    // Combine all activities, add `ischecked` status, and remove duplicates
                    const activityMap = new Map();
                    [...defaultActivities, ...userActivities].forEach(activity => {
                        activityMap.set(activity._id.toString(), {
                            _id: activity._id,
                            title: activity.title,
                            ischecked: checkedActivityMap.get(activity._id.toString()) || false, // Check if it's marked as checked
                            createdAt: activity.createdAt
                        });
                    });
            
                    callback({
                        status: 200,
                        data: { success: true, activities: Array.from(activityMap.values()) }
                    });
                } catch (error) {
                    console.error("Get activities error:", error);
                    callback({
                        status: 500,
                        data: { success: false, message: 'Failed to fetch activities.', error: error.message }
                    });
                }
            }
            

    // Get Default + User Activities Based on User ID
    // GET_ACTIVITIES: async function (data, callback) {
    //     const { userId } = data;
    
    //     if (!userId) {
    //         return callback({
    //             status: 400,
    //             data: { success: false, message: 'User ID is required.' }
    //         });
    //     }
    
    //     try {
    //         // Get all checked activity IDs for this user
    //         const checkedActivities = await CompletedActivity.find({ userId, ischecked: true }).select("activityId");
    //         const checkedActivityIds = checkedActivities.map(activity => activity.activityId);
    
    //         // Fetch default activities (including checked ones)
    //         const defaultActivities = await Activity.find({
    //             $or: [{ _id: { $nin: checkedActivityIds } }, { _id: { $in: checkedActivityIds } }]
    //         });
    
    //         // Fetch user-created activities (including checked ones)
    //         const userActivities = await UserActivity.find({
    //             userId,
    //             $or: [{ _id: { $nin: checkedActivityIds } }, { _id: { $in: checkedActivityIds } }]
    //         });
    
    //         console.log("Date >>", new Date());
    
    //         // Combine all activities and remove duplicates
    //         const activityMap = new Map();
    //         [...defaultActivities, ...userActivities].forEach(activity => {
    //             activityMap.set(activity._id.toString(), activity);
    //         });
    
    //         callback({
    //             status: 200,
    //             data: { success: true, activities: Array.from(activityMap.values()) }
    //         });
    //     } catch (error) {
    //         console.error("Get activities error:", error);
    //         callback({
    //             status: 500,
    //             data: { success: false, message: 'Failed to fetch activities.', error: error.message }
    //         });
    //     }
    // }   
}   
