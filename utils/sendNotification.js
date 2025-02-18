// const admin = require("firebase-admin");

// // Initialize Firebase Admin SDK if not already initialized
// if (!admin.apps.length) {
//     const serviceAccount = require("../config/serviceAccountKey.json"); // Ensure this file exists
//     admin.initializeApp({
//         credential: admin.credential.cert(serviceAccount),
//     });
// }

// /**
//  * Send Push Notification using Firebase Cloud Messaging (FCM)
//  * @param {string} fcmToken - User's FCM Token
//  * @param {string} title - Notification title
//  * @param {string} body - Notification message
//  */
// const sendNotification = async (fcmToken, title, body) => {
//     try {
//         if (!fcmToken) {
//             console.error("No FCM token provided.");
//             return;
//         }

//         const message = {
//             token: fcmToken,
//             notification: {
//                 title,
//                 body,
//             },
//             android: {
//                 priority: "high",
//                 notification: {
//                     sound: "default",
//                 },
//             },
//             apns: {
//                 payload: {
//                     aps: {
//                         sound: "default",
//                     },
//                 },
//             },
//         };

//         const response = await admin.messaging().send(message);
//         console.log("Notification sent successfully:", response);
//     } catch (error) {
//         console.error("Error sending notification:", error);
//     }
// };

// module.exports = sendNotification;
