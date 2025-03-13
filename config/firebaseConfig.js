const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");

//  Correct path (pointing to the 'config' folder)
const serviceAccountPath = path.join(__dirname, "firebase-service-account.json");

//  Debug: Print file path to check
console.log("Looking for service account at:", serviceAccountPath);

//  If file is still missing, exit with error message
if (!fs.existsSync(serviceAccountPath)) {
    console.error(" ERROR: firebase-service-account.json NOT FOUND at", serviceAccountPath);
    process.exit(1);
}

//  Read and parse the JSON file
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
