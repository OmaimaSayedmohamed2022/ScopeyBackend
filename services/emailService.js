require('dotenv').config()
const nodemailer = require('nodemailer')


function sendEmail(to, subject, text, res){
    const emailConfig = {
        service: process.env.SERVICE,
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false, // قد تحتاج إلى true إذا كنت تستخدم SSL/TLS
        auth: {
            user: process.env.EMAIL,
            pass: process.env.DEVELOPER_KEY,
        },
        tls: {
            rejectUnauthorized: false, // تعطيل التحقق من الشهادة (قد تحتاج إلى هذا إذا كنت تستخدم خادمًا محليًا)
        },
    }

    const transporter = nodemailer.createTransport(emailConfig)

    const mailOptions = {
        from: process.env.EMAIL,
        to: to,
        subject: subject,
        text: text,
    }

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return res.status(500).json({ status: 0, message: "Error while sending email", error: error })
        } else {
            return res.status(201).json({ status: 1, success: "Check Your Email" })
        }
    })
}


module.exports = sendEmail