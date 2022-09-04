const nodemailer = require('nodemailer')

const {
    EXPEDITOR_EMAIL,
    EXPEDITOR_PASSWORD,
    SMTP_HOST,
    SMTP_PORT
} = require('./config')

exports.sendEmail = async function (mail) {
    const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        auth: {
            user: EXPEDITOR_EMAIL,
            pass: EXPEDITOR_PASSWORD,
        }
    })

    try {
        await transporter.sendMail({
            from: EXPEDITOR_EMAIL,
            to: mail.recipient,
            subject: mail.subject,
            html: mail.content
        })

        return 'Mail sent to ' + mail.recipient
    }
    catch(error) {
        throw (error)
    }
}