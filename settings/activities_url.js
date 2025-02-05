const authenticate = require('../middleware/authenticate'); 
module.exports = {
	BindUrl: function () {
        app.post('/add-activity', (req, res) => {
            const data = req.body;
            activityController.ADD_ACTIVITY(req.body, function(respData) {
                res.status(respData.status).json(respData.data);
            });
        });
        app.post('/add-user-activity', function (req, res) {
            const token = req.headers['authorization'];  
            
            if (!token) {
                return res.status(400).json({ success: false, message: 'Token is required.' });
            }
        
            const actualToken = token; 
        
            const { title } = req.body;
            if (!title) {
                return res.status(400).json({ success: false, message: 'Title is required.' });
            }
        
            const data = { title, token: actualToken }; 
            activityController.ADD_USER_ACTIVITY(data, function (respData) {
                res.status(respData.status).json(respData.data);
            });
        });

        app.put('/mark-checked', authenticate, (req, res) => {
            console.log("Decoded User from Token:", req.user); 
        
            if (!req.user || !req.user._id) {
                return res.status(401).json({ success: false, message: "Unauthorized: Invalid token." });
            }
        
            const userId = req.user._id; 
            const { activityId } = req.body;
        
            if (!activityId) {
                return res.status(400).json({ success: false, message: 'Activity ID is required.' });
            }
        
            const data = { activityId, userId };
        
            activityController.MARK_CHECKED(data, function (respData) {
                res.status(respData.status).json(respData.data);
            });
        });  
        
        app.get('/get-activities', authenticate, (req, res) => {
            const userId = req.user._id; 

            activityController.GET_ACTIVITIES({ userId }, function(respData) {
                res.status(respData.status).json(respData.data);
            });
        });      
        
}
}