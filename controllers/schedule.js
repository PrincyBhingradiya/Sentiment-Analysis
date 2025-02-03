const Schedule = require('../models/schedules');
	 
module.exports = {
	
    SCHEDULE_CREATE: async function(data, callback) {
		const { userId, date, time } = data; // You may need userId to associate the schedule with a user
		try {
			// Create a new schedule
			const newSchedule = new Schedule({ userId, date, time });
			await newSchedule.save(); // Save to the database
			var sendData = {
				status: 201,
				data: { success: true, message: 'Schedule created successfully.' }
			};
			callback(sendData);
            return;
		} catch (error) {
			var sendData = {
				status: 500,
				data: { success: false, message: 'Server error while creating schedule.', error: error.message }
			};
			console.error("Error creating schedule:", error);
			callback(sendData);
			return;
		}
	},

	SCHEDULE_UPDATE: async function(data, callback) {
		const { scheduleId, date, time } = data;

		try {
			// Find and update the schedule by scheduleId
			const objectId = new mongoose.Types.ObjectId(scheduleId);
			const updatedSchedule = await Schedule.updateOne({ _id: objectId }, { $set: { date, time } });
			// await updatedSchedule.save(); // Save to the database

			if (updatedSchedule.modifiedCount === 0) {
				var sendData = {
					status: 400,
					data: { success: false, message: 'Schedule update failed.' }
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
			// Get all schedules for a user
			const schedules = await Schedule.find({ userId });

			var sendData = {
				status: 200,
				data: { success: true, schedules }
			};
			callback(sendData);
			return;
		} catch (error) {
			var sendData = {
				status: 500,
				data: { success: false, message: 'Server error while fetching schedules.', error: error.message }
			};
			console.error("Error fetching schedules:", error);
			callback(sendData);
			return;
		}
	},
	SCHEDULE_DELETE: async function(data, callback) {
		const { userId, scheduleId } = data;
	
		try {
			// Delete the schedule based on userId and scheduleId
			const objectId = new mongoose.Types.ObjectId(scheduleId);
			const deletedSchedule = await Schedule.deleteOne({ _id: objectId, userId });
	
			if (deletedSchedule.deletedCount === 0) {
				var sendData = {
					status: 400,
					data: { success: false, message: 'Schedule deletion failed. Either schedule does not exist or does not belong to the user.' }
				};
				callback(sendData);
				return;
			}
	
			var sendData = {
				status: 200,
				data: { success: true, message: 'Schedule deleted successfully.' }
			};
			callback(sendData);
			return;
		} catch (error) {
			var sendData = {
				status: 500,
				data: { success: false, message: 'Server error while deleting schedule.', error: error.message }
			};
			console.error("Error deleting schedule:", error);
			callback(sendData);
			return;
		}
	},
		SCHEDULE_CREATE: async function (data, callback) {
			const { userId, date, time } = data;
			try {
				// Create a new schedule
				const newSchedule = new Schedule({ userId, date, time });
				await newSchedule.save(); // Save to the database
				
				// Calculate the delay until the scheduled time
				const scheduledTime = new Date(`${date} ${time}`);
				const delay = scheduledTime.getTime() - Date.now();
	
				if (delay > 0) {
					// Schedule the notification
					cron.schedule(`*/1 * * * *`, async () => { // Every minute
						const now = new Date();
						if (now >= scheduledTime) {
							// Send notification if current time matches or exceeds the scheduled time
							await sendNotification(userId);
							console.log(`Notification sent to user ${userId}`);
						}
					});
				}
	
				var sendData = {
					status: 201,
					data: { success: true, message: 'Schedule created successfully.' }
				};
				callback(sendData);
				return;
			} catch (error) {
				var sendData = {
					status: 500,
					data: { success: false, message: 'Server error while creating schedule.', error: error.message }
				};
				console.error("Error creating schedule:", error);
				callback(sendData);
				return;
			}
		},
}