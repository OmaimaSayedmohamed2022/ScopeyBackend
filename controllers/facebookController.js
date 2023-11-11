require('dotenv').config()
// ========== Start Models ==========
const User = require('../models/userSchema')
// ========== End Models ==========
const jwt = require('jsonwebtoken')
const validation = require('../config/validation')


const facebook = async (accessToken, refreshToken, profile, cb) => {
    const user = await User.findOne({
        accountId: profile.id,
        provider: 'facebook',
    });
    if (!user) {
        console.log('Adding new facebook user to DB..');
        const user = new User({
            accountId: profile.id,
            username: profile.displayName,
            provider: profile.provider,
        });
        await user.save();

        return cb(null, profile);
    } else {
        // المفروض نتحقق ان المستخدم موجود عادى فى قاعدة البيانات + التحقق من ان المستخدم ده عنده توكن
        // هنا لو المستخدم بيحمل قيمة التوكن ياريت تبعتوها 
        console.log('Facebook User already exist in DB..');
        // console.log("PPROFILE ===> " + profile);

        return cb(null, profile);
    }
}

const facebook_callback_get = (req, res) => {
    // Successful authentication, redirect to success screen.
    res.redirect('http://localhost:3000/api/auth/facebook/success');
}

const facebook_success_get = async (req, res) => {

    const accountId = req.session.passport.user.id
    const provider = req.session.passport.user.provider
    const user = await User.findOne({ accountId: accountId })

    const token = jwt.sign({ userId: user._id, provider: provider }, process.env.KEY_TOKEN)

    if (user.tokens.length >= process.env.COUNT_TOKEN) {
        return res.status(500).json({ status: 0, message: `You do not have the authority to own more than ${process.env.COUNT_TOKEN} devices` })
    }

    try {
        user.tokens.push(token)
        await user.save()
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }


    return res.status(201).json({ status: 1, success: 'Logged Successfully', token: token, provider: provider })
}

const facebook_error_get = (req, res) => {
    return res.status(500).json({ status: 0, error: "Error logging in via Facebook." })
}

const facebook_signout_get = async (req, res) => {
    // بعد مسح الجلسة امسح التوكن بتاع الحساب اللى متسجل فى قاعدة البيانات

    const { userId } = req.decoded_token 

    console.log("ID ==> " + userId)
 
    try {

        await User.updateMany({_id: userId}, { $set: { tokens: [] } })


        req.session.destroy(function (err) {
            console.log('session destroyed........');
        });

        return res.status(200).json({ status: 1, success: 'logout Successfully' })

        // res.render('auth');
    } catch (err) {
        res.status(400).send({ message: 'Failed to sign out fb user' })
    }
}

module.exports = {
    facebook,
    facebook_callback_get,
    facebook_success_get,
    facebook_error_get,
    facebook_signout_get
}