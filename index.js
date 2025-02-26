//required npm for modules
const express = require('express');
const router = express.Router();
app = module.exports = express();
bcrypt = module.exports = require('bcrypt');
jwt = module.exports = require('jsonwebtoken');
nodemailer = module.exports = require('nodemailer');
const serverless = require('serverless-http')
module.exports = serverless(app);
cron = require('node-cron');
mongoose = module.exports = require('mongoose');
const cors = require("cors");
const notificationRoutes = require("./settings/notificationRoutes");

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;



//body parser
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
require("dotenv").config();
app.use(express.json());
const userRoutes = require("./settings/users_url");




console.log(process.env.MONGO_URL);
mongoose.connect(process.env.MONGO_URL).then(() => console.log('Connected!'));
JWT_SECRET = module.exports = process.env.JWT_SECRET;

// app.use("/api", notificationRoutes);
const authRoutes = require("./middleware/authenticate"); // Example route file
app.use("/google", authRoutes); 


//required all setting files
require("./settings/url_setting.js");
require("./controllers/controller_settings.js");
require("./middleware/authenticate.js");


//server start
const port = process.env.PORT || 8000;
app.listen(port, () => {
	console.log(`Success ${port}`);
});
console.log(process.cwd());




//initialize firebase in nodejs

// const admin = require('firebase-admin');
// const serviceAccount = require('../config/serviceAccountKey.json');

// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount)
// });

//  sendNotification = async (token, title, body) => {
//     const message = {
//         notification: { title, body },
//         token: token
//     };

//     try {
//         const response = await admin.messaging().send(message);
//         console.log('Notification sent:', response);
//     } catch (error) {
//         console.error('Error sending notification:', error);
//     }
// };
// module.exports = sendNotification;



