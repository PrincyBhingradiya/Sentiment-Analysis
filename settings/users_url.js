const express = require("express");
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const { googleAuth } = require('../controllers/authController');


module.exports = {
	BindUrl: function () {
		app.post("/signup", function (req, res) {
			const { name, email, password,type, googleId, fcmToken  } = req.body;

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

			var data = { name, email, password, type, googleId, fcmToken  };
			usersController.REGISTER(data, function(respData) {
				res.status(respData.status).json(respData.data);
			});
		});

		app.post("/login", async function (req, res) {  // ✅ Mark route handler as async
			const { email, password, keepMeSignedIn, fcmToken } = req.body;
		
			const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
			const validatePassword = (password) => password.length >= 8;
		
			if (!email || !password) {
				return res.status(400).json({ success: false, message: "All fields are required." });
			}
			if (!emailRegex.test(email)) {
				return res.status(400).json({ success: false, message: "Invalid email format." });
			}
		
			const data = { email, password, keepMeSignedIn, fcmToken }; // ✅ Include fcmToken
			usersController.LOGIN(data, async function (respData) {
				if (respData.status === 200 && fcmToken) {
					// ✅ Call the function to update FCM Token separately
					await updateFcmToken(email, fcmToken);
				}
				res.status(respData.status).json(respData.data);
			});
		});
		

		app.post("/admin/block-unblock", authenticate ,function (req, res) {
			const { email, action } = req.body;
		
			const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
			if (!email || !action ) {
				return res.status(400).json({ success: false, message: 'Email and action are required.' });
			}
			if (!emailRegex.test(email)) {
				return res.status(400).json({ success: false, message: 'Invalid email format.' });
			}
		
			const data = { email, action };
			usersController.BLOCK_UNBLOCK_USER(data, function(respData) {
				res.status(respData.status).json(respData.data);
			});
		});

		app.post("/admin/delete-user",authenticate, function (req, res) {
			const { email } = req.body;
		
			const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
			if (!email ) {
				return res.status(400).json({ success: false, message: 'Email is required.' });
			}
			if (!emailRegex.test(email)) {
				return res.status(400).json({ success: false, message: 'Invalid email format.' });
			}
		
			const data = { email };
			usersController.DELETE_USER(data, function(respData) {
				res.status(respData.status).json(respData.data);
			});
		});
		

		//google auth(signup & signin)
		app.post("/google", function(req, res) {
			
			var data = req.body;
			googleAuth(data, function(respData) {
				res.send(respData);
			});
		});
		
		app.get("/all-users", function (req, res) {
			const searchQuery = req.query.search || "";
		
			usersController.GET_ALL_USERS(searchQuery, function(respData) {
				res.status(respData.status).json(respData.data);
			});
		});		
		
		app.post("/search-users", function (req, res) {
			const { search } = req.body;  // Read search term from request body
		
			if (!search || search.trim() === "") {
				return res.status(400).json({ success: false, message: "Search query is required." });
			}
		
			usersController.SEARCH_USERS(search, function(respData) {
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

	// app.post('/update-fcm-token', authenticate, async (req, res) => {
		// 	const { fcmToken } = req.body;
		// 	const userId = req.user._id;
		
		// 	try {
		// 		await User.findByIdAndUpdate(userId, { fcmToken });
		// 		res.json({ success: true, message: 'FCM Token updated successfully' });
		// 	} catch (error) {
		// 		res.status(500).json({ success: false, message: 'Server error', error: error.message });
		// 	}
		// });