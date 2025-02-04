module.exports = {
	BindUrl: function () {
	    app.post("/signup", function (req, res) {
	    	const { name, email, password,type } = req.body;

	    	// Email format validation
			const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
			// Password length validation
			const validatePassword = (password) => password.length >= 8;

		    if (!name || !email || !password) {
		        return res.status(400).json({ success: false, message: 'All fields are required.' });
		    }
		    // Email validation
		    if (!emailRegex.test(email)) {
		        return res.status(400).json({ success: false, message: 'Invalid email format. ' });
		    }
		    // Password validation
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

	    	// Email format validation
			const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
			
			// Password length validation
			const validatePassword = (password) => password.length >= 8;

		    if (!email || !password) {
		        return res.status(400).json({ success: false, message: 'All fields are required.' });
		    }
		     // Email validation
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

    // Validate inputs
    if (!email || !otp || !newPassword) {
        return res.status(400).json({ success: false, message: 'Email, OTP, and new password are required.' });
    }

    // Password length validation
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
		app.post("/edit-profile", function (req, res) {
			const { userId, newname, newEmail } = req.body;

			// Validate that all necessary fields are provided
			if (!userId || !newname || !newEmail) {
				return res.status(400).json({ success: false, message: 'userId, newname, and newEmail are required.' });
			}

			var data = req.body;
			usersController.EDIT_PROFILE(data, function(respData) {
				res.status(respData.status).json(respData.data);
			});
		});
		app.post("/change-password", function (req, res) {
			const { userId, oldPassword, newPassword, confirmPassword } = req.body;
	  
			// Validate that all necessary fields are provided
			if (!userId || !oldPassword || !newPassword || !confirmPassword) {
			  return res.status(400).json({ success: false, message: 'userId, oldPassword, newPassword, and confirmPassword are required.' });
			}
			if (newPassword !== confirmPassword) {
				var sendData = {
				  status: 400,
				  data: { success: false, message: 'New password and confirm password do not match.' }
				};
				callback(sendData);
				return;
			  }  
			var data = req.body;
			usersController.CHANGE_PASSWORD(data, function(respData) {
			  res.status(respData.status).json(respData.data);
			});
		});	  
	}
}

