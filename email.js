const nodemailer = require('nodemailer')

const {
    EXPEDITOR_EMAIL,
    EXPEDITOR_PASSWORD,
    SMTP_HOST,
    SMTP_PORT
} = require('./config')

exports.sendEmail = async function (mail, success, failure) {
    const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        auth: {
            user: EXPEDITOR_EMAIL,
            pass: EXPEDITOR_PASSWORD,
        }
    })

    console.log('EXPEDITOR_EMAIL', EXPEDITOR_EMAIL)

    try {
        const result = await transporter.sendMail({
            from: EXPEDITOR_EMAIL,
            to: mail.recipient,
            subject: mail.subject,
            html: mail.content
        })
    
        success('Mail sent to ' + mail.recipient)
    }
    catch(error) {
        failure(error)
    }
}