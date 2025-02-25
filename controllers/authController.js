const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/user'); // Your MongoDB user model

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.googleAuth = async (req, res) => {
    const { idToken } = req.body;
    
    try {
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const { email, name, sub: googleId } = ticket.getPayload();

        let user = await User.findOne({ email });

        if (!user) {
            user = new User({ googleId: sub, email, name });
            await user.save();
        }

        const token = jwt.sign(
            { _id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({ token, userId: user._id });
    } catch (error) {
        res.status(401).json({ message: 'Invalid Google Token' });
    }
};
