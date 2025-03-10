const Schedule = require('../models/schedules');
const User = require('../models/users'); 
const sendNotification = require('../utils/sendNotification');
const cron = require('node-cron');
// const mongoose = require("mongoose");

cron.schedule('* * * * *', async () => {
	console.log(' Checking scheduled notifications...');

	const now = new Date();
	const formattedDate = now.toISOString().split('T')[0]; // Format YYYY-MM-DD
	const formattedTime = now.toTimeString().slice(0, 5); // Format HH:mm

	const schedules = await Schedule.find({ date: formattedDate, time: formattedTime, notificationSent: false });

	for (const schedule of schedules) {
		const user = await User.findById(schedule.userId);
		if (user && user.fcmToken) {
			const notificationResponse = await sendNotification(user.fcmToken, "Scheduled Alert", "Don't forget! Log your mood now to stay on track.");
			console.log(` Notification Response:`, notificationResponse);
			
			// Update notification status only if sent successfully
			if (notificationResponse.success) {
				await Schedule.updateOne({ _id: schedule._id }, { notificationSent: true });
				console.log(` Notification sent for schedule ID: ${schedule._id}`);
			}
		} else {
			console.log(` No FCM Token found for user ID: ${schedule.userId}`);
		}
	}
});

	 
module.exports = {
	SCHEDULE_CREATE: async function (data, callback) {
        const { userId, date, time } = data;

        try {
            const newSchedule = new Schedule({ userId, date, time });
            await newSchedule.save();

            const scheduledTime = new Date(`${date}T${time}`);
            const delay = scheduledTime.getTime() - Date.now();

            let notificationResponse = null;

            if (delay > 0) {
                setTimeout(async () => {
                    const user = await User.findById(userId);
                    if (user && user.fcmToken) {
                        notificationResponse = await sendNotification(user.fcmToken, "Scheduled Alert", "Your scheduled event is due now!");
                        console.log(`Notification sent to user ${userId}`);
                    }
                }, delay);
            }

            callback({
                status: 201,
                data: { 
                    success: true, 
                    message: 'Schedule created successfully.', 
                    schedule: newSchedule, 
                    notification: notificationResponse // Pass notification response
                }
            });

        } catch (error) {
            console.error("Error creating schedule:", error);
            callback({
                status: 500,
                data: { success: false, message: 'Server error while creating schedule.', error: error.message }
            });
        }
    },
	
	SCHEDULE_UPDATE: async function(data, callback) {
		const { scheduleId, date, time } = data;
	
		try {
			// Find and update the schedule by scheduleId
			const objectId = new mongoose.Types.ObjectId(scheduleId);
			const updatedSchedule = await Schedule.updateOne(
				{ _id: objectId }, // Filter by scheduleId
				{ $set: { date: date, time: time } } // Set the new date and time fields
			);
	
			if (updatedSchedule.modifiedCount === 0) {
				var sendData = {
					status: 400,
					data: { success: false, message: 'Schedule update failed. No changes were made or schedule does not exist.' }
				};
				callback(sendData);
				return;
			}
	
			var sendData = {
				status: 200,
				data: { success: true, message: 'Schedule updated successfully.' }
			};
			callback(sendData);
			return;
		} catch (error) {
			var sendData = {
				status: 500,
				data: { success: false, message: 'Server error while updating schedule.', error: error.message }
			};
			console.error("Error updating schedule:", error);
			callback(sendData);
			return;
		}
	},
	
	
	SCHEDULE_GET: async function(data, callback) {
		const { userId } = data;
	
		try {
			// Fetch schedules for the user
			const schedules = await Schedule.find({ userId });
	
			callback({
				status: 200,
				data: { success: true, schedules }
			});
	
		} catch (error) {
			console.error("Error fetching schedules:", error);
			callback({
				status: 500,
				data: { success: false, message: 'Server error while fetching schedules.', error: error.message }
			});
		}
	},	

	SCHEDULE_DELETE: async function (data, callback) {
		const { userId, scheduleId } = data;
	
		try {
			const objectId = new mongoose.Types.ObjectId(scheduleId);
			const deletedSchedule = await Schedule.deleteOne({ _id: objectId, userId });
	
			if (deletedSchedule.deletedCount === 0) {
				return callback({
					status: 400,
					data: { success: false, message: "Schedule deletion failed. Either schedule does not exist or does not belong to the user." }
				});
			}
	
			callback({
				status: 200,
				data: { success: true, message: "Schedule deleted successfully." }
			});
		} catch (error) {
			console.error("Error deleting schedule:", error);
			callback({
				status: 500,
				data: { success: false, message: "Server error while deleting schedule.", error: error.message }
			});
		}
	},
	
}

 