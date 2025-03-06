const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
    const token = req.headers['authorization']; 
    if (!token) {
        return res.status(400).json({ success: false, message: 'Token is required.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { _id: decoded._id }; 

        if (!req.user._id) {
            return res.status(400).json({ success: false, message: 'Invalid token: userId is missing.' });
        }

        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Unauthorized: Invalid token' });
    }
};

module.exports = authenticate;
