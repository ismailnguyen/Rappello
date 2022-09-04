const controller = require('../../controller')

const nodemailer = require('nodemailer')

const {
    EXPEDITOR_EMAIL,
    EXPEDITOR_PASSWORD,
    SMTP_HOST,
    SMTP_PORT
} = require('../../config')

const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    auth: {
        user: EXPEDITOR_EMAIL,
        pass: EXPEDITOR_PASSWORD,
    }
})

exports.handler = async function (event, context) {
    let body = '';

    const mail = {
        recipient: event.queryStringParameters.email,
        subject: 'toto',//data.title,
        content: 'test'//data.content
    };

    try {
        const result = await transporter.sendMail({
            from: EXPEDITOR_EMAIL,
            to: mail.recipient,
            subject: mail.subject,
            html: mail.content
        })

        console.log('result mail', result, mail)
    
        body = 'Mail sent to ' + mail.recipient;
    }
    catch(error) {
        return {
            statusCode: 410,
            body: error
        }
    }

    return {
        statusCode: 200,
        body: body
    }
};