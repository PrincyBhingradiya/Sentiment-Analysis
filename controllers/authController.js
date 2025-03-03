const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/users'); // Your MongoDB user model

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

module.exports.googleAuth = async (data, callback) => {
    try {
        console.log("Received Data:", data); 
        const { idToken } = data;

        if (!idToken) {
            return callback({ success: false, message: "Token is required." }); 
        }
    
            const ticket = await client.verifyIdToken({
                idToken,
                audience: process.env.GOOGLE_CLIENT_ID,
            });

            const { email, name, sub:googleId } = ticket.getPayload();

            let user = await User.findOne({ email });

            if (!user) {
                user = new User({ googleId, email, name });
                await user.save();
            } else if (!user.googleId) {
                user.googleId = googleId; // ✅ Update existing user with Google ID
                await user.save();
            }
            //generate token
            const token = jwt.sign(
                { _id: user._id, email: user.email, googleId: user.googleId },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );

            return callback({ success: true, token, userId: user._id });

        } catch (error) {
            console.error("Google Auth Error:", error.message);
            return callback({ success: false, message: "Invalid Google Token" });
        }
    };