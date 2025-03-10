const admin = require("firebase-admin");

/**
 * Send a push notification using Firebase Cloud Messaging (FCM)
 * @param {string} fcmToken - User's FCM Token
 * @param {string} title - Notification title
 * @param {string} body - Notification message
 * @returns {Promise<object>} - Returns success or failure response
 */
const sendNotification = async (fcmToken, title, body) => {
    if (!fcmToken) {
        console.error("FCM Token is missing.");
        return { success: false, message: "No FCM token provided." };
    }

    const message = {
        token: fcmToken,
        notification: { title, body },
        android: { priority: "high", notification: { sound: "default" } },
        apns: { payload: { aps: { sound: "default" } } },
    };

    try {
        const response = await admin.messaging().send(message);
        console.log("✅ Notification sent successfully:", response);
        return { success: true, response };
    } catch (error) {
        console.error("❌ Error sending notification:", error);
        return { success: false, message: error.message };
    }
};

module.exports = sendNotification;
