const { fetchRss } = require('./fetchRss')
const { sendEmail } = require('./email')

exports.notify = function (request, response) {
    const email = request.query.email;

    if (!email) {
        response.send('Please provide an email')
        return
    }

    console.log('enter inside notify');

    fetchRss(
        (data) => sendEmail(
            {
                recipient: email,
                subject: data.title,
                content: data.content
            },
            (mailSendResult) => response.send(mailSendResult),
            (failure) => response.send(failure)
        ),
        (failure) => response.send(failure)
    )
}
