require('dotenv').config();
const User = require('../models/userSchema');
const ResetPassword = require('../models/resetPasswordSchema');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sendEmail = require('../services/emailService');
const validation = require('../config/validation');

const user_register_post = async (req, res) => {
    try {
        const { userName, email, phone, password } = req.body;

        // Validation
        const emailValidation = validation(email, 'email');
        if (!emailValidation.valid) return res.status(400).json({ status: 0, message: emailValidation.message });

        const passwordValidation = validation(password, 'password');
        if (!passwordValidation.valid) return res.status(400).json({ status: 0, message: passwordValidation.message });

        const userNameValidation = validation(userName, 'string');
        if (!userNameValidation.valid) return res.status(400).json({ status: 0, message: userNameValidation.message });

        const phoneValidation = validation(phone, 'phone');
        if (!phoneValidation.valid) return res.status(400).json({ status: 0, message: phoneValidation.message });

        // Check if the email is unique
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ status: 0, message: 'Email already exists' });
        }

        const hashedPassword = bcrypt.hashSync(password, 10);
        const user = new User({ userName, email, phone, password: hashedPassword });

        await user.save();
        res.status(201).json({ status: 1, success: 'Inserted Successfully' });
    } catch (error) {
        res.status(500).json({ status: 0, message: 'Error registering user', error: error.message });
    }
};

const user_login_post = async (req, res) => {
    const { email, password } = req.body;
    try {
        // Validation
        const emailValidation = validation(email, 'email');
        if (!emailValidation.valid) return res.status(400).json({ status: 0, message: emailValidation.message });

        const passwordValidation = validation(password, 'password');
        if (!passwordValidation.valid) return res.status(400).json({ status: 0, message: passwordValidation.message });

        const user = await User.findOne({ email });

        if (!user || !bcrypt.compareSync(password, user.password)) {
            return res.status(401).json({ status: 0, message: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user._id }, process.env.KEY_TOKEN);

        // Check if user.tokens exists before pushing token
        if (!user.tokens) {
            user.tokens = [];
        }

        if (user.tokens.length >= process.env.COUNT_TOKEN) {
            return res.status(500).json({ status: 0, message: `You do not have the authority to own more than ${process.env.COUNT_TOKEN} devices` });
        }

        user.tokens.push(token);
        await user.save();

        return res.status(201).json({ status: 1, success: 'Logged Successfully', token });
    } catch (error) {
        res.status(500).json({ status: 0, message: 'Error logging in', error: error.message });
    }
};

const user_data_get = async (req, res) => {
    try {
        const decoded = req.decoded_token;
        const userId = decoded.userId;

        const user = await User.findById(userId).select('-_id -password -tokens -__v');

        if (!user) {
            return res.status(404).json({ status: 0, message: 'User not found' });
        }

        res.status(200).json({ status: 1, result: user });
    } catch (error) {
        res.status(500).json({ status: 0, error: error.message });
    }
};

const user_resetpassword_post = async (req, res) => {
    try {
        const { email } = req.body;
        const emailValidation = validation(email, 'email');
        if (!emailValidation.valid) return res.status(400).json({ status: 0, message: emailValidation.message });

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ status: 0, message: 'Invalid credentials' });
        }

        const resetPassword = new ResetPassword({ email: user.email });

        await resetPassword.save();

        const resetId = resetPassword._id;
        const token = jwt.sign({ email: user.email, resetId }, process.env.KEY_TOKEN);
       const resetPasswordLink = `${EMAIL_HOST}/api/user/updatepassword?token=${token}`
        const to = resetPassword.email;
        const subject = 'إعادة تعيين كلمة المرور';
        const text = `اضغط على الرابط التالي لإعادة تعيين كلمة المرور: ${resetPasswordLink}`;

        sendEmail(to, subject, text, res);
    } catch (error) {
        res.status(500).json({ status: 0, error: error.message });
    }
};

const user_updatepassword_patch = async (req, res) => {
    try {
        const { email, resetId } = req.decoded_token;
        const { newPassword } = req.body;

        const emailValidation = validation(email, 'email');
        if (!emailValidation.valid) return res.status(400).json({ status: 0, message: emailValidation.message });

        const passwordValidation = validation(newPassword, 'password');
        if (!passwordValidation.valid) return res.status(400).json({ status: 0, message: passwordValidation.message });

        const reset = await ResetPassword.findOne({ _id: resetId });

        if (!reset) {
            return res.status(400).json({ status: 0, message: 'Invalid reset link' });
        }

        if (reset.expire === true) {
            return res.status(400).json({ status: 0, message: 'Expire Link' });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ status: 0, message: 'User not found' });
        }

        const hashedPassword = bcrypt.hashSync(newPassword, 10);

        await User.updateOne({ _id: user._id }, { password: hashedPassword });

        await ResetPassword.updateOne({ _id: reset._id }, { expire: true });

        res.status(201).json({ status: 1, success: 'Successfully Changed' });
    } catch (error) {
        res.status(500).json({ status: 0, error: error.message });
    }
};

const user_logout_delete = async (req, res) => {
    try {
        const { userId } = req.decoded_token;
        const tokenToDelete = req.user_token;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ status: 0, message: 'User not found' });
        }

        const isFalse = user.tokens && !user.tokens.includes(tokenToDelete);

        if (isFalse) {
            return res.status(400).json({ status: 0, message: 'You were logged out by this token, please log in again.' });
        }

        if (user.tokens) {
            user.tokens = user.tokens.filter(token => token !== tokenToDelete);
        }

        await user.save();

        return res.status(200).json({ status: 1, success: 'User logged out' });
    } catch (error) {
        res.status(500).json({ status: 0, error: error.message });
    }
};

const user_update_patch = async (req, res) => {
    try {
        const { userId } = req.decoded_token;
        const data = Object.keys(req.body);

        // Validation
        const emailValidation = validation(req.body.email, 'email');
        if (!emailValidation.valid) return res.status(400).json({ status: 0, message: emailValidation.message });

        const passwordValidation = validation(req.body.password, 'password');
        if (!passwordValidation.valid) return res.status(400).json({ status: 0, message: passwordValidation.message });

        const userNameValidation = validation(req.body.userName, 'string');
        if (!userNameValidation.valid) return res.status(400).json({ status: 0, message: userNameValidation.message });

        const phoneValidation = validation(req.body.phone, 'phone');
        if (!phoneValidation.valid) return res.status(400).json({ status: 0, message: phoneValidation.message });

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ status: 0, message: 'User not found' });
        }

        const myFields = ['userName', 'password', 'email', 'phone'];

        if (Object.keys(data).length === 0) {
            return res.status(404).json({ status: 0, message: 'Not Found Data' });
        }

        myFields.forEach(field => {
            if (data.includes(field)) {
                user[field] = req.body[field];
            }
        });

        await user.save();

        return res.status(201).json({ status: 1, success: 'Successfully Changed' });
    } catch (error) {
        res.status(500).json({ status: 0, error: error.message });
    }
};

const user_delete = async (req, res) => {
    try {
        const { userId } = req.decoded_token;

        const user = await User.findByIdAndDelete(userId);

        if (!user) {
            return res.status(404).json({ status: 0, message: 'Not Found User' });
        }

        return res.status(200).json({ status: 1, success: 'Successfully Deleted' });
    } catch (error) {
        res.status(500).json({ status: 0, error: error.message });
    }
};

module.exports = {
    user_register_post,
    user_login_post,
    user_data_get,
    user_resetpassword_post,
    user_updatepassword_patch,
    user_logout_delete,
    user_update_patch,
    user_delete
};
