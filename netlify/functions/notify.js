const controller = require('../../controller')

const axios = require('axios')
const { XMLParser } = require('fast-xml-parser');
const xmlParser = new XMLParser();

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

    try {
        const res = await axios.get('https://rappel.conso.gouv.fr/rss')

        if (!res || !res.data) {
            body = 'Error: Unable to fetch the RSS feed or empty data'
            return
        }

        const data = xmlParser.parse(res.data)

        if (!data || !data.rss || !data.rss.channel || !data.rss.channel.item) {
            body = 'Error: Unable to parse the RSS feed'
            return
        }

        const { title, item } = data.rss.channel

        if (!title || !item || !item.length) {
            body = 'Error: RSS feed is empty'
            return
        }

        const mail = {
            recipient: event.queryStringParameters.email,
            subject: title,
            content: item.map(item => `
                <a href="${ item.link }"><b>${ item.title }</b></a>:
                <br>
                <small>${ item.description }</small>
            `).join('<br><br>')
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
            body = error;
        }
    } catch (error) {
        body = error;

    }

    

    return {
        statusCode: 200,
        body: body
    }
};