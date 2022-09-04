const { fetchRss } = require('./fetchRss')
const { sendEmail } = require('./email')

exports.notify = async function (request, response) {
    const email = request.query.email;

    if (!email) {
        response.send('Please provide an email')
        return
    }

    await fetchRss(
        async (data) => await sendEmail(
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
