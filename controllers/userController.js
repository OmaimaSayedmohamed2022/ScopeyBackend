require('dotenv').config()
// ========== Start Models ==========
const User = require('../models/userSchema')
const ResetPassword = require('../models/resetPasswordSchema')
// ========== End Models ==========
const validator = require('validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const sendEmail = require('../services/emailService')
const validation = require('../config/validation')
const { hostname } = require('os')

const user_register_post = async (req, res) => {
    try {
        const { username, email, phone, password } = req.body
        console.log(req.body);
  
        const emailValidation = validation(email, 'emil')
        if (!validator.isEmail(emailValidation)) 
          return res.status(400).json({ status: 0, message: 'Email is INVALID' });
      

        const passwordValidation = validation(password, 'password')
        if (!passwordValidation.valid) return res.status(400).json({ status: 0, message: passwordValidation.message })

        const userNameValidation = validation(req.body.username, 'string')
        if (!userNameValidation.valid) return res.status(400).json({ status: 0, message: userNameValidation.message })

        const phoneValidation = validation(req.body.phone, 'phone')
        if (!phoneValidation.valid) return res.status(400).json({ status: 0, message: phoneValidation.message })
        
        // Check if the email is unique
        const existingEmail = await User.findOne({ email })
        if (existingEmail) {
            return res.status(400).json({ status: 0, message: 'Email already exists' })
        }
        
        const hashedPassword = bcrypt.hashSync(password, 10)
        // const decryptPassword = bcrypt.compareSync(password, hashedPassword)

        const user = new User({ username, email, phone, password: hashedPassword })
        try {
            await user.save()
            res.status(201).json({ status: 1, success: "Inserted Successfully" })
        } catch (error) {
            res.status(400).json({ status: 0, error: error.message })
        }
    } catch (error) {
        res.status(500).json({ status: 0, message: 'Error registering user', error: error.message })
    }
}

const user_login_post = async (req, res) => {

    const { email, password } = req.body

    try {
        // Validation
        const emailValidation = validation(email, 'email')
        if (!emailValidation.valid) return res.status(400).json({ status: 0, message: emailValidation.message })

        const passwordValidation = validation(password, 'password')
        if (!passwordValidation.valid) return res.status(400).json({ status: 0, message: passwordValidation.message })

        const user = await User.findOne({ email })

        if (!user || !bcrypt.compareSync(password, user.password)) {
            return res.status(401).json({ status: 0, message: 'Invalid credentials' })
        }
        
        // Add Provider (Email)
        const token = jwt.sign({ userId: user._id, provider: "email" }, process.env.KEY_TOKEN)

        if (user.tokens.length >= process.env.COUNT_TOKEN) {
            return res.status(500).json({ status: 0, message: `You do not have the authority to own more than ${process.env.COUNT_TOKEN} devices` })
        }

        try {
            user.tokens.push(token)
            await user.save()
        } catch (error) {
            return res.status(500).json({ error: error.message })
        }

        // Add Provider (Email)
        return res.status(201).json({ status: 1, success: 'Logged Successfully', token: token, provider: "email" })

    } catch (error) {
        return res.status(500).json({ status: 0, message: 'Error logging in', error: error.message })
    }

}

const user_data_get = async (req, res) => {
    const decoded = req.decoded_token
    const userId  = decoded.userId

    await User.findById(userId)
        .select('-_id')
        .select('-password')
        .select('-tokens')
        .select('-__v')
        .then((result) => {
            return res.status(200).json({status: 1, result})
        })
        .catch((error) => {
            return res.status(500).json({ status: 0, error: error.message })
        })
}

const user_resetpassword_post = async (req, res) => {

    try {
        const { email } = req.body

        const emailValidation = validation(email, 'email')
        if (!emailValidation.valid) return res.status(400).json({ status: 0, message: emailValidation.message })

        const user = await User.findOne({ email: email }).exec()

        if (!user) {
            return res.status(401).json({ status: 0, message: 'Invalid credentials' })
        }

        const resetPassword = new ResetPassword({ email: user.email })

        try {
            await resetPassword.save()
            const resetId = resetPassword._id
            const email = resetPassword.email
            const token = jwt.sign({ email: email, resetId: resetId }, process.env.KEY_TOKEN)

            const resetPasswordLink = `${hostname}/api/user/updatepassword?token=${token}`
            const to = resetPassword.email
            const subject = 'إعادة تعيين كلمة المرور'
            const text = `اضغط على الرابط التالي لإعادة تعيين كلمة المرور: ${resetPasswordLink}`

            sendEmail(to, subject, text, res)

        } catch (error) {
            return res.status(500).json({ status: 0, error: error })
        }

    } catch (error) {
        return res.status(500).json({ status: 0, error: error.message })
    }
}

const user_updatepassword_patch = async (req, res) => {
    const { email, resetId } = req.decoded_token
    const { newPassword } = req.body

    try {
        // Validation
        const emailValidation = validation(email, 'email')
        if (!emailValidation.valid) return res.status(400).json({ status: 0, message: emailValidation.message })

        const passwordValidation = validation(newPassword, 'password')
        if (!passwordValidation.valid) return res.status(400).json({ status: 0, message: passwordValidation.message })

        const reset = await ResetPassword.findOne({ _id: resetId }).exec()

        if (!reset) {
            return res.status(400).json({ status: 0, message: 'Invalid reset link' })
        }

        if (reset.expire === true) {
            return res.status(400).json({ status: 0, message: 'Expire Link' })
        }

        const user = await User.findOne({ email: email })
            .select('-password')
            .select('-tokens')
            .select('-__v')
            .exec()

        const hashedPassword = bcrypt.hashSync(newPassword, 10)

        try {
            await User.updateOne({ _id: user._id }, { password: hashedPassword })
                .then(() => {
                    res.status(201).json({ status: 1, success: "Successfully Changed" })
                })
                .catch((error) => {
                    return res.status(500).json({ status: 0, error: error.message })
                })
            await ResetPassword.updateOne({ _id: reset._id }, { expire: true })

        } catch (error) {
            return res.status(500).json({ status: 0, error: error.message })
        }


    } catch (error) {
        return res.status(500).json({ status: 0, error: error.message })
    }

}

const user_logout_delete = async (req, res) => {
    const { userId } = req.decoded_token
    const tokenToDelete = req.user_token

    const user = await User.findById({ _id: userId })

    const is_false = await User.findOne({ 'tokens': tokenToDelete })

    if (is_false === null) {
        return res.status(400).json({ status: 0, message: 'You/r Logged Out By This Token, Please Login Again.' })
    }

    try {
        user.tokens = user.tokens.filter(token => token !== tokenToDelete)
        await user.save()
        return res.status(200).json({ status: 1, success: "User Logged Out" })
    }
    catch (error) {
        return res.status(500).json({ status: 0, error: error })
    }
}

const user_update_patch = async (req, res) => {
    const { userId } = req.decoded_token
    const data = Object.keys (req.body)
    
    // Validation
    const emailValidation = validation(req.body.email, 'email')
    if (!emailValidation.valid) return res.status(400).json({ status: 0, message: emailValidation.message })

    const passwordValidation = validation(req.body.password, 'password')
    if (!passwordValidation.valid) return res.status(400).json({ status: 0, message: passwordValidation.message })

    const userNameValidation = validation(req.body.userName, 'string')
    if (!userNameValidation.valid) return res.status(400).json({ status: 0, message: userNameValidation.message })

    const phoneValidation = validation(req.body.phone, 'phone')
    if (!phoneValidation.valid) return res.status(400).json({ status: 0, message: phoneValidation.message })
    
    
    if (Object.keys(data).length === 0) {
        return res.status(404).json({ status: 0, message: "Not Found Data" })
    }  

    const user = await User.findById({ _id: userId })
    if (!user) {
        return res.status(404).json({ status: 0, message: "User Not Found" })
    }

    const my_Fields = ['username', 'password', 'email', 'phone']

    try {
        if (data.includes('password') && req.body.password) {
            const hashedPassword = bcrypt.hashSync(req.body.password, 10)
            await User.updateOne({_id: userId}, {password: hashedPassword})
        }
        my_Fields.forEach(field => {
            if (data.includes(field)) {
                user[field] = req.body[field]
            }
        });
        await user.save()
        return res.status(201).json({ status: 1, success: "Successfully Changed" })
    } catch (error) {
        return res.status(500).json({ status: 0, error: error.message })
    }
}

const user_delete = async (req, res) => {
    const { userId } = req.decoded_token

    try{
        const user = await User.findByIdAndDelete({_id: userId})
        if(!user){
            return res.status(404).json({status: 0, message: "Not Found User"})
        }
        return res.status(200).json({status: 1, success: "Successfully Deleted"})
    }catch(error){
        return res.status(500).json({ status: 0, error: error.message})
    }

}



module.exports = {
    user_register_post,
    user_login_post,
    user_data_get,
    user_resetpassword_post,
    user_updatepassword_patch,
    user_logout_delete,
    user_update_patch,
    user_delete,
}
/////////////////////////////////////////////////////
