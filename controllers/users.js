const User = require('../models/users');
const forgotPassword = require('../models/forgot');

module.exports = {
	REGISTER: async function(data, callback) {
		const { name, email, password,type } = data;
		try {
	        const emailLower = email.toLowerCase();
	        const existingUser = await User.findOne({ email: emailLower }); // Use Mongoose to find the user
	        if (existingUser) {
				var sendData = {
					status: 400,
					data: { success: true, message: 'User already exist.' }
				};
			}

	        const hashedPassword = await bcrypt.hash(password, 10);
	        const newUser = new User({ name, email: email.toLowerCase(), password: hashedPassword, type: type || "user" });
	        await newUser.save(); // Save the user in the database

	        var sendData = {
	        	status: 201,
	        	data: { success: true, message: 'User registered successfully.' }
	        };
	        callback(sendData);
			return;
	    } catch (error) {
	    	var sendData = {
	        	status: 500,
	        	data: { success: false, message: 'Server error.', error: error.message }
	        };
	        console.error("Signup error:", error);
	        callback(sendData);
	    }
	},
	LOGIN: async function(data, callback) {
		const { email, password,keepMeSignedIn } = data;
		try {
	        const emailLower = email.toLowerCase();
	        const user = await User.findOne({ email: emailLower }); // Use Mongoose to find the user
	        if (!user) {
	        	var sendData = {
		        	status: 404,
		        	data: { success: false, message: 'User not found.' }
		        };
		        callback(sendData);
				return;
	        }
	        console.log("User found:", user);

	        const isPasswordValid = await bcrypt.compare(password, user.password);
	        // console.log("Password valid:", isPasswordValid);
	        
	        if (!isPasswordValid) {
	            var sendData = {
		        	status: 401,
		        	data: { success: false, message: 'Invalid credentials.' }
		        };
		        callback(sendData);
				return;
	        }
			let tokenOptions = keepMeSignedIn ? { expiresIn: '30d' } : {};
        const token = jwt.sign(
            { email: user.email, _id: user._id },
            JWT_SECRET,
            tokenOptions
        );

		let welcomeMessage = user.type === "admin" 
            ? "Welcome Admin" 
            : `Welcome ${user.email}`;
	        
	        var sendData = {
	        	status: 200,
	        	data: { success: true,welcomeMessage:welcomeMessage, message: 'Login successful.', token }
	        };
	        callback(sendData);
	    } catch (error) {
	        var sendData = {
	        	status: 500,
	        	data: { success: false, message: 'Server error.', error: error.message }
	        };
	        console.error("Signup error:", error);
	        callback(sendData);
	    }
	},
	FORGOT:async function(data, callback) {
			const { email } = data;
		try {
			// Check if the user exists in the database
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
			// generate otp
			let min = 100000;
			let max = 999999;
			let random = Math.floor(Math.random() * (max - min + 1)) + min;

			const newforgotPassword = new forgotPassword({ email: email.toLowerCase(), otp: random });
	        await newforgotPassword.save(); // Save the user in the database
	
			// Send reset link via email
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
	
			// Update the user's password
			const hashedPassword = await bcrypt.hash(newPassword, 10);
			const updatePassword = await User.updateOne({  email: email.toLowerCase()},{ $set: { password: hashedPassword } } );
			// await updatePassword.save();
	
			if (updatePassword.modifiedCount === 0) {
				var sendData = {
					status: 400,
					data: { success: false, message: 'Password update failed.' }
				};
				callback(sendData);
				return;
			}
	
			// Clean up the OTP entry
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
			// Check if the email is already in use by another user
			const existingUser = await User.findOne({ email: newEmail.toLowerCase() });
			if (existingUser && existingUser._id.toString() !== userId) {
				return callback({
					status: 400,
					data: { success: false, message: 'Email is already taken by another user.' }
				});
			}

			// Update user data (username and email)
			const updatedUser = await User.findByIdAndUpdate(
				userId,
				{ name: newname, email: newEmail.toLowerCase() },
				{ new: true }  // return the updated user
			);

			if (!updatedUser) {
				return callback({
					status: 404,
					data: { success: false, message: 'User not found.' }
				});
			}

			callback({
				status: 200,
				data: { success: true, message: 'Profile updated successfully.', user: updatedUser }
			});
		} catch (error) {
			console.error("Error updating profile:", error);
			callback({
				status: 500,
				data: { success: false, message: 'Server error.', error: error.message }
			})
		}
	},
	CHANGE_PASSWORD: async function(data, callback) {
		const { userId, oldPassword, newPassword, confirmPassword } = data;
	
		try {
		  // Find the user by ID
		  const user = await User.findById(userId);
	
		  if (!user) {
			var sendData = {
			  status: 404,
			  data: { success: false, message: 'User not found.' }
			};
			return callback(sendData);
		  }
	
		  // Compare the old password with the stored password
		  const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
		  
		  if (!isPasswordValid) {
			var sendData = {
			  status: 400,
			  data: { success: false, message: 'Incorrect old password.' }
			};
			return callback(sendData);
		  }
	
		  // Hash the new password and update it in the database
		//   const hashedPassword = await .hash(newPassword, 10);
		  const updatePassword = await User.updateOne({ _id: userId }, { $set: { password: hashedPassword } });
	
		  if (updatePassword.modifiedCount === 0) {
			var sendData = {
			  status: 400,
			  data: { success: false, message: 'Password update failed.' }
			};
			return callback(sendData);
		  }
	
		  var sendData = {
			status: 200,
			data: { success: true, message: 'Password updated successfully.' }
		  };
		  callback(sendData);
	
		} catch (error) {
		  var sendData = {
			status: 500,
			data: { success: false, message: 'Server error.', error: error.message }
		  };
		  console.error("Change password error:", error);
		  callback(sendData);
		}
	},	
}
