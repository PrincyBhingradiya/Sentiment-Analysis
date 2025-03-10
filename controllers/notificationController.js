const User = require("../models/users");
const sendNotification = require("../utils/sendNotification");

/**
 * Save FCM Token for a user
 */
exports.saveFcmToken = async (req, res) => {
    const { userId, fcmToken } = req.body;

    if (!userId || !fcmToken) {
        return res.status(400).json({ success: false, message: "User ID and FCM Token are required." });
    }

    try {
        const user = await User.findByIdAndUpdate(userId, { fcmToken }, { new: true });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        res.status(200).json({ success: true, message: "FCM Token saved successfully.", user });
    } catch (error) {
        console.error("Error saving FCM token:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
};

/**
 * Send Notification to a specific user
 */
exports.sendPushNotification = async (req, res) => {
    const { userId, title, body } = req.body;

    if (!userId || !title || !body) {
        return res.status(400).json({ success: false, message: "User ID, title, and body are required." });
    }

    try {
        const user = await User.findById(userId);

        if (!user || !user.fcmToken) {
            return res.status(404).json({ success: false, message: "User not found or FCM token missing." });
        }

        const result = await sendNotification(user.fcmToken, title, body);
        res.status(result.success ? 200 : 500).json(result);
    } catch (error) {
        console.error("Error sending notification:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
};
