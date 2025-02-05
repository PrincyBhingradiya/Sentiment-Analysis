const authenticate = require('../middleware/authenticate'); 

module.exports = {
	BindUrl: function () {
	    app.post("/signup", function (req, res) {
	    	const { name, email, password,type } = req.body;

			const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
			const validatePassword = (password) => password.length >= 8;

		    if (!name || !email || !password) {
		        return res.status(400).json({ success: false, message: 'All fields are required.' });
		    }
		    if (!emailRegex.test(email)) {
		        return res.status(400).json({ success: false, message: 'Invalid email format. ' });
		    }
		    if (!validatePassword(password)) {
		        return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long.' });
		    }

		    var data = req.body;
			usersController.REGISTER(data, function(respData) {
	    		res.status(respData.status).json(respData.data);
	    	});
	    });

	    app.post("/login", function (req, res) {
	    	const { email, password ,keepMeSignedIn} = req.body;

			const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
			
			const validatePassword = (password) => password.length >= 8;

		    if (!email || !password) {
		        return res.status(400).json({ success: false, message: 'All fields are required.' });
		    }
		     if (!emailRegex.test(email)) {
		        return res.status(400).json({ success: false, message: 'Invalid email format.' });
		    }

			var data = { email, password, keepMeSignedIn };
			usersController.LOGIN(data, function(respData) {
	    		res.status(respData.status).json(respData.data);
	    	});
	    });
		app.post("/forgot",function(req,res){
			const { email } = req.body;
			if (!email) {
		    	return res.status(400).json({ success: false, message: 'email is required.' });
		    }

			var data = req.body;
			usersController.FORGOT(data, function(respData) {
				res.status(respData.status).json(respData.data);
			});
		});
		app.post("/reset", function (req, res) {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
        return res.status(400).json({ success: false, message: 'Email, OTP, and new password are required.' });
    }

    const validatePassword = (password) => password.length >= 8;
    if (!validatePassword(newPassword)) {
        return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long.' });
    }

    var data = req.body;
    usersController.RESET(data, function(respData) {
        res.status(respData.status).json(respData.data);
    });
		});
		app.post("/logout", function (req, res) {
		const token  = req.headers['authorization'];
	
		if (!token) {
			return res.status(400).json({ success: false, message: 'Token is required.' });
		}
		const actualToken = token.split(' ')[1];
	
		var data = { token : actualToken };
		usersController.LOGOUT(data, function(respData) {
			res.status(respData.status).json(respData.data);
		});
		});
		app.post("/edit-profile", authenticate, function (req, res) {
		
			if (!req.user || !req.user._id) {
				return res.status(401).json({ success: false, message: "Unauthorized: Invalid token." });
			}
		
			const userId = req.user._id; 
			const { newname, newEmail } = req.body;
		
			if (!newname || !newEmail) {
				return res.status(400).json({ success: false, message: "newname and newEmail are required." });
			}
		
			const data = { userId, newname, newEmail };
		
			usersController.EDIT_PROFILE(data, function(respData) {
				res.status(respData.status).json(respData.data);
			});
		});
		
		app.post("/change-password", authenticate, function (req, res) {
		
			if (!req.user || !req.user._id) {
				return res.status(401).json({ success: false, message: "Unauthorized: Invalid token." });
			}
		
			const userId = req.user._id; // Extract userId from token
			const { oldPassword, newPassword, confirmPassword } = req.body;
		
			if (!oldPassword || !newPassword || !confirmPassword) {
				return res.status(400).json({ success: false, message: "Old password, new password, and confirm password are required." });
			}
		
			if (newPassword !== confirmPassword) {
				return res.status(400).json({ success: false, message: "New password and confirm password do not match." });
			}
		
			const data = { userId, oldPassword, newPassword };
		
			usersController.CHANGE_PASSWORD(data, function (respData) {
				res.status(respData.status).json(respData.data);
			});
		}); 
	}
}

