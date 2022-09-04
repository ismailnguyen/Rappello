const { fetchRss } = require('./fetchRss')
const { sendEmail } = require('./email')

exports.notify = async function (email) {
    if (!email) {
        throw 'Please provide an email'
    }

    try {
        let rss = await fetchRss()
    
        try {
            let mailSentResult = await sendEmail({
                recipient: email,
                subject: rss.title,
                content: rss.content
            })
        
             return response.send(mailSentResult)
        }
        catch (error) {
            throw error
        }
    }
    catch (error) {
        throw error
    }
}
