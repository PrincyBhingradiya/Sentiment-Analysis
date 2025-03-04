const admin = require('firebase-admin');
const User = require('../models/users');

const sendNotification = async (token, title, body) => {
    const message = {
        notification: { title, body },
        token: token
    };

    try {
        const response = await admin.messaging().send(message);
        console.log("Notification sent successfully:", response);
    } catch (error) {
        console.error("Error sending notification:", error);
    }
};

module.exports = sendNotification;

