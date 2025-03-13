const User = require('../models/users');
const forgotPassword = require('../models/forgot');

module.exports = {
	REGISTER: async function (data, callback) {
		const { name, email, password, type, googleId,fcmToken } = data;
	
		try {
			const emailLower = email.toLowerCase();
			const existingUser = await User.findOne({ email: emailLower });
	
			if (existingUser) {
				if (existingUser.isBlocked) {
					return callback({
						status: 403,
						data: { success: false, message: "This account is blocked. Contact admin for assistance." }
					});
				}
				return callback({
					status: 400,
					data: { success: false, message: "Email already registered." }
				});
			}
	
			let hashedPassword = password ? await bcrypt.hash(password, 10) : null;
			const userType = emailLower === "princybhingradiya9912@gmail.com" ? "admin" : type || "user";
	
			const newUser = new User({
				name,
				email: emailLower,
				password: hashedPassword,
				type: userType,
				googleId: googleId || null,
				isBlocked: false,
				fcmToken: fcmToken || null, 
			});
	
			await newUser.save();
	
			const token = jwt.sign(
				{ email: newUser.email, _id: newUser._id, type: newUser.type, googleId: newUser.googleId || null },
				JWT_SECRET,
				{ expiresIn: "3h" }
			);
	
			return callback({
				status: 201,
				data: { success: true, message: "User registered successfully.", token }
			});
	
		} catch (error) {
			console.error("Signup error:", error);
			return callback({
				status: 500,
				data: { success: false, message: "Server error.", error: error.message }
			});
		}
	},
	
	LOGIN: async function (data, callback) {
		const { email, password, googleId, keepMeSignedIn,fcmToken  } = data;
		try {
			const emailLower = email.toLowerCase();
			const user = await User.findOne({ email: emailLower });
	
			if (!user) {
				return callback({
					status: 404,
					data: { success: false, message: "User not found." }
				});
			}
			
			if (user.isBlocked) {
				return callback({
					status: 403,
					data: { success: false, message: "Your account is blocked. Contact admin." }
				});
			}
	
			let tokenOptions = keepMeSignedIn ? { expiresIn: "30d" } : { expiresIn: "3h" };
	
			if (googleId) {
				if (user.googleId !== googleId) {
					return callback({
						status: 400,
						data: { success: false, message: "Google account mismatch. Try logging in with password." }
					});
				}
			} else {
				const isPasswordValid = await bcrypt.compare(password, user.password);
				if (!isPasswordValid) {
					return callback({
						status: 401,
						data: { success: false, message: "Invalid credentials." }
					});
				}
			}
			 // Update FCM Token if provided
			 if (fcmToken) {
				user.fcmToken = fcmToken;
				await user.save();
			}
	
			// JWT Token both manual & Google login
			const token = jwt.sign(
				{ email: user.email, _id: user._id, type: user.type, googleId: user.googleId || null },
				JWT_SECRET,
				tokenOptions
			);
	
			// welcome msg for user and admin
			const welcomeMessage = user.type === "admin" ? "Welcome, Admin!" : `Welcome, ${user.email}!`;
	
			return callback({
				status: 200,
				data: { success: true, message: welcomeMessage, token }
			});
	
		} catch (error) {
			console.error("Login error:", error);
			return callback({
				status: 500,
				data: { success: false, message: "Server error.", error: error.message }
			});
		}
	},	
	BLOCK_UNBLOCK_USER: async function (data, callback) {
		const { email, action } = data;
		try {
			const emailLower = email.toLowerCase();
			const user = await User.findOne({ email: emailLower });	
	
			const userToModify = await User.findOne({ email: email.toLowerCase() });
	
			if (!userToModify) {
				return callback({
					status: 404,
					data: { success: false, message: "User not found." }
				});
			}
	
			if (action === "block") {
				userToModify.isBlocked = true;
				await userToModify.save();
				return callback({
					status: 200,
					data: { success: true, message: `${userToModify.email} has been blocked.` }
				});
			}
	
			if (action === "unblock") {
				userToModify.isBlocked = false;
				await userToModify.save();
				return callback({
					status: 200,
					data: { success: true, message: `${userToModify.email} has been unblocked.` }
				});
			}
	
			return callback({
				status: 400,
				data: { success: false, message: "Invalid action." }
			});
	
		} catch (error) {
			console.error("Block/Unblock error:", error);
			return callback({
				status: 500,
				data: { success: false, message: "Server error.", error: error.message }
			});
		}
	},
	
	DELETE_USER: async function (data, callback) {
		const { email } = data;
		try {
			const emailLower = email.toLowerCase();
			const user = await User.findOne({ email: emailLower });	
	
			const userToDelete = await User.findOne({ email: email.toLowerCase() });
	
			if (!userToDelete) {
				return callback({
					status: 404,
					data: { success: false, message: "User not found." }
				});
			}
	
			await userToDelete.deleteOne();
	
			return callback({
				status: 200,
				data: { success: true, message: `${userToDelete.email} has been deleted.` }
			});
	
		} catch (error) {
			console.error("Delete user error:", error);
			return callback({
				status: 500,
				data: { success: false, message: "Server error.", error: error.message }
			});
		}
	},	

	googleAuth:async (data, callback) => {
		console.log("Received Data:", data); 
		const { idToken } = data;
		if (!idToken) {
			return callback({ success: false, message: "Token is required." });
		}
	},
	
	GET_ALL_USERS: async function(searchQuery, callback) {
		try {
			let filter = {
				email: { $ne: "princybhingradiya9912@gmail.com" } // Exclude admin by email
			};
	
			if (searchQuery) {
				filter.$or = [
					{ name: { $regex: searchQuery, $options: "i" } },
					{ email: { $regex: searchQuery, $options: "i" } }
				];
			}
	
			const users = await User.find(filter, { name: 1, email: 1, _id: 0 }); // Only fetch name & email
	
			return callback({
				status: 200,
				data: { success: true, users }
			});
	
		} catch (error) {
			console.error("Fetch users error:", error);
			return callback({
				status: 500,
				data: { success: false, message: "Server error", error: error.message }
			});
		}
	},
	
	
	SEARCH_USERS: async function(searchQuery, callback) {
		try {
			let filter = {
				$or: [
					{ name: { $regex: searchQuery, $options: "i" } },
					{ email: { $regex: searchQuery, $options: "i" } }
				],
				// Exclude the admin's email and username
				$and: [
					{ email: { $ne: "princybhingradiya9912@gmail.com" } },
					{ name: { $ne: "princy" } } // Replace "princy" with the admin's actual username
				]
			};
	
			const users = await User.find(filter, { password: 0 }); // Exclude passwords for security
	
			if (users.length === 0) {
				return callback({
					status: 404,
					data: { success: false, message: "Sorry! User not found." }
				});
			}
	
			return callback({
				status: 200,
				data: { success: true, users }
			});
	
		} catch (error) {
			console.error("Search users error:", error);
			return callback({
				status: 500,
				data: { success: false, message: "Server error", error: error.message }
			});
		}
	},
	

	FORGOT:async function(data, callback) {
			const { email } = data;
		try {
			const user= await User.findOne({ email });
			if (!user) {
				var sendData = {
					status: 404,
					data: { success: false, message: 'User not found.' }
				};
				callback(sendData);
				return;
			}
			console.log("User found:", user);

			console.log("process.env.JWT_SECRET", process.env.JWT_SECRET);
			let min = 100000;
			let max = 999999;
			let random = Math.floor(Math.random() * (max - min + 1)) + min;

			const newforgotPassword = new forgotPassword({ email: email.toLowerCase(), otp: random });
			await newforgotPassword.save(); 
	
			const message = `Hello there,
			Your reset password OTP is: ${random}
			Thank you!`;
			
			const transporter = nodemailer.createTransport({
				service: 'gmail',
				auth: {
					user: process.env.EMAIL_USER,
					pass: process.env.EMAIL_PASS
				},
			});
	
			const mailOptions = {
				from: process.env.EMAIL_USER,
				to: email,
				subject: 'Password Reset Request',
				text: message,
			};
	
			console.log("mailOptions", mailOptions);
	
			await transporter.sendMail(mailOptions);

			var sendData = {
				status: 200,
				data: { success: true, message: 'Password reset OTP sent to email', random }
			};
			callback(sendData);
			return;
		} catch (error) {
			var sendData = {
				status: 500,
				data: { success: false, message: 'Error sending email', error: error.message }
			};
			console.error("forgot password error:", error);
			callback(sendData);
			return;
		}
	},

	RESET: async function(data, callback) {
		const { email, otp, newPassword } = data;
	
		try {
			// Validate user and OTP
			const forgotEntry = await forgotPassword.findOne({ email: email.toLowerCase(), otp });
			if (!forgotEntry) {
				var sendData = {
					status: 404,
					data: { success: false, message: 'Invalid OTP or email.' }
				};
				callback(sendData);
				return;
			}
	
			const hashedPassword = await bcrypt.hash(newPassword, 10);
			const updatePassword = await User.updateOne({  email: email.toLowerCase()},{ $set: { password: hashedPassword } } );
	
			if (updatePassword.modifiedCount === 0) {
				var sendData = {
					status: 400,
					data: { success: false, message: 'Password update failed.' }
				};
				callback(sendData);
				return;
			}
	
			await forgotPassword.deleteOne({ email: email.toLowerCase(), otp });
	
			var sendData = {
				status: 200,
				data: { success: true, message: 'Password reset successful.' }
			};
			callback(sendData);
			return;
		} catch (error) {
			var sendData = {
				status: 500,
				data: { success: false, message: 'Server error.', error: error.message }
			};
			console.error("Reset password error:", error);
			callback(sendData);
			return;
		}
	},

	LOGOUT: async function(data, callback) {
		try {
			const { token } = data;	
			var sendData = {
				status: 200,
				data: { success: true, message: 'Logout successful.' }
			};
			callback(sendData);
			return;
		} catch (error) {
			var sendData = {
				status: 500,
				data: { success: false, message: 'Server error.', error: error.message }
			};
			console.error("Logout error:", error);
			callback(sendData);
			return;
		}
	},

	EDIT_PROFILE: async function(data, callback) {
		const { userId, newname, newEmail } = data;
		try {
			const existingUser = await User.findOne({ email: newEmail.toLowerCase() });
			if (existingUser && existingUser._id.toString() !== userId) {
				return callback({
					status: 400,
					data: { success: false, message: "Email is already taken by another user." }
				});
			}
	
			const updatedUser = await User.findByIdAndUpdate(
				userId,
				{ name: newname, email: newEmail.toLowerCase() },
				{ new: true }  
			);
	
			if (!updatedUser) {
				return callback({
					status: 404,
					data: { success: false, message: "User not found." }
				});
			}
	
			callback({
				status: 200,
				data: { success: true, message: "Profile updated successfully.", user: updatedUser }
			});
		} catch (error) {
			console.error("Error updating profile:", error);
			callback({
				status: 500,
				data: { success: false, message: "Server error.", error: error.message }
			});
		}
	},	
	
	CHANGE_PASSWORD: async function(data, callback) {
		const { userId, oldPassword, newPassword } = data;
	
		try {
			const user = await User.findById(userId);
	
			if (!user) {
				return callback({
					status: 404,
					data: { success: false, message: "User not found." }
				});
			}
	
			const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
	
			if (!isPasswordValid) {
				return callback({
					status: 400,
					data: { success: false, message: "Incorrect old password." }
				});
			}
	
			const hashedPassword = await bcrypt.hash(newPassword, 10);
			const updatePassword = await User.updateOne({ _id: userId }, { $set: { password: hashedPassword } });
	
			if (updatePassword.modifiedCount === 0) {
				return callback({
					status: 400,
					data: { success: false, message: "Password update failed." }
				});
			}
	
			callback({
				status: 200,
				data: { success: true, message: "Password updated successfully." }
			});
		} catch (error) {
			console.error("Change password error:", error);
			callback({
				status: 500,
				data: { success: false, message: "Server error.", error: error.message }
			});
		}
	}
		
}
