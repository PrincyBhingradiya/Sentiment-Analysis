// const User = require("../models/users");
// const admin = require("../config/firebaseConfig");

// // 🔹 Store FCM Token
// exports.storeToken = async (req, res) => {
//     const { userId, fcmToken } = req.body;

//     if (!userId || !fcmToken) {
//         return res.status(400).json({ error: "Missing userId or fcmToken" });
//     }

//     try {
//         let user = await User.findOne({ userId });
//         if (user) {
//             user.fcmToken = fcmToken;
//         } else {
//             user = new User({ userId, fcmToken });
//         }
//         await user.save();
//         res.json({ message: "Token stored successfully!" });
//     } catch (error) {
//         console.error("Database error:", error);
//         res.status(500).json({ error: "Failed to store token" });
//     }
// };

// // 🔹 Send Push Notification
// exports.sendNotification = async (req, res) => {
//     const { userId, title, body } = req.body;

//     if (!userId || !title || !body) {
//         return res.status(400).json({ error: "Missing parameters" });
//     }

//     try {
//         const user = await User.findOne({ userId });
//         if (!user || !user.fcmToken) {
//             return res.status(404).json({ error: "User not found or no FCM token" });
//         }

//         const message = {
//             token: user.fcmToken,
//             notification: { title, body },
//             data: { customData: "extra_info" }, // Optional extra data
//         };

//         await admin.messaging().send(message);
//         res.json({ message: "Notification sent successfully!" });
//     } catch (error) {
//         console.error("Error sending notification:", error);
//         res.status(500).json({ error: "Notification sending failed!" });
//     }
// };
