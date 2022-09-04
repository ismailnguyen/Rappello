const axios = require('axios')
const { XMLParser } = require('fast-xml-parser');
const xmlParser = new XMLParser();

exports.fetchRss = async function (success, failure) {
    try {
        const res = await axios.get('https://rappel.conso.gouv.fr/rss')

        if (!res || !res.data) {
            failure('Error: Unable to fetch the RSS feed or empty data')
            return
        }

        console.log('enter then fetchRss')

        console.log('rss res', res)

        const data = xmlParser.parse(res.data)

        if (!data || !data.rss || !data.rss.channel || !data.rss.channel.item) {
            failure('Error: Unable to parse the RSS feed')
            return
        }

        const { title, item } = data.rss.channel

        if (!title || !item || !item.length) {
            failure('Error: RSS feed is empty')
            return
        }

        success({
            title: title,
            content: item.map(item => `
                <a href="${ item.link }"><b>${ item.title }</b></a>:
                <br>
                <small>${ item.description }</small>
            `).join('<br><br>')
        })
    } catch (error) {
        failure(error)
    }
}
