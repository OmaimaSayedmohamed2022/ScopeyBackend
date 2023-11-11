// const bcrypt = require('bcrypt');
// const { sendResetPasswordEmail} = require('./emailServices');
// const User = require('../models/user');

// const resetPasswordAndSendEmail = async (email, newPassword) => {
//   try {
//     const user = await User.findOne({ email });

//     if (!user) {
//       throw new Error('User not found');
//     }

//     // Set the new password
//     user.password = newPassword;

//     // Hash the new password
//     const salt = await bcrypt.genSalt(10);
//     user.password = await bcrypt.hash(newPassword, salt);

//     // Save the updated user
//     await user.save();

//     // Send reset password email
//     const emailSent = await sendResetPasswordEmail(
//       email,
//       'Password Reset',
//       'Your password has been reset successfully.'
//     );

//     if (emailSent) {
//       return { success: true, message: 'Password reset successfully. Check your email.' };
//     } else {
//       throw new Error('Error sending reset password email');
//     }
//   } catch (error) {
//     console.error('Error resetting password:', error);
//     return { success: false, message: error.message };
//   }
// };
// ////////login 

// const findByCredentials = async (email, password) => {
//   const user = await User.findOne({ email });

//   if (!user) {
//     throw new Error('Invalid login credentials');
//   }

//   const isMatch = await bcrypt.compare(password, user.password);

//   if (!isMatch) {
//     throw new Error('Invalid login credentials');
//   }

//   return user;
// };

// module.exports = { resetPasswordAndSendEmail,findByCredentials};
