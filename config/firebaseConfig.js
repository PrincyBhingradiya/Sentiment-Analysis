const admin = require("firebase-admin");
const dotenv = require("dotenv");
dotenv.config();

const serviceAccount = require("../config/google-services.json"); // Ensure this file exists

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
