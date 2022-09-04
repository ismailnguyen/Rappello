const controller = require('../../controller')

exports.handler = async function (event, context) {
    let body = '';

    const request = {
        query: {
            email: event.queryStringParameters.email
        }
    };

    const response = {
        send: (result) => {
            body = result;
            console.log('result', result);
        }
    };


        console.log('calling sendEmail from start point')
        const { sendEmail } = require('../../email')
        sendEmail(
            {
                recipient: request.query.email,
                subject: 'data.title',
                content: 'data.content'
            },
            (mailSendResult) => console.log(mailSendResult),
            (failure) => console.log(failure)
        )
};