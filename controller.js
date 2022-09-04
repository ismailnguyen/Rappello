const { fetchRss } = require('./fetchRss')
const { sendEmail } = require('./email')

exports.notify = async function (email) {
    if (!email) {
        throw 'Please provide an email'
    }

    try {
        let rss = await fetchRss()
    
        try {
            return await sendEmail({
                recipient: email,
                subject: rss.title,
                content: rss.content
            })
        }
        catch (error) {
            throw error
        }
    }
    catch (error) {
        throw error
    }
}
