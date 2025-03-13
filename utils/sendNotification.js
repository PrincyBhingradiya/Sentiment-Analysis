const admin = require("../config/firebaseConfig"); // ✅ Import Firebase config

const sendNotification = async (fcmToken, message) => {
    if (!fcmToken) {
        console.error("❌ FCM Token is missing!");
        return { success: false, message: "FCM Token is missing" };
    }

    const payload = {
        notification: {
            title: "New Notification",
            body: message,
        },
        token: fcmToken,
    };

    try {
        const response = await admin.messaging().send(payload);
        console.log("✅ Notification sent successfully:", response);
        return { success: true, message: "Notification sent", response };
    } catch (error) {
        console.error("❌ Error sending notification:", error);
        return { success: false, message: error.message };
    }
};

module.exports = sendNotification;
