module.exports = {
	BindUrl: function () {
        app.post("/schedule/create", function (req, res) {
            const { userId, date, time } = req.body;
        
            // Input validation
            if (!userId || !date || !time) {
                return res.status(400).json({ success: false, message: 'User ID, date, and time are required.' });
            } 
        
            var data = req.body;
            userschedule.SCHEDULE_CREATE(data, function(respData) {
                res.status(respData.status).json(respData.data);
            });
        });

        // Schedule Update Route
        app.post("/schedule/update", function (req, res) {
            const { scheduleId, date, time } = req.body;
        
            // Input validation
            if (!scheduleId || !date || !time) {
                return res.status(400).json({ success: false, message: 'Schedule ID, date, and time are required.' });
            }
        
            var data = req.body;
            userschedule.SCHEDULE_UPDATE(data, function(respData) {
                res.status(respData.status).json(respData.data);
            });
        });
        
        // Get User's Schedules Route
        app.post("/schedule/get", function (req, res) {
            const { userId } = req.body;
        
            // Input validation
            if (!userId) {
                return res.status(400).json({ success: false, message: 'User ID is required.' });
            }
        
            var data = { userId };
            userschedule.SCHEDULE_GET(data, function(respData) {
                res.status(respData.status).json(respData.data);
            });
        });
        // Schedule Delete Route
        app.post("/schedule/delete", function (req, res) {
            const { userId, scheduleId } = req.body;
        
        // Input validation
            if (!userId || !scheduleId) {
                return res.status(400).json({ success: false, message: 'User ID and schedule ID are required.' });
            }

            var data = { userId, scheduleId };
            userschedule.SCHEDULE_DELETE(data, function(respData) {
                res.status(respData.status).json(respData.data);
            });
        });
        }
}