const authenticate = require('../middleware/authenticate'); 

module.exports = {
	BindUrl: function () {
        app.post('/Schedule/create', authenticate, (req, res) => {
            if (!req.user || !req.user._id) {
                return res.status(401).json({ success: false, message: "Unauthorized: Invalid token." });
            }
        
            const userId = req.user._id; 
            const { date, time } = req.body; 
            const data = { userId, date, time };

            userschedule.SCHEDULE_CREATE(data, function(respData) {
                res.status(respData.status).json(respData.data);
            });
        });

        app.post("/schedule/update", function (req, res) {
            const { scheduleId, date, time } = req.body;
        
            if (!scheduleId || !date || !time) {
                return res.status(400).json({ success: false, message: 'Schedule ID, date, and time are required.' });
            }
        
            var data = req.body;
            userschedule.SCHEDULE_UPDATE(data, function(respData) {
                res.status(respData.status).json(respData.data);
            });
        });
                        
        app.post("/schedule/get", authenticate, function (req, res) {
            if (!req.user || !req.user._id) {
                return res.status(401).json({ success: false, message: "Unauthorized: Invalid token." });
            }

            const userId = req.user._id; 

            userschedule.SCHEDULE_GET({ userId }, function(respData) {
                res.status(respData.status).json(respData.data);
            });
        });
        app.post("/schedule/delete", authenticate, function (req, res) {
        
            if (!req.user || !req.user._id) {
                return res.status(401).json({ success: false, message: "Unauthorized: Invalid token." });
            }
        
            const userId = req.user._id; 
            const { scheduleId } = req.body;
        
            if (!scheduleId) {
                return res.status(400).json({ success: false, message: "Schedule ID is required." });
            }
        
            const data = { userId, scheduleId };
        
            userschedule.SCHEDULE_DELETE(data, function (respData) {
                res.status(respData.status).json(respData.data);
            });
        });
        app.post("/user/update-fcm-token", authenticate, async (req, res) => {
            const { fcmToken } = req.body;
            if (!fcmToken) return res.status(400).json({ success: false, message: "FCM Token is required" });
        
            try {
                await User.updateOne({ _id: req.user._id }, { fcmToken });
                res.status(200).json({ success: true, message: "FCM Token updated successfully" });
            } catch (error) {
                res.status(500).json({ success: false, message: "Server error", error: error.message });
            }
        });        
        }
}